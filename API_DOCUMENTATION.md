# 📚 Amrikyy Travel Agent - API Documentation

**Version**: 2.0.0  
**Base URL**: `http://localhost:5000/api` (Development)  
**Production URL**: `https://api.amrikyy.com/api`  
**Last Updated**: October 22, 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Bookings](#bookings)
3. [Webhooks](#webhooks)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Register User

**Endpoint**: `POST /api/auth/signup`  
**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjHYzVzNDI3NTY3ODkw...",
    "expires_at": 1698765432,
    "expires_in": 3600
  }
}
```

**Validation Rules**:
- Email must be valid format
- Password must be at least 6 characters
- Full name is optional

---

### Login

**Endpoint**: `POST /api/auth/login`  
**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjHYzVzNDI3NTY3ODkw...",
    "expires_at": 1698765432,
    "expires_in": 3600
  }
}
```

---

### Refresh Token

**Endpoint**: `POST /api/auth/refresh-token`  
**Access**: Public

**Request Body**:
```json
{
  "refresh_token": "v1.MRjHYzVzNDI3NTY3ODkw..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjHYzVzNDI3NTY3ODkw...",
    "expires_at": 1698765432,
    "expires_in": 3600
  }
}
```

---

### Logout

**Endpoint**: `POST /api/auth/logout`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`  
**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

**Note**: Always returns success to prevent email enumeration attacks.

---

### Reset Password

**Endpoint**: `POST /api/auth/reset-password`  
**Access**: Public

**Request Body**:
```json
{
  "access_token": "reset-token-from-email",
  "new_password": "NewSecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

### Get Current User

**Endpoint**: `GET /api/auth/me`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## ✈️ Bookings

### Create Booking

**Endpoint**: `POST /api/bookings`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "flightDetails": {
    "origin": "Cairo (CAI)",
    "destination": "Dubai (DXB)",
    "departureDate": "2025-11-15",
    "returnDate": "2025-11-22",
    "passengers": 2,
    "class": "Economy",
    "airline": "Emirates",
    "flightNumber": "EK924"
  },
  "travelerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "passportNumber": "A12345678"
  },
  "totalPrice": 850.00,
  "currency": "usd"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "booking": {
    "id": "BK-L9X2K4-A7B3C9",
    "status": "pending",
    "flightDetails": {
      "origin": "Cairo (CAI)",
      "destination": "Dubai (DXB)",
      "departureDate": "2025-11-15",
      "returnDate": "2025-11-22",
      "passengers": 2,
      "class": "Economy"
    },
    "travelerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "totalPrice": 850.00,
    "currency": "usd"
  },
  "payment": {
    "clientSecret": "pi_3ABC123_secret_XYZ789",
    "paymentIntentId": "pi_3ABC123456789"
  }
}
```

**Validation Rules**:
- `flightDetails.origin` - Required
- `flightDetails.destination` - Required
- `flightDetails.departureDate` - Required (ISO 8601 format)
- `travelerInfo.firstName` - Required
- `travelerInfo.lastName` - Required
- `travelerInfo.email` - Required (valid email format)
- `totalPrice` - Required (positive number)
- `currency` - Optional (default: "usd")

---

### Get Booking

**Endpoint**: `GET /api/bookings/:id`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "booking": {
    "id": "BK-L9X2K4-A7B3C9",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "confirmed",
    "flight_details": {
      "origin": "Cairo (CAI)",
      "destination": "Dubai (DXB)",
      "departureDate": "2025-11-15",
      "returnDate": "2025-11-22",
      "passengers": 2,
      "class": "Economy"
    },
    "traveler_info": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "total_price": 850.00,
    "currency": "usd",
    "payment_intent_id": "pi_3ABC123456789",
    "created_at": "2025-10-22T10:30:00.000Z",
    "confirmed_at": "2025-10-22T10:35:00.000Z"
  }
}
```

---

### Get User Bookings

