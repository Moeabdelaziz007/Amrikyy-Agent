# 🔐 Frontend Auth Integration Guide

## Overview

Complete guide for integrating Amrikyy backend authentication with the React frontend. The system supports both backend API auth and Supabase auth, switchable via environment variable.

## Architecture

### Dual Auth System

The frontend supports two authentication modes:

1. **Backend API Auth** (Recommended)
   - Uses `/api/auth/*` endpoints
   - JWT token-based authentication
   - Automatic token refresh
   - Full control over auth flow

2. **Supabase Direct Auth** (Legacy)
   - Uses Supabase client directly
   - OAuth support (Google, GitHub)
   - Email verification built-in

## Files Created/Modified

### New Files

1. **`frontend/src/api/authService.ts`**
   - Backend API authentication service
   - Token management (access + refresh)
   - User session handling
   - Automatic token refresh

2. **`frontend/src/api/axiosConfig.ts`**
   - Axios instance with interceptors
   - Automatic token injection
   - Token refresh on 401 errors
   - Request queue during refresh

3. **`frontend/.env.example`**
   - Environment variable template
   - Configuration options

### Modified Files

1. **`frontend/src/components/Auth/AuthProvider.tsx`**
   - Added backend API support
   - Dual mode switching
   - Maintains backward compatibility

## Setup Instructions

### 1. Environment Configuration

Create `frontend/.env` file:

```bash
# Copy example file
cp frontend/.env.example frontend/.env
```

Edit `.env`:

```env
# Use backend API for authentication
VITE_API_URL=http://localhost:5000
VITE_USE_BACKEND_AUTH=true

# Optional: Supabase (if using direct mode)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at: [http://localhost:3000](http://localhost:3000)

## Usage

### Authentication Flow

#### 1. User Signup

```typescript
import { useAuth } from './components/Auth/AuthProvider';

const { signUp } = useAuth();

const handleSignup = async () => {
  const { data, error } = await signUp(
    'user@example.com',
    'SecurePass123!',
    'John Doe' // optional
  );
  
  if (error) {
    console.error('Signup failed:', error);
  } else {
    console.log('Signup successful:', data);
  }
};
```

#### 2. User Login

```typescript
import { useAuth } from './components/Auth/AuthProvider';

const { signIn } = useAuth();

const handleLogin = async () => {
  const { data, error } = await signIn(
    'user@example.com',
    'SecurePass123!'
  );
  
  if (error) {
    console.error('Login failed:', error);
  } else {
    console.log('Login successful:', data);
  }
};
```

#### 3. Get Current User

```typescript
import { useAuth } from './components/Auth/AuthProvider';

const { user, loading } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}

if (user) {
  return <div>Welcome, {user.email}!</div>;
}

return <div>Please log in</div>;
```

#### 4. Logout

```typescript
import { useAuth } from './components/Auth/AuthProvider';

const { signOut } = useAuth();

const handleLogout = async () => {
  const { error } = await signOut();
  
  if (error) {
    console.error('Logout failed:', error);
  } else {
    console.log('Logged out successfully');
  }
};
```

### Making Authenticated API Requests

#### Using Axios Client (Recommended)

```typescript
import apiClient from './api/axiosConfig';

