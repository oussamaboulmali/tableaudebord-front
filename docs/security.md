# Security Documentation

## Overview

This document outlines the comprehensive security measures, best practices, and protocols implemented in the APS Editorial Management System to protect against various security threats and ensure data integrity.

---

## Table of Contents

- [Security Architecture](#security-architecture)
- [Authentication Security](#authentication-security)
- [Authorization & Access Control](#authorization--access-control)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [XSS Prevention](#xss-prevention)
- [SQL Injection Prevention](#sql-injection-prevention)
- [CSRF Protection](#csrf-protection)
- [Session Management](#session-management)
- [Password Security](#password-security)
- [API Security](#api-security)
- [Rate Limiting](#rate-limiting)
- [Logging & Monitoring](#logging--monitoring)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Security Headers](#security-headers)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

---

## Security Architecture

### Defense in Depth

The system implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────┐
│                  Layer 1: Network                       │
│  - Firewall                                             │
│  - DDoS Protection                                      │
│  - SSL/TLS Encryption                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                Layer 2: Application                     │
│  - Authentication (JWT + OTP)                           │
│  - Authorization (RBAC)                                 │
│  - Input Validation                                     │
│  - Rate Limiting                                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  Layer 3: Data                          │
│  - Encryption at Rest                                   │
│  - Database Access Control                              │
│  - Backup Encryption                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│               Layer 4: Monitoring                       │
│  - Security Logging                                     │
│  - Intrusion Detection                                  │
│  - Audit Trails                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Security

### Two-Factor Authentication (2FA)

**Implementation:**
1. User enters username/password
2. System validates credentials
3. System generates 6-digit OTP
4. OTP sent to registered email
5. User enters OTP (5-minute validity)
6. System validates OTP and issues JWT

**Security Features:**
- OTP stored in Redis with TTL (time-to-live)
- OTP automatically expires after 5 minutes
- Limited resend attempts (max 3 per 15 minutes)
- OTP single-use (invalidated after successful use)

```javascript
// OTP Generation (Backend)
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// OTP Storage with expiry
await redis.setex(`otp:${userId}`, 300, otp); // 5 minutes

// OTP Validation
const storedOTP = await redis.get(`otp:${userId}`);
if (storedOTP === providedOTP) {
  await redis.del(`otp:${userId}`); // Single use
  // Grant access
}
```

### JWT Token Security

**Token Configuration:**
```javascript
const token = jwt.sign(
  {
    userId: user.id,
    username: user.username,
    roles: user.roles,
    privileges: user.privileges
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '30m',     // Short-lived access token
    issuer: 'aps.dz',
    audience: 'aps-backoffice'
  }
);
```

**Token Storage:**
- Stored in HTTP-only cookies (not accessible via JavaScript)
- Secure flag enabled (HTTPS only)
- SameSite=Strict (CSRF protection)

**Token Refresh:**
- Access tokens expire after 30 minutes
- Automatic refresh on activity
- Refresh tokens valid for 7 days
- Manual login required after refresh token expiry

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

**Permission Checking (Backend):**
```javascript
function authorize(requiredPermission) {
  return async (req, res, next) => {
    try {
      const user = req.user; // From JWT middleware
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      const userPermissions = await getUserPermissions(user.id);
      
      if (!hasPermission(userPermissions, requiredPermission)) {
        // Log unauthorized access attempt
        logger.warn('Unauthorized access attempt', {
          userId: user.id,
          requiredPermission,
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        
        return res.status(403).json({ 
          success: false, 
          message: 'Permission denied' 
        });
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error', error);
      res.status(500).json({ 
        success: false, 
        message: 'Authorization failed' 
      });
    }
  };
}
```

### Principle of Least Privilege

- Users granted minimum permissions needed
- Default deny (explicit allow required)
- Regular permission audits
- Time-limited elevated access when needed

---

## Input Validation & Sanitization

### Frontend Validation

**XSS/SQL Injection Check:**
```javascript
/**
 * Checks input for XSS and SQL injection attempts
 * Uses DOMPurify for XSS detection and regex for SQL patterns
 */
export const checkXssSQL = (input) => {
  // Sanitize with DOMPurify
  const cleanInput = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  // SQL injection pattern detection
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)|(--|;|\/\*|\*\/)/i;
  
  const isSqlInjection = sqlInjectionPattern.test(input);
  const isXssInjection = cleanInput !== input;
  
  if (isSqlInjection || isXssInjection) {
    // Log security violation
    log.error(
      `Security violation detected: ${input}`,
      'blocage',
      'Input Validation',
      220
    );
    
    return { isInjection: true, type: 'XSS/SQL' };
  }
  
  return { isInjection: false, type: null };
};
```

**Usage Example:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (checkXssSQL(username).isInjection || 
      checkXssSQL(password).isInjection) {
    toast.error('Invalid characters detected');
    return;
  }
  
  // Proceed with submission
  fetchData();
};
```

### Backend Validation

**Input Validation Middleware:**
```javascript
const { body, validationResult } = require('express-validator');

const validateUserInput = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Invalid username format'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .matches(/@aps\.dz$/)
    .withMessage('Email must be from @aps.dz domain'),
  
  body('password')
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain letters, numbers, and symbols'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Usage
router.post('/users/create', validateUserInput, userController.create);
```

---

## XSS Prevention

### DOMPurify Integration

**Frontend:**
```javascript
import DOMPurify from 'dompurify';

// Sanitize before rendering
const safeHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target'],
  ALLOW_DATA_ATTR: false
});

// Render safely
<div dangerouslySetInnerHTML={{ __html: safeHTML }} />
```

### Content Security Policy (CSP)

**Apache Configuration:**
```apache
Header always set Content-Security-Policy "\
  default-src 'self'; \
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; \
  style-src 'self' 'unsafe-inline'; \
  img-src 'self' data: https://cdn.aps.dz; \
  font-src 'self' data:; \
  connect-src 'self' https://api.aps.dz; \
  frame-ancestors 'none'; \
  base-uri 'self'; \
  form-action 'self'"
```

### Output Encoding

**Always encode user-generated content:**
```javascript
// React automatically escapes
<p>{userInput}</p>  // Safe

// Manual encoding for special cases
function encodeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

---

## SQL Injection Prevention

### Parameterized Queries (Prisma ORM)

**Safe Query (Parameterized):**
```javascript
// ✅ SAFE: Using Prisma ORM (parameterized)
const user = await prisma.user.findUnique({
  where: { username: userInput }
});
```

**Unsafe Query (Never do this):**
```javascript
// ❌ DANGEROUS: Raw SQL with string concatenation
const query = `SELECT * FROM users WHERE username = '${userInput}'`;
// This is vulnerable to SQL injection!
```

### Input Validation for SQL

```javascript
function validateSQLInput(input) {
  // Reject common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /('|")(.*)(OR|AND)(.*)(=|LIKE)/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
}
```

---

## CSRF Protection

### SameSite Cookie

```javascript
// Backend: Set cookie with SameSite
res.cookie('jwt', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',  // CSRF protection
  maxAge: 30 * 60 * 1000  // 30 minutes
});
```

### CSRF Token (Additional Layer)

```javascript
// Backend: Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex');
await redis.setex(`csrf:${sessionId}`, 3600, csrfToken);

// Send token to client
res.json({ csrfToken });

// Frontend: Include token in requests
axios.post('/api/endpoint', data, {
  headers: { 'X-CSRF-Token': csrfToken }
});

// Backend: Validate token
function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  const sessionId = req.session.id;
  
  const storedToken = await redis.get(`csrf:${sessionId}`);
  
  if (token !== storedToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  
  next();
}
```

---

## Session Management

### Session Security

**Configuration:**
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // Not accessible via JavaScript
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000  // 30 minutes
  }
}));
```

### Session Fixation Prevention

```javascript
// Regenerate session on login
app.post('/auth/login', async (req, res) => {
  // Validate credentials...
  
  // Regenerate session ID
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    
    req.session.userId = user.id;
    req.session.save();
    
    res.json({ success: true });
  });
});
```

### Concurrent Session Management

```javascript
// Check for existing sessions
const existingSessions = await redis.keys(`session:${userId}:*`);

if (existingSessions.length > 0) {
  return res.status(409).json({ 
    success: true,
    hasSession: true,
    message: 'Existing session found',
    sessionId: existingSessions[0]
  });
}
```

### Session Timeout

```javascript
// Automatic logout after inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function checkSessionTimeout(req, res, next) {
  if (req.session.lastActivity) {
    const timeSinceLastActivity = Date.now() - req.session.lastActivity;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      req.session.destroy();
      return res.status(401).json({ 
        message: 'Session expired',
        logout: true 
      });
    }
  }
  
  req.session.lastActivity = Date.now();
  next();
}
```

---

## Password Security

### Password Hashing

**Using bcrypt:**
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Hash password
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Verify password
const isValid = await bcrypt.compare(providedPassword, storedHash);
```

