# Documentation Index

Welcome to the APS Editorial Management System documentation. This guide will help you navigate through all available documentation.

---

## 📚 Documentation Structure

### Core Documentation

#### [🏗️ Architecture Overview](./architecture.md)
Complete system architecture documentation including:
- High-level architecture diagram
- Frontend and backend architecture
- Database architecture
- Microservices overview
- Replica database setup (Master/Slave)
- Kafka analytics event flow
- Caching strategy with Redis
- Scalability and performance

**Read this if:** You want to understand how the system is built and how components interact.

---

#### [🔐 Security Documentation](./security.md)
Comprehensive security guidelines including:
- Authentication security (JWT + OTP)
- Authorization and access control
- Input validation and sanitization
- XSS and SQL injection prevention
- CSRF protection
- Session management
- Password security
- API security
- Rate limiting
- Logging and monitoring
- Security headers
- Incident response procedures

**Read this if:** You need to understand security measures or implement security features.

---

#### [📡 API Documentation](./api.md)
Complete API reference with:
- All endpoints documentation
- Request/response examples
- Authentication flow
- Error handling
- Pagination
- Rate limiting
- Status codes

**Endpoints covered:**
- Authentication (`/auth/*`)
- User Management (`/users/*`)
- Role Management (`/roles/*`)
- Article Management (`/articles/*`)
- Categories (`/categories/*`)
- Tags (`/tags/*`)
- Media (`/media/*`)
- Logging (`/logs/*`)

**Read this if:** You're integrating with the API or developing frontend features.

---

#### [👥 Permissions Guide](./permissions.md)
RBAC and ACL documentation including:
- Permission structure and format
- Core permissions list
- Role definitions (Admin, Editor-in-Chief, Topic Editor, Journalist, Contributor)
- Topic-based access control
- Frontend permission guards
- Backend authorization
- Permission checking examples

**Read this if:** You need to understand or implement permission-based features.

---

#### [📋 Workflow Documentation](./workflow.md)
Editorial workflows and processes:
- Editorial roles hierarchy
- Article lifecycle (Draft → Review → Published)
- Topic-based workflow
- Content review process
- Publishing workflow
- Collaborative features
- Best practices

**Read this if:** You need to understand the editorial process and workflows.

---

#### [🚀 Deployment Guide](./deployment.md)
Production deployment instructions:
- Server requirements
- Apache deployment
- Docker deployment
- PM2 deployment
- SSL/TLS configuration
- Environment configuration
- Database setup
- Reverse proxy configuration
- Load balancing
- Monitoring and logging
- Backup and recovery
- CI/CD pipeline

**Read this if:** You're deploying the application to production.

---

#### [🗄️ Database Schema](./database-schema.md)
Database structure documentation:
- Entity Relationship Diagram
- All table definitions
- Relationships
- Indexes
- Constraints
- Migrations
- Data dictionary

**Read this if:** You need to understand or modify the database structure.

---

## 📖 Additional Documentation

### [Main README](../README.md)
Project overview, features, installation, and getting started guide.

### [Contributing Guidelines](../CONTRIBUTING.md)
How to contribute to the project, coding standards, and pull request process.

### [Changelog](../CHANGELOG.md)
Version history and release notes.

---

## 🎯 Quick Start Guides

### For Developers

1. **Getting Started**
   - Read [Main README](../README.md) - Installation and setup
   - Review [Architecture Overview](./architecture.md) - Understand the system
   - Check [Contributing Guidelines](../CONTRIBUTING.md) - Coding standards

2. **Implementing Features**
   - Review [Permissions Guide](./permissions.md) - Implement access control
   - Check [API Documentation](./api.md) - Integrate with backend
   - Follow [Security Documentation](./security.md) - Ensure secure code

3. **Testing & Deployment**
   - Use [Deployment Guide](./deployment.md) - Deploy your changes
   - Review [Workflow Documentation](./workflow.md) - Test user workflows

### For System Administrators

1. **Initial Setup**
   - [Deployment Guide](./deployment.md) - Server setup
   - [Database Schema](./database-schema.md) - Database configuration
   - [Security Documentation](./security.md) - Security hardening

