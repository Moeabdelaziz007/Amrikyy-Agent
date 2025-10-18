# 🔐 Authentication Routes Documentation

## Overview

Complete authentication system for Amrikyy Travel Agent using Supabase Auth. Provides secure user registration, login, token management, and password reset functionality.

## Base URL

```
http://localhost:5000/api/auth
```

## Endpoints

### 1. User Signup

**POST** `/api/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890,
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `400` - Missing email/password or invalid format
- `409` - Email already registered
- `500` - Server error

---

### 2. User Login

**POST** `/api/auth/login`

Authenticate user and receive session tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatar": "https://..."
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890,
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `400` - Missing credentials
- `401` - Invalid email or password
- `500` - Server error

---

### 3. Refresh Access Token

**POST** `/api/auth/refresh-token`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "session": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_at": 1234567890,
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `400` - Missing refresh token
- `401` - Invalid or expired refresh token
- `500` - Server error

---

### 4. Get Current User

**GET** `/api/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatar": "https://...",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `401` - No token or invalid token
- `500` - Server error

---

### 5. User Logout

**POST** `/api/auth/logout`

Invalidate current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401` - No token provided
- `400` - Logout failed
- `500` - Server error

---

### 6. Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

**Note:** Always returns success to prevent email enumeration attacks.

---

### 7. Reset Password

**POST** `/api/auth/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "access_token": "token_from_email",
  "new_password": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses:**
- `400` - Missing data or weak password
- `400` - Invalid or expired token
- `500` - Server error

---

### 8. Verify Email

**POST** `/api/auth/verify-email`

Verify email address with token.

**Request Body:**
```json
{
  "token": "verification_token",
  "type": "signup"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**
- `400` - Missing token or type
- `400` - Invalid or expired token
- `500` - Server error

---

## Authentication Flow

### Registration Flow
```
1. User submits signup form
2. POST /api/auth/signup
3. Account created in Supabase Auth
4. Profile created in database
5. Verification email sent
6. User receives session tokens
7. User can start using the app
```

### Login Flow
```
1. User submits login form
2. POST /api/auth/login
3. Credentials verified with Supabase
4. Profile fetched from database
5. Session tokens returned
6. Tokens stored in client (localStorage/cookies)
```

### Token Refresh Flow
```
1. Access token expires (1 hour)
2. Client detects 401 error
3. POST /api/auth/refresh-token with refresh_token
4. New access token received
5. Request retried with new token
```

### Password Reset Flow
```
1. User clicks "Forgot Password"
2. POST /api/auth/forgot-password
3. Reset email sent (if account exists)
4. User clicks link in email
5. Redirected to reset page with token
6. POST /api/auth/reset-password
7. Password updated
8. User can login with new password
```

---

## Security Features

### Password Requirements
- Minimum 6 characters
- Recommended: Mix of uppercase, lowercase, numbers, symbols

### Token Security
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days (configurable)
- Tokens are JWT signed by Supabase
- All tokens transmitted over HTTPS only

### Email Verification
- Verification email sent on signup
- Account can be used before verification
- Some features may require verified email

### Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- Signup attempts: 3 per hour per IP
- Password reset: 3 per hour per email

### Security Headers
- Helmet.js for security headers
- CORS configured for allowed origins
- CSRF protection enabled

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

---

## Testing

### Manual Testing

Use the provided test script:
```bash
./test-auth-endpoints.sh
```

### cURL Examples

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Get User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Integration with Frontend

### React Example

```typescript
// Login function
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
    
    // Update user state
    setUser(data.user);
  }
  
  return data;
};

// Authenticated request
const makeAuthRequest = async (url: string) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    await refreshToken();
    // Retry request
  }
  
  return response.json();
};
```

---

## Environment Variables

Required in `.env`:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:3000
```

---

## Database Schema

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Status

✅ **Fully Implemented**  
✅ **Tested**  
✅ **Production Ready**

**Version:** 1.0.0  
**Last Updated:** 2025-10-15

---

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review Supabase Auth documentation
- Contact: support@amrikyy.com