### Password Policy

**Enforced Requirements:**
- Minimum 8 characters
- Maximum 16 characters
- At least one letter (a-z, A-Z)
- At least one number (0-9)
- At least one special character (@$!%*?&)
- Cannot contain username
- Cannot be a common password

**Validation:**
```javascript
export function isValidPassword(password, username) {
  // Length check
  if (password.length < 8 || password.length > 16) {
    return false;
  }
  
  // Character type checks
  const hasCharacter = /[a-zA-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasNotUsername = !password.includes(username);
  
  return hasCharacter && hasSymbol && hasNumber && hasNotUsername;
}
```

### Password Reset Security

```javascript
// Generate secure reset token
const resetToken = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

// Store hashed token with expiry
await prisma.passwordReset.create({
  data: {
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  }
});

// Send token via email (unhashed version)
sendEmail(user.email, resetToken);
```

---

## API Security

### CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://redactionnelle.aps.dz',
    'https://www.aps.dz'
  ],
  credentials: true,  // Allow cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
```

### API Key Management (if applicable)

```javascript
// Validate API key
function validateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }
  
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  // Check in database
  const validKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashedKey, isActive: true }
  });
  
  if (!validKey) {
    return res.status(403).json({ message: 'Invalid API key' });
  }
  
  next();
}
```

---

## Rate Limiting

### Express Rate Limit

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,  // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({ 
      success: false,
      message: 'Rate limit exceeded' 
    });
  }
});

// Login rate limit (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

### Redis-Based Rate Limiting

```javascript
async function checkRateLimit(userId, action, limit, window) {
  const key = `ratelimit:${userId}:${action}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    return false;  // Rate limit exceeded
  }
  
  return true;  // Within limit
}

// Usage
if (!await checkRateLimit(userId, 'article_create', 10, 3600)) {
  return res.status(429).json({ message: 'Too many articles created' });
}
```

---

## Logging & Monitoring

### Security Event Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

// Log security events
logger.warn('Unauthorized access attempt', {
  userId: user.id,
  ip: req.ip,
  path: req.path,
  method: req.method,
  timestamp: new Date()
});
```

### Audit Trail

```javascript
// Log all user actions
async function auditLog(userId, action, resource, resourceId, details) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      details: JSON.stringify(details),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date()
    }
  });
}

