# Deployment Guide

## Overview

This comprehensive guide covers the deployment of the APS Editorial Management System to production environments, including server setup, configuration, security hardening, and maintenance procedures.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Deployment Options](#deployment-options)
- [Apache Deployment](#apache-deployment)
- [Docker Deployment](#docker-deployment)
- [PM2 Deployment](#pm2-deployment)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [Load Balancing](#load-balancing)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Operating System**: Linux (Ubuntu 20.04+ / CentOS 8+ / Debian 11+)
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Apache**: v2.4+ (for web server)
- **Database**: PostgreSQL 14+ or MySQL 8+
- **Redis**: v6.0+ (for caching and sessions)
- **Git**: v2.30+

### Optional Software

- **Docker**: v20.10+ (for containerized deployment)
- **PM2**: Latest version (for process management)
- **Nginx**: v1.20+ (alternative to Apache)
- **Apache Kafka**: Latest (for analytics events)
- **Certbot**: Latest (for Let's Encrypt SSL)

---

## Server Requirements

### Minimum Requirements

**Frontend Server:**
- **CPU**: 2 cores
- **RAM**: 2 GB
- **Disk**: 20 GB SSD
- **Network**: 100 Mbps

**Backend API Server:**
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Disk**: 100 GB SSD
- **Network**: 1 Gbps

**Database Server:**
- **CPU**: 4 cores
- **RAM**: 16 GB
- **Disk**: 200 GB SSD (with RAID 10)
- **Network**: 1 Gbps

### Recommended Production Requirements

**Frontend Server:**
- **CPU**: 4 cores
- **RAM**: 4 GB
- **Disk**: 50 GB SSD
- **Network**: 1 Gbps

**Backend API Server (per instance):**
- **CPU**: 8 cores
- **RAM**: 16 GB
- **Disk**: 200 GB SSD
- **Network**: 10 Gbps

**Database Server:**
- **CPU**: 16 cores
- **RAM**: 64 GB
- **Disk**: 1 TB NVMe SSD (RAID 10)
- **Network**: 10 Gbps

**Cache Server (Redis):**
- **CPU**: 4 cores
- **RAM**: 8 GB (more if caching heavily)
- **Disk**: 50 GB SSD
- **Network**: 1 Gbps

---

## Deployment Options

### Option 1: Traditional Apache + PM2

**Pros:**
- Simple and straightforward
- Easy to debug
- Direct server access
- Good for smaller deployments

**Cons:**
- Manual scaling
- Manual process management
- Server-specific configuration

### Option 2: Docker Containers

**Pros:**
- Portable and consistent
- Easy scaling
- Isolated environments
- Version control for infrastructure

**Cons:**
- Additional complexity
- Resource overhead
- Requires Docker knowledge

### Option 3: Kubernetes

**Pros:**
- Automatic scaling
- Self-healing
- Load balancing built-in
- Production-grade orchestration

**Cons:**
- High complexity
- Requires expertise
- Infrastructure overhead

---

## Apache Deployment

### Step 1: Install Apache

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd

# Enable and start Apache
sudo systemctl enable apache2  # or httpd on CentOS
sudo systemctl start apache2
```

### Step 2: Install Required Apache Modules

```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires

# Restart Apache
sudo systemctl restart apache2
```

### Step 3: Build Frontend

```bash
# Navigate to project directory
cd /var/www/aps-backoffice

# Install dependencies
npm ci --production

# Build for production
npm run build

# Output will be in dist/ directory
```

### Step 4: Configure Apache Virtual Host

Create `/etc/apache2/sites-available/aps-backoffice.conf`:

```apache
<VirtualHost *:80>
    ServerName redactionnelle.aps.dz
    ServerAlias www.redactionnelle.aps.dz
    
    # Redirect to HTTPS
    Redirect permanent / https://redactionnelle.aps.dz/
</VirtualHost>

<VirtualHost *:443>
    ServerName redactionnelle.aps.dz
    ServerAlias www.redactionnelle.aps.dz
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/aps-backoffice.crt
    SSLCertificateKeyFile /etc/ssl/private/aps-backoffice.key
    SSLCertificateChainFile /etc/ssl/certs/aps-backoffice-chain.crt
    
    # Modern SSL Configuration
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder off
    SSLSessionTickets off
    
    # Document Root
    DocumentRoot /var/www/aps-backoffice/dist
    
    # Directory Configuration
    <Directory /var/www/aps-backoffice/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router Support - SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # API Reverse Proxy
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # Content Security Policy
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.aps.dz; font-src 'self' data:; connect-src 'self' https://api.aps.dz;"
    
    # HSTS (HTTP Strict Transport Security)
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
        AddOutputFilterByType DEFLATE application/javascript application/json
        AddOutputFilterByType DEFLATE text/javascript
        AddOutputFilterByType DEFLATE application/x-font-ttf application/x-font-opentype
        AddOutputFilterByType DEFLATE image/svg+xml
    </IfModule>
    
    # Browser Caching
    <IfModule mod_expires.c>
        ExpiresActive On
        
        # Images
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/webp "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
        ExpiresByType image/x-icon "access plus 1 year"
        
        # Fonts
        ExpiresByType font/ttf "access plus 1 year"
        ExpiresByType font/woff "access plus 1 year"
        ExpiresByType font/woff2 "access plus 1 year"
        ExpiresByType application/font-woff "access plus 1 year"
        
        # CSS and JavaScript
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType text/javascript "access plus 1 month"
        
        # HTML
        ExpiresByType text/html "access plus 0 seconds"
        
        # Default
        ExpiresDefault "access plus 1 week"
    </IfModule>
    
    # Error and Access Logs
    ErrorLog ${APACHE_LOG_DIR}/aps-backoffice-error.log
    CustomLog ${APACHE_LOG_DIR}/aps-backoffice-access.log combined
    
    # Log Level
    LogLevel warn
</VirtualHost>
```

### Step 5: Enable Site and Restart Apache

```bash
# Enable the site
sudo a2ensite aps-backoffice.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Create Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - aps-network
  
  backend:
    image: aps-backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - database
      - redis
    restart: unless-stopped
    networks:
      - aps-network
  
  database:
    image: postgres:14-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=aps_editorial
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped
    networks:
      - aps-network
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - aps-network

volumes:
  postgres-data:
  redis-data:

networks:
  aps-network:
    driver: bridge
```

### Step 4: Build and Deploy

```bash
# Build Docker image
docker build -t aps-backoffice:latest .

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## PM2 Deployment

### Step 1: Install PM2

```bash
npm install -g pm2
```

### Step 2: Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'aps-backend',
      script: './server.js',
      instances: 4,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
};
```

### Step 3: Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor applications
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart aps-backend

# Stop application
pm2 stop aps-backend
```

---

## SSL/TLS Configuration

### Option 1: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Obtain certificate
sudo certbot --apache -d redactionnelle.aps.dz -d www.redactionnelle.aps.dz

# Test automatic renewal
sudo certbot renew --dry-run

# Setup auto-renewal (cron)
sudo crontab -e
# Add: 0 0 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Custom Certificate

```bash
# Generate private key
openssl genrsa -out aps-backoffice.key 4096

# Generate CSR (Certificate Signing Request)
openssl req -new -key aps-backoffice.key -out aps-backoffice.csr

# Submit CSR to Certificate Authority
# Receive certificate files: aps-backoffice.crt and chain file

# Install certificate
sudo cp aps-backoffice.crt /etc/ssl/certs/
sudo cp aps-backoffice.key /etc/ssl/private/
sudo cp aps-backoffice-chain.crt /etc/ssl/certs/

# Set proper permissions
sudo chmod 644 /etc/ssl/certs/aps-backoffice.crt
sudo chmod 600 /etc/ssl/private/aps-backoffice.key
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Backend API
VITE_BASE_URL=https://api.aps.dz/
VITE_IMAGE_URL=https://cdn.aps.dz/images/
VITE_URL_FRONTAL=https://www.aps.dz

# Application Settings
VITE_LAN=fr
VITE_EMPTY_DATA=Aucune donnée disponible
VITE_MAX_IMAGE_SIZE=5242880

# Node Environment
NODE_ENV=production
```

### Build with Environment

```bash
# Load environment and build
npm run build

# Or use explicit env file
npm run build -- --mode production
```

---

## Database Setup

### PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

postgres=# CREATE DATABASE aps_editorial;
postgres=# CREATE USER aps_user WITH ENCRYPTED PASSWORD 'secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE aps_editorial TO aps_user;
postgres=# \q

# Run migrations (backend)
cd backend
npx prisma migrate deploy

# Seed initial data (if applicable)
npx prisma db seed
```

### Database Backup

```bash
# Manual backup
pg_dump -U aps_user aps_editorial > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U aps_user aps_editorial < backup_20240116_120000.sql

# Automated daily backup (cron)
0 2 * * * /usr/bin/pg_dump -U aps_user aps_editorial > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## Reverse Proxy Configuration

### Apache as Reverse Proxy

```apache
# Already covered in Apache deployment section
ProxyPreserveHost On
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
```

### Nginx as Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name redactionnelle.aps.dz;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/aps-backoffice.crt;
    ssl_certificate_key /etc/ssl/private/aps-backoffice.key;
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Load Balancing

### Apache Load Balancer

```apache
<Proxy balancer://apicluster>
    BalancerMember http://api1.aps.dz:3000
    BalancerMember http://api2.aps.dz:3000
    BalancerMember http://api3.aps.dz:3000
    ProxySet lbmethod=byrequests
</Proxy>

ProxyPass /api balancer://apicluster/api
ProxyPassReverse /api balancer://apicluster/api
```

### Nginx Load Balancer

```nginx
upstream backend {
    least_conn;
    server api1.aps.dz:3000;
    server api2.aps.dz:3000;
    server api3.aps.dz:3000;
}

location /api {
    proxy_pass http://backend;
}
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# PM2 web dashboard
pm2 web
```

### Log Management

```bash
# View Apache logs
sudo tail -f /var/log/apache2/aps-backoffice-access.log
sudo tail -f /var/log/apache2/aps-backoffice-error.log

# View PM2 logs
pm2 logs aps-backend

# Rotate logs
sudo logrotate -f /etc/logrotate.d/apache2
```

---

## Backup & Recovery

### Automated Backup Script

Create `/usr/local/bin/aps-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/aps"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U aps_user aps_editorial > $BACKUP_DIR/db_$DATE.sql

# Backup uploaded files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/aps-uploads

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/apache2/sites-available/aps-backoffice.conf

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:

```bash
chmod +x /usr/local/bin/aps-backup.sh

# Add to crontab
0 2 * * * /usr/local/bin/aps-backup.sh >> /var/log/aps-backup.log 2>&1
```

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_BASE_URL: ${{ secrets.VITE_BASE_URL }}
    
    - name: Deploy to server
      uses: easingthemes/ssh-deploy@v2.1.5
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: /var/www/aps-backoffice/dist
```

---

## Troubleshooting

### Common Issues

**Issue:** Apache not starting
```bash
# Check syntax
sudo apache2ctl configtest

# Check logs
sudo tail -f /var/log/apache2/error.log
```

**Issue:** Permission denied
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/aps-backoffice

# Fix permissions
sudo chmod -R 755 /var/www/aps-backoffice
```

**Issue:** API connection refused
```bash
# Check backend is running
pm2 status

# Check backend logs
pm2 logs aps-backend

# Test API directly
curl http://localhost:3000/api/health
```

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [Security Practices](./security.md)
- [API Documentation](./api.md)

---

**Last Updated**: 2024
**Document Version**: 1.0