// Automatic token injection and refresh
const fetchUserData = async () => {
  try {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
};
```

#### Using Auth Service Directly

```typescript
import authAPI from './api/authService';

const makeAuthRequest = async () => {
  const token = authAPI.getAccessToken();
  
  const response = await fetch('http://localhost:5000/api/trips', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## Token Management

### Automatic Token Refresh

The system automatically refreshes tokens when they expire:

1. **Request fails with 401**
2. **Interceptor catches error**
3. **Refresh token is used to get new access token**
4. **Original request is retried with new token**
5. **If refresh fails, user is logged out**

### Token Storage

Tokens are stored in `localStorage`:

```typescript
// Access token (expires in 1 hour)
localStorage.getItem('access_token');

// Refresh token (expires in 7 days)
localStorage.getItem('refresh_token');

// Token expiration timestamp
localStorage.getItem('token_expires_at');

// User data
localStorage.getItem('user');
```

### Manual Token Refresh

```typescript
import authAPI from './api/authService';

const refreshToken = async () => {
  const success = await authAPI.refreshAccessToken();
  
  if (success) {
    console.log('Token refreshed successfully');
  } else {
    console.log('Token refresh failed');
  }
};
```

## Testing

### Manual Testing

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Signup**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Click "Sign Up"
   - Fill in email, password, full name
   - Submit form
   - Check browser console for success/error

4. **Test Login**
   - Click "Login"
   - Enter credentials
   - Submit form
   - Verify user is logged in (check user state)

5. **Test Token Refresh**
   - Wait for token to expire (1 hour)
   - Make an API request
   - Token should refresh automatically
   - Request should succeed

6. **Test Logout**
   - Click logout button
   - Verify user is logged out
   - Verify tokens are cleared from localStorage

### Automated Testing

Create test file `frontend/src/api/__tests__/authService.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import authAPI from '../authService';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should sign up a new user', async () => {
    const response = await authAPI.signUp(
      'test@example.com',
      'TestPass123!',
      'Test User'
    );
    
    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();
    expect(response.session).toBeDefined();
  });

  it('should sign in existing user', async () => {
    const response = await authAPI.signIn(
      'test@example.com',
      'TestPass123!'
    );
    
    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();
  });

  it('should handle invalid credentials', async () => {
    const response = await authAPI.signIn(
      'invalid@example.com',
      'wrongpassword'
    );
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});
```

Run tests:
```bash
npm run test
```

## Troubleshooting

### Issue: "Network Error" on Login/Signup

**Solution:**
1. Verify backend server is running on port 5000
2. Check `VITE_API_URL` in `.env`
3. Verify CORS is configured in backend

### Issue: Token Refresh Not Working

**Solution:**
1. Check refresh token is stored in localStorage
2. Verify `/api/auth/refresh-token` endpoint is working
3. Check browser console for errors
4. Ensure refresh token hasn't expired (7 days)

### Issue: User Not Persisting After Refresh

**Solution:**
1. Check `localStorage` has `access_token` and `user`
2. Verify `AuthProvider` is calling `getCurrentUser()` on mount
3. Check browser console for auth errors

### Issue: OAuth Not Working

**Solution:**
OAuth (Google, GitHub) only works with Supabase direct mode:
1. Set `VITE_USE_BACKEND_AUTH=false`
2. Configure Supabase OAuth providers
3. Add redirect URLs in Supabase dashboard

## Security Best Practices

### 1. Token Storage

✅ **DO:**
- Store tokens in `localStorage` for web apps
- Clear tokens on logout
- Validate tokens on every request

❌ **DON'T:**
- Store tokens in cookies without `httpOnly` flag
- Expose tokens in URL parameters
- Log tokens to console in production

### 2. Password Requirements

- Minimum 6 characters (enforced by backend)
- Recommended: Mix of uppercase, lowercase, numbers, symbols
- Frontend validation before API call

### 3. HTTPS Only

- Always use HTTPS in production
- Tokens transmitted over HTTP are vulnerable
- Configure backend to reject HTTP requests

### 4. Token Expiration

- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Automatic refresh on expiration
- Manual logout clears all tokens

## API Endpoints Used

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Token refresh
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

See [AUTH_ROUTES_DOCUMENTATION.md](./AUTH_ROUTES_DOCUMENTATION.md) for complete API reference.

## Migration from Supabase

### Step 1: Update Environment

```env
# Change from Supabase to Backend API
VITE_USE_BACKEND_AUTH=true
```

### Step 2: Test Authentication

1. Test signup with new account
2. Test login with existing account
3. Verify token refresh works
4. Test logout

### Step 3: Update API Calls

Replace Supabase client calls with axios:

```typescript
// Before (Supabase)
const { data } = await supabase
  .from('trips')
  .select('*');

// After (Backend API)
const { data } = await apiClient.get('/api/trips');
```

## Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Check browser console for errors
- Review [AUTH_ROUTES_DOCUMENTATION.md](./AUTH_ROUTES_DOCUMENTATION.md)
- Contact: support@amrikyy.com

---

**Status**: ✅ Fully Integrated  
**Version**: 1.0.0  
**Last Updated**: 2025-10-15