// Usage
await auditLog(user.id, 'UPDATE', 'article', articleId, { 
  field: 'title', 
  oldValue: oldTitle, 
  newValue: newTitle 
});
```

### Failed Login Monitoring

```javascript
// Track failed login attempts
async function trackFailedLogin(username, ip) {
  const key = `failed_login:${ip}:${username}`;
  const attempts = await redis.incr(key);
  
  if (attempts === 1) {
    await redis.expire(key, 900);  // 15 minutes
  }
  
  if (attempts >= 5) {
    // Alert security team
    logger.error('Multiple failed login attempts', { username, ip });
    
    // Consider blocking IP
    await redis.setex(`blocked_ip:${ip}`, 3600, '1');
  }
  
  return attempts;
}
```

---

## Data Protection

### Encryption at Rest

**Database Encryption:**
```sql
-- PostgreSQL encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive fields
INSERT INTO users (email_encrypted) 
VALUES (pgp_sym_encrypt('user@aps.dz', 'encryption_key'));

-- Decrypt
SELECT pgp_sym_decrypt(email_encrypted, 'encryption_key') FROM users;
```

### Encryption in Transit

**HTTPS/TLS Configuration:**
- TLS 1.3 required
- Strong cipher suites only
- Perfect Forward Secrecy (PFS)
- HSTS enabled

```apache
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1 -TLSv1.2
SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder off
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### Sensitive Data Handling