2. **Ongoing Maintenance**
   - [API Documentation](./api.md) - Monitor API usage
   - [Security Documentation](./security.md) - Security monitoring
   - [Deployment Guide](./deployment.md) - Backup procedures

### For Content Editors

1. **Understanding the System**
   - [Workflow Documentation](./workflow.md) - Editorial processes
   - [Permissions Guide](./permissions.md) - Your role and capabilities
   - [Main README](../README.md) - Feature overview

---

## 🔍 Finding Specific Information

### Authentication & Security
- **JWT Implementation**: [Security > Authentication Security](./security.md#authentication-security)
- **OTP Verification**: [Security > Two-Factor Authentication](./security.md#two-factor-authentication-2fa)
- **Password Requirements**: [Security > Password Security](./security.md#password-security)
- **API Authentication**: [API > Authentication](./api.md#authentication)

### User Management
- **User Roles**: [Permissions > Role Definitions](./permissions.md#role-definitions)
- **User API Endpoints**: [API > User Management](./api.md#user-management-endpoints)
- **Permission Checking**: [Permissions > Permission Checking](./permissions.md#permission-checking)

### Article Management
- **Article Lifecycle**: [Workflow > Article Lifecycle](./workflow.md#article-lifecycle)
- **Article API Endpoints**: [API > Article Management](./api.md#article-management-endpoints)
- **Publishing Process**: [Workflow > Publishing Workflow](./workflow.md#publishing-workflow)

### Database
- **Table Definitions**: [Database Schema > Core Tables](./database-schema.md#core-tables)
- **Relationships**: [Database Schema > Relationships](./database-schema.md#relationships)
- **Migrations**: [Database Schema > Migrations](./database-schema.md#migrations)

### Deployment
- **Apache Setup**: [Deployment > Apache Deployment](./deployment.md#apache-deployment)
- **Docker Setup**: [Deployment > Docker Deployment](./deployment.md#docker-deployment)
- **SSL Configuration**: [Deployment > SSL/TLS Configuration](./deployment.md#ssltls-configuration)

---

## 🛠️ Common Tasks

### Adding a New Feature

1. Read [Contributing Guidelines](../CONTRIBUTING.md)
2. Check [Architecture](./architecture.md) for system design
3. Review [Permissions](./permissions.md) for access control
4. Implement following [Security](./security.md) best practices
5. Update [API Documentation](./api.md) if adding endpoints
6. Test using [Workflow](./workflow.md) guidelines

### Fixing a Bug

1. Check [Troubleshooting sections](./deployment.md#troubleshooting) in deployment docs
2. Review [Security logs](./security.md#logging--monitoring)
3. Consult [API Documentation](./api.md) for endpoint behavior
4. Follow [Contributing Guidelines](../CONTRIBUTING.md) for fix submission

### Deploying to Production

1. Follow [Deployment Guide](./deployment.md) step by step
2. Verify [Security Configuration](./security.md#security-checklist)
3. Check [Database Migrations](./database-schema.md#migrations)
4. Review [Backup Procedures](./deployment.md#backup--recovery)

---

## 📞 Support & Contact

- **Documentation Issues**: Open a GitHub issue
- **Security Concerns**: security@aps.dz
- **General Support**: support@aps.dz
- **Development Team**: dev@aps.dz

---

## 🔄 Documentation Updates

This documentation is actively maintained. Last updated: **2024**

To contribute to documentation:
1. Fork the repository
2. Make your changes
3. Submit a pull request
4. Follow [Contributing Guidelines](../CONTRIBUTING.md)

---

## 📝 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Architecture | ✅ Complete | 2024 |
| Security | ✅ Complete | 2024 |
| API | ✅ Complete | 2024 |
| Permissions | ✅ Complete | 2024 |
| Workflow | ✅ Complete | 2024 |
| Deployment | ✅ Complete | 2024 |
| Database Schema | ✅ Complete | 2024 |

---

**Made with ❤️ by the APS Development Team**
