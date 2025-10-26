# Database Schema Documentation

## Overview

This document provides a detailed explanation of the database schema for the APS Editorial Management System, including table structures, relationships, indexes, and data types.

---

## Table of Contents

- [Database Overview](#database-overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Core Tables](#core-tables)
  - [Users & Authentication](#users--authentication)
  - [Roles & Permissions](#roles--permissions)
  - [Content Management](#content-management)
  - [Media Management](#media-management)
  - [Logging & Auditing](#logging--auditing)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Migrations](#migrations)
- [Data Dictionary](#data-dictionary)

---

## Database Overview

**Database Type**: PostgreSQL 14+ (Primary) / MySQL 8+ (Alternative)
**ORM**: Prisma
**Character Set**: UTF-8
**Collation**: utf8_unicode_ci / en_US.UTF-8

### Database Statistics (Estimated)
- **Tables**: ~25
- **Views**: ~5
- **Stored Procedures**: ~10
- **Expected Data Volume**: 
  - Users: ~1,000
  - Articles: ~100,000+
  - Logs: ~1M+ entries/year

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │◄─────►│ user_roles  │◄─────►│    roles    │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                            │
       │                                            ▼
       │                                     ┌─────────────┐
       │                                     │role_priv    │
       │                                     └─────────────┘
       │                                            │
       ▼                                            ▼
┌─────────────┐                              ┌─────────────┐
│user_topics  │                              │ privileges  │
└─────────────┘                              └─────────────┘
       │
       ▼
┌─────────────┐
│   topics    │
└─────────────┘
       │
       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  articles   │◄─────►│article_cats │◄─────►│ categories  │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       ├─────────────►┌─────────────┐
       │              │article_tags │
       │              └─────────────┘
       │                     │
       │                     ▼
       │              ┌─────────────┐
       │              │    tags     │
       │              └─────────────┘
       │
       └─────────────►┌─────────────┐
                      │    media    │
                      └─────────────┘
```

---

## Core Tables

### Users & Authentication

#### users
Primary table for user accounts.

```sql
CREATE TABLE users (
  -- Primary Key
  id_user           SERIAL PRIMARY KEY,
  
  -- Authentication
  username          VARCHAR(100) UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  
  -- Profile Information
  full_name         VARCHAR(255),
  phone             VARCHAR(20),
  avatar_url        VARCHAR(500),
  language_pref     VARCHAR(10) DEFAULT 'fr',
  
  -- Status
  is_active         BOOLEAN DEFAULT true,
  is_blocked        BOOLEAN DEFAULT false,
  block_reason      VARCHAR(500),
  block_code        INT,
  
  -- Timestamps
  last_login        TIMESTAMP,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP,
  
  -- Audit
  created_by        INT REFERENCES users(id_user),
  updated_by        INT REFERENCES users(id_user),
  
  -- Indexes
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_is_active (is_active),
  INDEX idx_is_blocked (is_blocked)
);
```

**Field Descriptions:**
- `id_user`: Unique user identifier
- `username`: Login username (alphanumeric, underscores, hyphens)
- `email`: User email (@aps.dz domain required)
- `password_hash`: bcrypt hashed password
- `is_blocked`: User blocked due to security violations
- `block_code`: Reason code for blocking (220 = XSS/SQL injection)

#### sessions
Active user sessions stored in Redis or database.

```sql
CREATE TABLE sessions (
  session_id        VARCHAR(255) PRIMARY KEY,
  user_id           INT REFERENCES users(id_user),
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  expires_at        TIMESTAMP NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

#### otp_codes
OTP codes for two-factor authentication (typically stored in Redis).

```sql
CREATE TABLE otp_codes (
  id                SERIAL PRIMARY KEY,
  user_id           INT REFERENCES users(id_user),
  code              VARCHAR(6) NOT NULL,
  expires_at        TIMESTAMP NOT NULL,
  used              BOOLEAN DEFAULT false,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

---

### Roles & Permissions

#### roles
User roles definition.

```sql
CREATE TABLE roles (
  id_role           SERIAL PRIMARY KEY,
  name              VARCHAR(100) UNIQUE NOT NULL,
  description       TEXT,
  is_system         BOOLEAN DEFAULT false,  -- System role (cannot delete)
  created_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by        INT REFERENCES users(id_user),
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
);
```

**System Roles:**
- Administrator
- Editor-in-Chief
- Topic Editor
- Journalist
- Contributor

#### privileges
Available system privileges.

```sql
CREATE TABLE privileges (
  id_privilege      SERIAL PRIMARY KEY,
  name              VARCHAR(100) UNIQUE NOT NULL,  -- e.g., "articles.create"
  description       TEXT,
  resource          VARCHAR(50),                    -- e.g., "articles"
  action            VARCHAR(50),                    -- e.g., "create"
  scope             VARCHAR(50),                    -- e.g., "all", "topic", "own"
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_resource (resource)
);
```

#### role_privileges
Many-to-many relationship between roles and privileges.

```sql
CREATE TABLE role_privileges (
  id                SERIAL PRIMARY KEY,
  id_role           INT REFERENCES roles(id_role) ON DELETE CASCADE,
  id_privilege      INT REFERENCES privileges(id_privilege) ON DELETE CASCADE,
  assigned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by       INT REFERENCES users(id_user),
  
  UNIQUE(id_role, id_privilege),
  INDEX idx_role (id_role),
  INDEX idx_privilege (id_privilege)
);
```

#### user_roles
Many-to-many relationship between users and roles.

```sql
CREATE TABLE user_roles (
  id                SERIAL PRIMARY KEY,
  id_user           INT REFERENCES users(id_user) ON DELETE CASCADE,
  id_role           INT REFERENCES roles(id_role) ON DELETE CASCADE,
  assigned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by       INT REFERENCES users(id_user),
  
  UNIQUE(id_user, id_role),
  INDEX idx_user (id_user),
  INDEX idx_role (id_role)
);
```

---

### Content Management

#### topics
News topics/sections (Politics, Economy, Sports, etc.).

```sql
CREATE TABLE topics (
  id_topic          SERIAL PRIMARY KEY,
  name              VARCHAR(100) UNIQUE NOT NULL,      -- URL-friendly name
  label_fr          VARCHAR(200),                       -- French label
  label_ar          VARCHAR(200),                       -- Arabic label
  label_en          VARCHAR(200),                       -- English label
  description       TEXT,
  icon              VARCHAR(100),
  order_position    INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by        INT REFERENCES users(id_user),
  
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);
```

#### user_topics
Topic assignments for users (topic-scoped access control).

```sql
CREATE TABLE user_topics (
  id                SERIAL PRIMARY KEY,
  id_user           INT REFERENCES users(id_user) ON DELETE CASCADE,
  id_topic          INT REFERENCES topics(id_topic) ON DELETE CASCADE,
  assigned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by       INT REFERENCES users(id_user),
  
  UNIQUE(id_user, id_topic),
  INDEX idx_user (id_user),
  INDEX idx_topic (id_topic)
);
```

#### articles
Main articles/content table.

```sql
CREATE TABLE articles (
  id_article        SERIAL PRIMARY KEY,
  
  -- Content
  title             VARCHAR(500) NOT NULL,
  slug              VARCHAR(600) UNIQUE,
  content_intro     TEXT,                              -- Introductory text
  content_full      TEXT,                              -- Full article content
  meta_description  VARCHAR(300),                      -- SEO meta description
  
  -- Status & Workflow
  status            VARCHAR(20) DEFAULT 'draft',       -- draft, review, approved, published, archived, rejected
  
  -- Categorization
  topic_id          INT REFERENCES topics(id_topic),
  language          VARCHAR(10) DEFAULT 'fr',          -- fr, ar, en, etc.
  
  -- Media
  featured_image    VARCHAR(500),
  
  -- Publishing
  published_at      TIMESTAMP,
  scheduled_at      TIMESTAMP,
  
  -- Analytics
  views             INT DEFAULT 0,
  shares            INT DEFAULT 0,
  
  -- Versioning
  version           INT DEFAULT 1,
  parent_version_id INT REFERENCES articles(id_article),
  
  -- Timestamps
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP,
  
  -- Audit
  author_id         INT REFERENCES users(id_user),
  updated_by        INT REFERENCES users(id_user),
  published_by      INT REFERENCES users(id_user),
  
  -- Indexes
  INDEX idx_status (status),
  INDEX idx_topic (topic_id),
  INDEX idx_author (author_id),
  INDEX idx_published_at (published_at),
  INDEX idx_language (language),
  INDEX idx_slug (slug),
  FULLTEXT INDEX ft_title_content (title, content_intro, content_full)
);
```

**Article Status Flow:**
- `draft` → `review` → `approved` → `published` → `archived`
- Alternative: `draft` → `review` → `rejected`

#### categories
Article categories (hierarchical structure supported).

```sql
CREATE TABLE categories (
  id_category       SERIAL PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  slug              VARCHAR(250) UNIQUE NOT NULL,
  description       TEXT,
  parent_id         INT REFERENCES categories(id_category),
  order_position    INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by        INT REFERENCES users(id_user),
  
  INDEX idx_slug (slug),
  INDEX idx_parent (parent_id),
  INDEX idx_is_active (is_active)
);
```

#### article_categories
Many-to-many relationship between articles and categories.

```sql
CREATE TABLE article_categories (
  id                SERIAL PRIMARY KEY,
  id_article        INT REFERENCES articles(id_article) ON DELETE CASCADE,
  id_category       INT REFERENCES categories(id_category) ON DELETE CASCADE,
  order_position    INT DEFAULT 0,
  
  UNIQUE(id_article, id_category),
  INDEX idx_article (id_article),
  INDEX idx_category (id_category)
);
```

#### tags
Article tags for classification and search.

```sql
CREATE TABLE tags (
  id_tag            SERIAL PRIMARY KEY,
  name              VARCHAR(100) UNIQUE NOT NULL,
  slug              VARCHAR(150) UNIQUE NOT NULL,
  usage_count       INT DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by        INT REFERENCES users(id_user),
  
  INDEX idx_name (name),
  INDEX idx_slug (slug),
  INDEX idx_usage_count (usage_count)
);
```

#### article_tags
Many-to-many relationship between articles and tags.

```sql
CREATE TABLE article_tags (
  id                SERIAL PRIMARY KEY,
  id_article        INT REFERENCES articles(id_article) ON DELETE CASCADE,
  id_tag            INT REFERENCES tags(id_tag) ON DELETE CASCADE,
  
  UNIQUE(id_article, id_tag),
  INDEX idx_article (id_article),
  INDEX idx_tag (id_tag)
);
```

---

### Media Management

#### media
Media files (images, videos, documents).

```sql
CREATE TABLE media (
  id_media          SERIAL PRIMARY KEY,
  
  -- File Information
  filename          VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_path         VARCHAR(500) NOT NULL,
  file_url          VARCHAR(500),
  mime_type         VARCHAR(100),
  file_size         BIGINT,                            -- Size in bytes
  
  -- Media Type
  media_type        VARCHAR(50),                       -- image, video, document
  
  -- Image Specific
  width             INT,
  height            INT,
  
  -- Metadata
  title             VARCHAR(255),
  caption           TEXT,
  alt_text          VARCHAR(255),                      -- Accessibility
  credits           VARCHAR(255),
  
  -- Usage
  usage_count       INT DEFAULT 0,
  
  -- Timestamps
  uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by       INT REFERENCES users(id_user),
  deleted_at        TIMESTAMP,
  
  -- Indexes
  INDEX idx_filename (filename),
  INDEX idx_media_type (media_type),
  INDEX idx_uploaded_by (uploaded_by)
);
```

#### article_media
Relationship between articles and media files.

```sql
CREATE TABLE article_media (
  id                SERIAL PRIMARY KEY,
  id_article        INT REFERENCES articles(id_article) ON DELETE CASCADE,
  id_media          INT REFERENCES media(id_media) ON DELETE CASCADE,
  order_position    INT DEFAULT 0,
  is_featured       BOOLEAN DEFAULT false,
  
  INDEX idx_article (id_article),
  INDEX idx_media (id_media)
);
```

---

### Logging & Auditing

#### audit_logs
Comprehensive audit trail for all user actions.

```sql
CREATE TABLE audit_logs (
  id                BIGSERIAL PRIMARY KEY,
  
  -- User Information
  user_id           INT REFERENCES users(id_user),
  username          VARCHAR(100),
  
  -- Action Details
  action            VARCHAR(50) NOT NULL,              -- CREATE, UPDATE, DELETE, LOGIN, etc.
  resource          VARCHAR(100) NOT NULL,             -- users, articles, roles, etc.
  resource_id       INT,
  
  -- Change Details
  old_value         JSONB,
  new_value         JSONB,
  changes           JSONB,
  
  -- Request Information
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  request_method    VARCHAR(10),
  request_path      VARCHAR(500),
  
  -- Timestamp
  timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource (resource),
  INDEX idx_timestamp (timestamp),
  INDEX idx_ip_address (ip_address)
);
```

#### error_logs
Application error logs.

```sql
CREATE TABLE error_logs (
  id                BIGSERIAL PRIMARY KEY,
  
  -- Error Information
  level             VARCHAR(20),                       -- error, warn, info
  message           TEXT NOT NULL,
  error_code        VARCHAR(50),
  stack_trace       TEXT,
  
  -- Context
  user_id           INT REFERENCES users(id_user),
  source            VARCHAR(50),                       -- frontend, backend
  folder            VARCHAR(100),
  action            VARCHAR(100),
  
  -- Request Information
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  request_url       VARCHAR(500),
  
  -- Timestamp
  timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_level (level),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_source (source)
);
```

#### login_errors
Failed login attempt tracking.

```sql
CREATE TABLE login_errors (
  id                BIGSERIAL PRIMARY KEY,
  username          VARCHAR(100),
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  error_message     VARCHAR(255),
  timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_username (username),
  INDEX idx_ip_address (ip_address),
  INDEX idx_timestamp (timestamp)
);
```

---

## Relationships

### One-to-Many Relationships

```
users (1) ──────► (N) articles           (author_id)
users (1) ──────► (N) media              (uploaded_by)
users (1) ──────► (N) roles              (created_by)
topics (1) ─────► (N) articles           (topic_id)
articles (1) ───► (N) article_versions   (parent_version_id)
categories (1) ─► (N) categories         (parent_id - hierarchical)
```

### Many-to-Many Relationships

```
users (N) ◄────► (N) roles               via user_roles
users (N) ◄────► (N) topics              via user_topics
roles (N) ◄────► (N) privileges          via role_privileges
articles (N) ◄──► (N) categories         via article_categories
articles (N) ◄──► (N) tags               via article_tags
articles (N) ◄──► (N) media              via article_media
```

---

## Indexes

### Primary Indexes
All tables have primary key indexes on `id_*` columns.

### Foreign Key Indexes
Automatically created for all foreign key relationships.

### Performance Indexes

**High-Traffic Queries:**
```sql
-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Article queries
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_topic_status ON articles(topic_id, status);
CREATE INDEX idx_articles_author_status ON articles(author_id, status);
CREATE INDEX idx_articles_published ON articles(published_at DESC);

-- Full-text search
CREATE FULLTEXT INDEX ft_articles_search ON articles(title, content_intro, content_full);

-- Audit and logging
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user_timestamp ON audit_logs(user_id, timestamp DESC);
```

---

## Constraints

### Primary Keys
All tables have an auto-incrementing primary key.

### Foreign Keys
All foreign keys enforce referential integrity with `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate.

### Unique Constraints
```sql
-- Usernames and emails must be unique
ALTER TABLE users ADD CONSTRAINT uk_username UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT uk_email UNIQUE (email);

-- Role names must be unique
ALTER TABLE roles ADD CONSTRAINT uk_role_name UNIQUE (name);

-- Privilege names must be unique
ALTER TABLE privileges ADD CONSTRAINT uk_privilege_name UNIQUE (name);

-- Article slugs must be unique
ALTER TABLE articles ADD CONSTRAINT uk_article_slug UNIQUE (slug);

-- Category slugs must be unique
ALTER TABLE categories ADD CONSTRAINT uk_category_slug UNIQUE (slug);
```

### Check Constraints
```sql
-- Email must be from @aps.dz domain
ALTER TABLE users ADD CONSTRAINT chk_email_domain 
  CHECK (email LIKE '%@aps.dz');

-- Password hash must not be empty
ALTER TABLE users ADD CONSTRAINT chk_password_hash 
  CHECK (LENGTH(password_hash) > 0);

-- Article status must be valid
ALTER TABLE articles ADD CONSTRAINT chk_article_status 
  CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived', 'rejected'));

-- File size must be positive
ALTER TABLE media ADD CONSTRAINT chk_file_size 
  CHECK (file_size > 0);
```

---

## Migrations

### Prisma Migrations

The project uses Prisma ORM for schema management and migrations.

**Generate Migration:**
```bash
npx prisma migrate dev --name add_new_feature
```

**Apply Migrations:**
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

**Reset Database (Development):**
```bash
npx prisma migrate reset
```

### Migration Best Practices

1. **Always test migrations** in development first
2. **Backup production database** before applying migrations
3. **Use transactions** for multi-step migrations
4. **Version control** all migration files
5. **Document breaking changes** in migration notes

---

## Data Dictionary

### Common Field Types

| Field Name | Type | Description |
|------------|------|-------------|
| `id_*` | SERIAL/INT | Primary key |
| `*_id` | INT | Foreign key |
| `name` | VARCHAR(100) | Display name |
| `slug` | VARCHAR(150) | URL-friendly identifier |
| `description` | TEXT | Long description |
| `is_active` | BOOLEAN | Active status flag |
| `is_deleted` | BOOLEAN | Soft delete flag |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `deleted_at` | TIMESTAMP | Soft delete timestamp |
| `created_by` | INT | User who created |
| `updated_by` | INT | User who last updated |

### Status Enumerations

**Article Status:**
- `draft` - Being written
- `review` - Submitted for review
- `approved` - Approved for publication
- `published` - Live on website
- `archived` - No longer visible
- `rejected` - Rejected by editor

**User Status:**
- `is_active: true` - Active account
- `is_active: false` - Inactive account
- `is_blocked: true` - Blocked account

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [API Documentation](./api.md)
- [Deployment Guide](./deployment.md)
- [Security Practices](./security.md)

---

**Last Updated**: 2024
**Document Version**: 1.0