**Never log sensitive data:**
```javascript
// ❌ BAD
logger.info('User login', { username, password });

// ✅ GOOD
logger.info('User login', { username });
```

**Mask sensitive data in responses:**
```javascript
function maskEmail(email) {
  const [name, domain] = email.split('@');
  const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 2);
  return `${maskedName}@${domain}`;
}

// Return masked email
res.json({ email: maskEmail(user.email) });
```

---

## Network Security

### Firewall Rules

```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Allow HTTP (for redirect)
sudo ufw allow 80/tcp

# Allow SSH (restricted IPs)
sudo ufw allow from 192.168.1.0/24 to any port 22

# Deny all other incoming
sudo ufw default deny incoming

# Allow all outgoing
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable
```

### DDoS Protection

**Rate limiting at network level:**
- Use Cloudflare or similar CDN
- Configure connection limits
- Enable SYN flood protection

```bash
# Linux kernel parameters
sudo sysctl -w net.ipv4.tcp_syncookies=1
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=2048
```

---

## Security Headers

### Comprehensive Security Headers

```apache
# X-Frame-Options: Prevent clickjacking
Header always set X-Frame-Options "SAMEORIGIN"

# X-Content-Type-Options: Prevent MIME sniffing
Header always set X-Content-Type-Options "nosniff"

# X-XSS-Protection: Enable XSS filter
Header always set X-XSS-Protection "1; mode=block"

# Referrer-Policy: Control referrer information
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Permissions-Policy: Control browser features
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# Content-Security-Policy: XSS protection
Header always set Content-Security-Policy "default-src 'self'; ..."

# HSTS: Force HTTPS
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

---

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor logs for anomalies
   - Alert on suspicious patterns
   - User reports

2. **Containment**
   - Block affected IPs
   - Disable compromised accounts
   - Isolate affected systems

3. **Investigation**
   - Review audit logs
   - Identify attack vector
   - Assess damage

4. **Remediation**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security rules

5. **Recovery**
   - Restore from backups if needed
   - Verify system integrity
   - Resume normal operations

6. **Post-Incident**
   - Document incident
   - Update security policies
   - Train team on lessons learned

### Emergency Contacts

```javascript
const SECURITY_CONTACTS = {
  admin: 'admin@aps.dz',
  security: 'security@aps.dz',
  emergency: '+213-XXX-XXXXXX'
};
```

---

## Security Checklist

### Development

- [ ] Input validation on all user inputs
- [ ] Output encoding for all user-generated content
- [ ] Parameterized queries (no string concatenation in SQL)
- [ ] Authentication required for all protected endpoints
- [ ] Authorization checks before data access
- [ ] Sensitive data encrypted in storage
- [ ] HTTPS for all communications
- [ ] Security headers configured
- [ ] No sensitive data in logs
- [ ] Error messages don't reveal system details

### Deployment

- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] SSL/TLS certificates valid
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Monitoring and alerting configured
- [ ] Backup system tested
- [ ] Incident response plan documented
- [ ] Security audit completed
- [ ] Penetration testing performed

### Ongoing

- [ ] Regular security updates applied
- [ ] Dependency vulnerabilities checked (npm audit)
- [ ] Log reviews performed weekly
- [ ] Access permissions reviewed monthly
- [ ] Backup integrity verified monthly
- [ ] SSL certificates renewed before expiry
- [ ] Security training for team quarterly
- [ ] Incident response drills annually

---

## Related Documentation

- [Permissions & Access Control](./permissions.md)
- [API Documentation](./api.md)
- [Deployment Guide](./deployment.md)
- [Architecture Overview](./architecture.md)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated**: 2024
**Document Version**: 1.0
