# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the APS Editorial Management System. All endpoints require authentication unless stated otherwise.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common Headers](#common-headers)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-management-endpoints)
  - [Roles](#role-management-endpoints)
  - [Articles/Topics](#article-management-endpoints)
  - [Categories](#category-management-endpoints)
  - [Tags](#tag-management-endpoints)
  - [Media](#media-management-endpoints)
  - [Logs](#logging-endpoints)

---

## Base URL

```
Production:  https://api.aps.dz/
Development: http://localhost:3000/
```

All endpoints are prefixed with the base URL.

---

## Authentication

The API uses **JWT (JSON Web Tokens)** stored in **HTTP-only cookies** for authentication.

### Authentication Flow

1. **Login** with username/password → Receive OTP via email
2. **Verify OTP** → Receive JWT token in cookie
3. **Use JWT** in subsequent requests (automatically sent with cookies)

### JWT Token Structure

```json
{
  "userId": 123,
  "username": "john.doe",
  "email": "john.doe@aps.dz",
  "roles": [2, 5],
  "privileges": ["articles.create", "articles.read"],
  "iat": 1642521600,
  "exp": 1642608000
}
```

### Token Expiration

- **Access Token**: 30 minutes
- **Refresh Token**: 7 days (auto-refresh on activity)
- **OTP Code**: 5 minutes

---

## Common Headers

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Cookie: jwt=<token>
```

### Response Headers

```http
Content-Type: application/json
Set-Cookie: jwt=<token>; HttpOnly; Secure; SameSite=Strict
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message description",
  "error": "ERROR_CODE",
  "details": {
    // Additional error details (optional)
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., existing session) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_FAILED` | Authentication failed |
| `INVALID_CREDENTIALS` | Invalid username/password |
| `INVALID_OTP` | Invalid or expired OTP code |
| `SESSION_EXISTS` | User already has an active session |
| `PERMISSION_DENIED` | User lacks required permission |
| `VALIDATION_ERROR` | Input validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Pagination

List endpoints support pagination with the following parameters:

### Query Parameters

```
page=1          # Page number (default: 1)
limit=10        # Items per page (default: 10, max: 100)
sortBy=created  # Sort field
order=desc      # Sort order (asc/desc)
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## API Endpoints

## Authentication Endpoints

### POST /auth/login

Authenticate user with username and password. Initiates OTP verification process.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "SecureP@ss123"
}
```

**Response (Success - No Existing Session):**
```json
{
  "success": true,
  "hasSession": false,
  "message": "OTP sent to your email",
  "data": {
    "userId": 123,
    "email": "jo******@aps.dz"
  }
}
```

**Response (Conflict - Existing Session):**
```json
{
  "success": true,
  "hasSession": true,
  "message": "You have an active session",
  "data": {
    "userId": 123,
    "sessionId": "abc-123-xyz",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Too many login attempts
- `500 Internal Server Error` - Server error

---

### POST /auth/verify-otp

Verify OTP code and complete authentication.

**Request:**
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "userId": 123,
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "userId": 123,
    "username": "john.doe",
    "email": "john.doe@aps.dz",
    "roles": ["Journalist", "Topic Editor"]
  }
}
```

**Note:** JWT token is set in HTTP-only cookie.

---

### POST /auth/resend-otp

Resend OTP code to user's email.

**Request:**
```http
POST /auth/resend-otp
Content-Type: application/json

{
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

---

### POST /auth/close

Force close existing session and create new one.

**Request:**
```http
POST /auth/close
Content-Type: application/json

{
  "sessionId": "abc-123-xyz",
  "userId": 123,
  "username": "john.doe",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "success": true,
  "hasSession": false,
  "message": "Previous session closed. OTP sent to your email",
  "data": {
    "userId": 123,
    "email": "jo******@aps.dz"
  }
}
```

---

### POST /auth/menu

Get user's menu structure and privileges (requires authentication).

**Request:**
```http
POST /auth/menu
Cookie: jwt=<token>
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "privileges": [
      "articles.create",
      "articles.read",
      "articles.update",
      "media.upload",
      "tags.read"
    ],
    "topics": [
      {
        "id": 1,
        "name": "politique",
        "label": "Politique",
        "privilege": "articles.read.topic"
      },
      {
        "id": 2,
        "name": "economie",
        "label": "Économie",
        "privilege": "articles.read.topic"
      }
    ],
    "other": [
      {
        "id": "roles",
        "name": "Rôles",
        "privilege": "roles.read"
      },
      {
        "id": "utilisateurs",
        "name": "Utilisateurs",
        "privilege": "users.read"
      }
    ]
  }
}
```

---

### POST /auth/logout

Logout user and invalidate session.

**Request:**
```http
POST /auth/logout
Cookie: jwt=<token>
Content-Type: application/json

{
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## User Management Endpoints

### POST /users

List all users with optional filters and pagination.

**Required Permission:** `users.read`

**Request:**
```http
POST /users
Cookie: jwt=<token>
Content-Type: application/json

{
  "page": 1,
  "limit": 10,
  "search": "john",
  "role": 2,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_user": 123,
      "username": "john.doe",
      "email": "john.doe@aps.dz",
      "full_name": "John Doe",
      "phone": "0555123456",
      "avatar_url": "https://cdn.aps.dz/avatars/john.jpg",
      "is_active": true,
      "is_blocked": false,
      "roles": [
        {
          "id_role": 2,
          "name": "Journalist"
        }
      ],
      "last_login": "2024-01-15T10:30:00Z",
      "created_at": "2023-01-01T00:00:00Z",
      "created_by": "admin"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### POST /users/create

Create a new user.

**Required Permission:** `users.create`

**Request:**
```http
POST /users/create
Cookie: jwt=<token>
Content-Type: application/json

{
  "username": "jane.smith",
  "email": "jane.smith@aps.dz",
  "password": "SecureP@ss456",
  "full_name": "Jane Smith",
  "phone": "0666789012",
  "roles": [2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id_user": 124,
    "username": "jane.smith",
    "email": "jane.smith@aps.dz",
    "full_name": "Jane Smith",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

**Validation Rules:**
- Username: alphanumeric, underscores, hyphens only
- Email: must end with `@aps.dz`
- Password: 8-16 chars, must include letters, numbers, symbols
- Phone: exactly 10 digits

**Error Responses:**
- `422 Unprocessable Entity` - Validation error
- `409 Conflict` - Username or email already exists

---

### PUT /users/update

Update an existing user.

**Required Permission:** `users.update`

**Request:**
```http
PUT /users/update
Cookie: jwt=<token>
Content-Type: application/json

{
  "userId": 124,
  "full_name": "Jane A. Smith",
  "phone": "0666789999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id_user": 124,
    "full_name": "Jane A. Smith",
    "phone": "0666789999",
    "updated_at": "2024-01-15T13:00:00Z"
  }
}
```

---

### PUT /users/delete

Soft delete a user (sets deleted_at timestamp).

**Required Permission:** `users.delete`

**Request:**
```http
PUT /users/delete
Cookie: jwt=<token>
Content-Type: application/json

{
  "userId": 124
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### PUT /users/block

Block a user account due to security violations or policy breaches.

**Required Permission:** `users.block`

**Request:**
```http
PUT /users/block
Cookie: jwt=<token>
Content-Type: application/json

{
  "userId": 124,
  "blockCode": 220,
  "reason": "Multiple XSS injection attempts"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

### GET /users/:id

Get detailed information about a specific user.

**Required Permission:** `users.read`

**Request:**
```http
GET /users/123
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id_user": 123,
    "username": "john.doe",
    "email": "john.doe@aps.dz",
    "full_name": "John Doe",
    "phone": "0555123456",
    "avatar_url": "https://cdn.aps.dz/avatars/john.jpg",
    "is_active": true,
    "is_blocked": false,
    "roles": [
      {
        "id_role": 2,
        "name": "Journalist",
        "description": "Content creator"
      }
    ],
    "topics": [
      {
        "id_topic": 1,
        "name": "politique"
      }
    ],
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "created_by": "admin",
    "statistics": {
      "articles_created": 45,
      "articles_published": 38,
      "articles_draft": 7
    }
  }
}
```

---

## Role Management Endpoints

### POST /roles

List all roles.

**Required Permission:** `roles.read`

**Request:**
```http
POST /roles
Cookie: jwt=<token>
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_role": 1,
      "name": "Administrator",
      "description": "Full system access",
      "created_date": "2023-01-01T00:00:00Z",
      "created_by": "system",
      "user_count": 3
    },
    {
      "id_role": 2,
      "name": "Journalist",
      "description": "Content creator",
      "created_date": "2023-01-01T00:00:00Z",
      "created_by": "admin",
      "user_count": 25
    }
  ]
}
```

---

### POST /roles/create

Create a new role.

**Required Permission:** `roles.create`

**Request:**
```http
POST /roles/create
Cookie: jwt=<token>
Content-Type: application/json

{
  "name": "Copy Editor",
  "description": "Reviews and edits content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id_role": 10,
    "name": "Copy Editor",
    "description": "Reviews and edits content",
    "created_date": "2024-01-15T14:00:00Z"
  }
}
```

---

### PUT /roles/update

Update an existing role.

**Required Permission:** `roles.update`

**Request:**
```http
PUT /roles/update
Cookie: jwt=<token>
Content-Type: application/json

{
  "roleId": 10,
  "name": "Senior Copy Editor",
  "description": "Reviews, edits, and mentors"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully"
}
```

---

### PUT /roles/delete

Delete a role (if no users assigned).

**Required Permission:** `roles.delete`

**Request:**
```http
PUT /roles/delete
Cookie: jwt=<token>
Content-Type: application/json

{
  "roleId": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

### POST /roles/privileges

Get privileges assigned to a role.

**Required Permission:** `roles.read`

**Request:**
```http
POST /roles/privileges
Cookie: jwt=<token>
Content-Type: application/json

{
  "roleId": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roleId": 2,
    "roleName": "Journalist",
    "privileges": [
      {
        "id": 5,
        "name": "articles.create",
        "description": "Create new articles"
      },
      {
        "id": 6,
        "name": "articles.read",
        "description": "Read articles"
      },
      {
        "id": 15,
        "name": "media.upload",
        "description": "Upload media files"
      }
    ]
  }
}
```

---

### PUT /roles/privileges/update

Update privileges for a role.

**Required Permission:** `roles.update`

**Request:**
```http
PUT /roles/privileges/update
Cookie: jwt=<token>
Content-Type: application/json

{
  "roleId": 2,
  "privileges": [5, 6, 7, 15]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Privileges updated successfully"
}
```

---

### POST /roles/users

Get users assigned to a role.

**Required Permission:** `roles.read`

**Request:**
```http
POST /roles/users
Cookie: jwt=<token>
Content-Type: application/json

{
  "roleId": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_user": 123,
      "username": "john.doe",
      "full_name": "John Doe",
      "email": "john.doe@aps.dz",
      "is_active": true
    }
  ]
}
```

---

### PUT /roles/users/add

Add a user to a role.

**Required Permission:** `roles.update`

**Request:**
```http
PUT /roles/users/add
Cookie: jwt=<token>
Content-Type: application/json

{
  "roleId": 2,
  "userId": 125
}
```

**Response:**
```json
{
  "success": true,
  "message": "User added to role successfully"
}
```

---

## Article Management Endpoints

### POST /articles

List articles with filters and pagination.

**Required Permission:** `articles.read`

**Request:**
```http
POST /articles
Cookie: jwt=<token>
Content-Type: application/json

{
  "topicId": 1,
  "status": "published",
  "page": 1,
  "limit": 20,
  "search": "economy",
  "categoryId": 5,
  "authorId": 123,
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_article": 456,
      "title": "Economic Growth in Algeria",
      "content_intro": "The Algerian economy shows...",
      "status": "published",
      "topic": {
        "id": 1,
        "name": "economie"
      },
      "author": {
        "id": 123,
        "username": "john.doe",
        "full_name": "John Doe"
      },
      "categories": [
        { "id": 5, "name": "Economy" }
      ],
      "tags": ["economy", "growth", "algeria"],
      "featured_image": "https://cdn.aps.dz/images/article456.jpg",
      "views": 1250,
      "language": "fr",
      "published_at": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-14T15:00:00Z",
      "updated_at": "2024-01-15T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

---

### POST /articles/create

Create a new article.

**Required Permission:** `articles.create`

**Request:**
```http
POST /articles/create
Cookie: jwt=<token>
Content-Type: application/json

{
  "title": "Breaking: New Economic Policy",
  "content_intro": "The government announced...",
  "content_full": "Full article content here...",
  "topicId": 1,
  "categoryIds": [5, 12],
  "tags": ["economy", "policy", "government"],
  "language": "fr",
  "featured_image": "https://cdn.aps.dz/images/new-article.jpg",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id_article": 457,
    "title": "Breaking: New Economic Policy",
    "status": "draft",
    "created_at": "2024-01-16T10:00:00Z"
  }
}
```

---

### PUT /articles/update

Update an existing article.

**Required Permission:** `articles.update`

**Request:**
```http
PUT /articles/update
Cookie: jwt=<token>
Content-Type: application/json

{
  "articleId": 457,
  "title": "Breaking: New Economic Policy Announced",
  "content_full": "Updated full content...",
  "categoryIds": [5, 12, 18],
  "tags": ["economy", "policy", "government", "2024"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article updated successfully",
  "data": {
    "id_article": 457,
    "updated_at": "2024-01-16T11:00:00Z"
  }
}
```

---

### DELETE /articles/:id

Delete an article (soft delete).

**Required Permission:** `articles.delete`

**Request:**
```http
DELETE /articles/457
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

---

### GET /articles/:id

Get detailed information about a specific article.

**Required Permission:** `articles.read`

**Request:**
```http
GET /articles/456
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id_article": 456,
    "title": "Economic Growth in Algeria",
    "content_intro": "The Algerian economy shows...",
    "content_full": "Full article content...",
    "status": "published",
    "topic": {
      "id": 1,
      "name": "economie",
      "label": "Économie"
    },
    "author": {
      "id": 123,
      "username": "john.doe",
      "full_name": "John Doe",
      "avatar_url": "https://cdn.aps.dz/avatars/john.jpg"
    },
    "categories": [
      {
        "id": 5,
        "name": "Economy",
        "slug": "economy"
      }
    ],
    "tags": ["economy", "growth", "algeria"],
    "featured_image": "https://cdn.aps.dz/images/article456.jpg",
    "media": [
      {
        "id": 78,
        "type": "image",
        "url": "https://cdn.aps.dz/images/media78.jpg",
        "caption": "Economic indicators chart"
      }
    ],
    "views": 1250,
    "language": "fr",
    "published_at": "2024-01-15T10:00:00Z",
    "scheduled_at": null,
    "created_at": "2024-01-14T15:00:00Z",
    "updated_at": "2024-01-15T09:30:00Z",
    "version": 3,
    "seo": {
      "meta_description": "Article about economic growth...",
      "keywords": ["economy", "algeria", "growth"]
    }
  }
}
```

---

### PUT /articles/publish

Publish an article immediately.

**Required Permission:** `articles.publish`

**Request:**
```http
PUT /articles/publish
Cookie: jwt=<token>
Content-Type: application/json

{
  "articleId": 457
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article published successfully",
  "data": {
    "id_article": 457,
    "status": "published",
    "published_at": "2024-01-16T12:00:00Z"
  }
}
```

---

### PUT /articles/schedule

Schedule an article for future publication.

**Required Permission:** `articles.publish`

**Request:**
```http
PUT /articles/schedule
Cookie: jwt=<token>
Content-Type: application/json

{
  "articleId": 457,
  "scheduledAt": "2024-01-20T08:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article scheduled successfully",
  "data": {
    "id_article": 457,
    "status": "scheduled",
    "scheduled_at": "2024-01-20T08:00:00Z"
  }
}
```

---

## Category Management Endpoints

### GET /categories

List all categories.

**Required Permission:** `categories.read`

**Request:**
```http
GET /categories
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_category": 1,
      "name": "Politique",
      "slug": "politique",
      "parent_id": null,
      "description": "Articles politiques",
      "article_count": 150
    },
    {
      "id_category": 5,
      "name": "Économie",
      "slug": "economie",
      "parent_id": null,
      "description": "Articles économiques",
      "article_count": 200
    }
  ]
}
```

---

## Tag Management Endpoints

### GET /tags

List all tags with usage count.

**Required Permission:** `tags.read`

**Request:**
```http
GET /tags?limit=50
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_tag": 1,
      "name": "economy",
      "usage_count": 245
    },
    {
      "id_tag": 2,
      "name": "politics",
      "usage_count": 189
    }
  ]
}
```

---

## Media Management Endpoints

### POST /media/upload

Upload a media file (image, video).

**Required Permission:** `media.upload`

**Request:**
```http
POST /media/upload
Cookie: jwt=<token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "type": "image",
  "caption": "Photo description",
  "alt_text": "Alternative text for accessibility"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "id_media": 89,
    "url": "https://cdn.aps.dz/images/media89.jpg",
    "type": "image",
    "size": 524288,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "uploaded_at": "2024-01-16T13:00:00Z"
  }
}
```

**File Requirements:**
- **Max size**: 5MB (5242880 bytes)
- **Allowed types**: JPEG, PNG, GIF, WebP, MP4, MOV
- **Image formats**: Will be optimized and resized

---

## Logging Endpoints

### POST /logs/front

Submit a frontend log event.

**Request:**
```http
POST /logs/front
Cookie: jwt=<token>
Content-Type: application/json

{
  "level": "error",
  "message": "XSS attempt detected in user input",
  "folder": "blocage",
  "action": "Html Tags"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Log recorded successfully"
}
```

---

### GET /logs/:type

Get logs by type.

**Required Permission:** `logs.read`

**Request:**
```http
GET /logs/users?page=1&limit=50&dateFrom=2024-01-01
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "user_id": 123,
      "username": "john.doe",
      "action": "update",
      "resource": "user",
      "resource_id": 125,
      "details": "Updated user full_name",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 523
  }
}
```

**Log Types:**
- `users` - User management logs
- `roles` - Role management logs
- `articles` - Article logs
- `categories` - Category logs
- `tags` - Tag logs
- `login_erreurs` - Failed login attempts
- `front` - Frontend error logs
- `blocage` - Security violation logs

---

### GET /logs/sessions

Get session logs for monitoring active sessions.

**Required Permission:** `logs.read`

**Request:**
```http
GET /logs/sessions
Cookie: jwt=<token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "abc-123-xyz",
      "user_id": 123,
      "username": "john.doe",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "login_time": "2024-01-15T10:30:00Z",
      "last_activity": "2024-01-15T14:45:00Z",
      "is_active": true
    }
  ]
}
```

---

## Rate Limiting

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642608000
```

### Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Read Operations | 100 requests | 1 minute |
| Write Operations | 30 requests | 1 minute |
| File Uploads | 10 requests | 5 minutes |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

---

## Webhooks (Future Feature)

*Webhook functionality is planned for future releases to enable real-time notifications to external systems.*

---

## API Versioning

Currently using **v1** (implied). Future versions will use explicit versioning:

```
/api/v2/articles
```

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [Security Practices](./security.md)
- [Workflow Documentation](./workflow.md)
- [Permissions Guide](./permissions.md)

---

**Last Updated**: 2024
**API Version**: 1.0