**Endpoint**: `GET /api/bookings/user/:userId`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `status` (optional): Filter by status (`pending`, `confirmed`, `failed`, `cancelled`, `refunded`)
- `limit` (optional): Number of results (1-100, default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Example**: `GET /api/bookings/user/550e8400-e29b-41d4-a716-446655440000?status=confirmed&limit=20&offset=0`

**Response** (200 OK):
```json
{
  "success": true,
  "bookings": [
    {
      "id": "BK-L9X2K4-A7B3C9",
      "status": "confirmed",
      "flight_details": {
        "origin": "Cairo (CAI)",
        "destination": "Dubai (DXB)",
        "departureDate": "2025-11-15"
      },
      "total_price": 850.00,
      "currency": "usd",
      "created_at": "2025-10-22T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Cancel Booking

**Endpoint**: `POST /api/bookings/:id/cancel`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "booking": {
    "id": "BK-L9X2K4-A7B3C9",
    "status": "cancelled"
  }
}
```

---

### Request Refund

**Endpoint**: `POST /api/bookings/:id/refund`  
**Access**: Private

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body** (optional):
```json
{
  "amount": 425.00
}
```

**Note**: If `amount` is not provided, full refund will be processed.

**Response** (200 OK):
```json
{
  "success": true,
  "refund": {
    "id": "re_3ABC123456789",
    "amount": 850.00,
    "currency": "usd",
    "status": "succeeded"
  }
}
```

---

## 🔔 Webhooks

### Stripe Webhook

**Endpoint**: `POST /api/stripe/webhook`  
**Access**: Public (verified with signature)

**Headers**:
```
stripe-signature: t=1234567890,v1=abc123...
```

**Supported Events**:
- `payment_intent.succeeded` - Payment successful, booking confirmed
- `payment_intent.payment_failed` - Payment failed, booking marked as failed
- `payment_intent.canceled` - Payment canceled
- `charge.refunded` - Refund processed
- `checkout.session.completed` - Checkout session completed
- `checkout.session.async_payment_failed` - Checkout payment failed

**Response** (200 OK):
```json
{
  "success": true,
  "received": true,
  "eventType": "payment_intent.succeeded"
}
```

**Webhook Configuration**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events listed above
4. Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## ❌ Error Handling

All errors follow a standardized format:

```json
{
  "success": false,
  "error": "Error message here",
  "errors": null,
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | External service error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Common Error Examples

**Validation Error** (400):
```json
{
  "success": false,
  "error": "Missing required fields: email, password",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

**Authentication Error** (401):
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

**Not Found Error** (404):
```json
{
  "success": false,
  "error": "Booking not found",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

**Conflict Error** (409):
```json
{
  "success": false,
  "error": "Email already registered",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

---

## ⏱️ Rate Limiting

**Default Limits**:
- 100 requests per 15 minutes per IP address
- Authenticated users: 200 requests per 15 minutes

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432
```

**Rate Limit Exceeded** (429):
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "timestamp": "2025-10-22T10:30:00.000Z"
}
```

---

## 📝 Examples

### Complete Booking Flow (cURL)

#### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### 3. Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "flightDetails": {
      "origin": "Cairo (CAI)",
      "destination": "Dubai (DXB)",
      "departureDate": "2025-11-15",
      "returnDate": "2025-11-22",
      "passengers": 2,
      "class": "Economy"
    },
    "travelerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "totalPrice": 850.00,
    "currency": "usd"
  }'
```

#### 4. Get Booking
```bash
curl http://localhost:5000/api/bookings/BK-L9X2K4-A7B3C9 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5. Get User Bookings
```bash
curl "http://localhost:5000/api/bookings/user/USER_ID?status=confirmed&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### JavaScript/TypeScript Examples

#### Using Fetch API

```javascript
// Register User
const signup = async () => {
  const response = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'SecurePass123!',
      fullName: 'John Doe'
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Create Booking
const createBooking = async (accessToken) => {
  const response = await fetch('http://localhost:5000/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      flightDetails: {
        origin: 'Cairo (CAI)',
        destination: 'Dubai (DXB)',
        departureDate: '2025-11-15',
        returnDate: '2025-11-22',
        passengers: 2,
        class: 'Economy'
      },
      travelerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      totalPrice: 850.00,
      currency: 'usd'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

#### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register User
const signup = async () => {
  try {
    const { data } = await api.post('/auth/signup', {
      email: 'john@example.com',
      password: 'SecurePass123!',
      fullName: 'John Doe'
    });
    console.log(data);
  } catch (error) {
    console.error(error.response.data);
  }
};

// Create Booking
const createBooking = async () => {
  try {
    const { data } = await api.post('/bookings', {
      flightDetails: {
        origin: 'Cairo (CAI)',
        destination: 'Dubai (DXB)',
        departureDate: '2025-11-15',
        returnDate: '2025-11-22',
        passengers: 2,
        class: 'Economy'
      },
      travelerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      totalPrice: 850.00,
      currency: 'usd'
    });
    console.log(data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies or secure storage)
3. **Never expose API keys** in client-side code
4. **Implement CSRF protection** for state-changing operations
5. **Validate all input** on both client and server
6. **Use rate limiting** to prevent abuse
7. **Monitor for suspicious activity**
8. **Keep dependencies updated**

---

## 📞 Support

For API support:
- Email: api-support@amrikyy.com
- Documentation: https://docs.amrikyy.com
- Status Page: https://status.amrikyy.com

---

**Last Updated**: October 22, 2025  
**Version**: 2.0.0  
**Maintained by**: Amrikyy Development Team
