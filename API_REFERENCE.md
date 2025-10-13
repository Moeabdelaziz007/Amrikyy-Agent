# API Reference

Complete API documentation for the Amrikyy AI Automation Platform.

**Base URL**: `http://localhost:5001/api` (Development)  
**Production**: `https://your-domain.com/api`

**Authentication**: Most endpoints require JWT token in `Authorization: Bearer <token>` header.

---

## Table of Contents

- [Health & Monitoring](#health--monitoring)
- [AI Services](#ai-services)
- [Travel Services](#travel-services)
- [Quantum Intelligence](#quantum-intelligence)
- [Payment Processing](#payment-processing)
- [Telegram Mini App](#telegram-mini-app)
- [Admin Dashboard](#admin-dashboard)
- [Blockchain & KYC](#blockchain--kyc)
- [Gamification](#gamification)
- [Predictions](#predictions)
- [Workflow Automation](#workflow-automation)

---

## Health & Monitoring

### Health Check

Check if the API server is running.

```http
GET /api/health
```

**Response**:
```json
{
  "status": "healthy",
  "service": "amrikyy-backend",
  "timestamp": "2025-01-15T10:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

### Detailed Health Check

Get detailed system status including database and external services.

```http
GET /api/health/detailed
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai": "operational",
    "payment": "operational"
  },
  "metrics": {
    "uptime": 3600,
    "memory": "256MB",
    "cpu": "15%"
  }
}
```

### Prometheus Metrics

Get Prometheus-formatted metrics for monitoring.

```http
GET /metrics
```

**Response**: Prometheus text format

---

## AI Services

### Chat Completion

Send a message to Amrikyy AI assistant.

```http
POST /api/ai/chat
```

**Request Body**:
```json
{
  "message": "I want to travel to Egypt",
  "userId": "user123",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you today?"
    }
  ],
  "useTools": false,
  "region": "ar",
  "context": {
    "budget": 5000,
    "travelDates": "2025-03-01"
  }
}
```

**Response**:
```json
{
  "success": true,
  "response": "Egypt is a wonderful destination! I can help you plan your trip...",
  "intent": {
    "type": "travel_planning",
    "confidence": 0.95,
    "actions": ["search_flights", "recommend_hotels"]
  },
  "conversationId": "conv_abc123"
}
```

### Analyze Travel Preferences

Analyze user preferences using AI.

```http
POST /api/ai/analyze
```

**Request Body**:
```json
{
  "userId": "user123",
  "preferences": {
    "budget": "medium",
    "travelStyle": "adventure",
    "interests": ["history", "food", "nature"]
  },
  "pastTrips": [
    {
      "destination": "Paris",
      "rating": 5
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "travelPersonality": "Cultural Explorer",
    "recommendedDestinations": ["Cairo", "Istanbul", "Athens"],
    "budgetRange": "$2000-$4000",
    "bestTravelTime": "March-May"
  }
}
```

---

## Travel Services

### Search Flights & Hotels

Search for travel options using Amadeus API.

```http
POST /api/search
```

**Request Body**:
```json
{
  "type": "flight",
  "origin": "CAI",
  "destination": "DXB",
  "departureDate": "2025-03-15",
  "returnDate": "2025-03-22",
  "adults": 2,
  "class": "economy",
  "maxPrice": 5000
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "id": "flight_123",
      "airline": "Emirates",
      "price": 3500,
      "duration": "3h 30m",
      "stops": 0,
      "departure": "2025-03-15T10:00:00Z",
      "arrival": "2025-03-15T13:30:00Z"
    }
  ],
  "count": 15,
  "filters": {
    "airlines": ["Emirates", "Etihad"],
    "priceRange": [2000, 6000]
  }
}
```

### Book Travel

Book a flight or hotel.

```http
POST /api/book
```

**Request Body**:
```json
{
  "type": "flight",
  "offerId": "flight_123",
  "travelers": [
    {
      "firstName": "Mohamed",
      "lastName": "Abdelaziz",
      "email": "user@example.com",
      "phone": "+201234567890",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "A12345678"
    }
  ],
  "payment": {
    "method": "stripe",
    "token": "tok_visa"
  }
}
```

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "booking_abc123",
    "confirmationCode": "ABC123",
    "status": "confirmed",
    "totalPrice": 3500,
    "currency": "USD"
  }
}
```

### IZI Travel Destinations

Get travel destinations from IZI Travel API.

```http
GET /api/izi/destinations
```

**Query Parameters**:
- `country` (optional): Filter by country code
- `limit` (optional): Number of results (default: 20)

**Response**:
```json
{
  "success": true,
  "destinations": [
    {
      "id": "dest_123",
      "name": "Cairo",
      "country": "Egypt",
      "description": "Ancient city with pyramids...",
      "image": "https://...",
      "attractions": 150
    }
  ]
}
```

### Sabre GDS Search

Search using Sabre Global Distribution System.

```http
POST /api/sabre/search
```

**Request Body**:
```json
{
  "origin": "CAI",
  "destination": "JFK",
  "departureDate": "2025-04-01",
  "returnDate": "2025-04-10",
  "passengers": 1
}
```

**Response**: Similar to Amadeus search response.

---

## Quantum Intelligence

### Calculate Agent DNA

Calculate quantum DNA score for an AI agent.

```http
POST /api/quantum/calculate-dna
```

**Request Body**:
```json
{
  "personality": {
    "analytical": 80,
    "creative": 70,
    "empathetic": 85,
    "logical": 75,
    "intuitive": 80,
    "assertive": 65
  },
  "skills": {
    "coding": 60,
    "communication": 90,
    "problemSolving": 85,
    "leadership": 70,
    "learning": 80,
    "cultural": 95
  },
  "experience": {
    "years": 5,
    "projects": 20,
    "domains": ["travel", "ai", "automation"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "dna": {
    "score": 87.5,
    "grade": "A",
    "strengths": ["Cultural Intelligence", "Communication", "Problem Solving"],
    "weaknesses": ["Technical Coding"],
    "recommendations": [
      "Enhance coding skills through practice",
      "Leverage cultural intelligence in customer interactions"
    ]
  }
}
```

### Quantum V3 Analysis

Advanced quantum intelligence analysis.

```http
POST /api/quantum/v3/analyze
```

**Request Body**:
```json
{
  "userId": "user123",
  "context": {
    "travelHistory": [...],
    "preferences": {...},
    "budget": 5000
  },
  "analysisType": "comprehensive"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "emotionalIntelligence": {
      "score": 0.85,
      "insights": ["User prefers authentic experiences"]
    },
    "predictedBehavior": {
      "nextDestination": "Morocco",
      "probability": 0.78
    },
    "recommendations": [...]
  }
}
```

---

## Payment Processing

### Create Payment Intent

Create a Stripe payment intent.

```http
POST /api/payments/create
```

**Request Body**:
```json
{
  "amount": 3500,
  "currency": "usd",
  "bookingId": "booking_abc123",
  "userId": "user123",
  "metadata": {
    "type": "flight",
    "destination": "Dubai"
  }
}
```

**Response**:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx",
  "amount": 3500,
  "currency": "usd"
}
```

### Crypto Payment

Process cryptocurrency payment.

```http
POST /api/payments/crypto
```

**Request Body**:
```json
{
  "amount": 3500,
  "currency": "USDT",
  "network": "TRC20",
  "bookingId": "booking_abc123",
  "walletAddress": "TXxx...xxx"
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "crypto_pay_123",
    "status": "pending",
    "depositAddress": "TYyy...yyy",
    "amount": 3500,
    "expiresAt": "2025-01-15T11:00:00Z"
  }
}
```

### Stripe Webhook

Handle Stripe webhook events (internal use).

```http
POST /api/stripe/webhook
```

**Headers**:
- `stripe-signature`: Webhook signature

**Body**: Stripe event object

---

## Telegram Mini App

### Authenticate User

Authenticate Telegram user for mini app.

```http
POST /api/miniapp/auth
```

**Request Body**:
```json
{
  "initData": "query_id=xxx&user=...",
  "hash": "abc123..."
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user123",
    "telegramId": 123456789,
    "firstName": "Mohamed",
    "username": "mohamed"
  }
}
```

### Get User Profile

Get Telegram user profile.

```http
GET /api/miniapp/profile
```

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "profile": {
    "id": "user123",
    "firstName": "Mohamed",
    "username": "mohamed",
    "bookings": 5,
    "totalSpent": 15000,
    "memberSince": "2024-01-01"
  }
}
```

### Search in Mini App

Search for travel within Telegram mini app.

```http
POST /api/miniapp/search
```

**Request Body**:
```json
{
  "query": "Dubai hotels",
  "filters": {
    "priceRange": [100, 500],
    "rating": 4
  }
}
```

**Response**: Similar to main search endpoint.

---

## Admin Dashboard

### Get System Statistics

Get system-wide statistics (admin only).

```http
GET /api/admin/stats
```

**Headers**:
- `Authorization: Bearer <admin_token>`

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 10000,
    "totalBookings": 5000,
    "revenue": 2500000,
    "activeUsers": 1500,
    "conversionRate": 0.15
  },
  "period": "last_30_days"
}
```

### User Management

Get or update users (admin only).

```http
GET /api/admin/users
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `search`: Search query

**Response**:
```json
{
  "success": true,
  "users": [
    {
      "id": "user123",
      "email": "user@example.com",
      "name": "Mohamed",
      "bookings": 5,
      "totalSpent": 15000,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10000
  }
}
```

### Update Configuration

Update system configuration (admin only).

```http
POST /api/admin/config
```

**Request Body**:
```json
{
  "key": "maintenance_mode",
  "value": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Configuration updated"
}
```

---

## Blockchain & KYC

### Submit KYC

Submit KYC verification documents.

```http
POST /api/kyc/submit
```

**Request Body** (multipart/form-data):
- `userId`: User ID
- `documentType`: "passport" | "id_card" | "driver_license"
- `documentFront`: File upload
- `documentBack`: File upload (optional)
- `selfie`: File upload

**Response**:
```json
{
  "success": true,
  "verification": {
    "id": "kyc_123",
    "status": "pending",
    "estimatedTime": "24 hours"
  }
}
```

### Get KYC Status

Check KYC verification status.

```http
GET /api/kyc/status/:userId
```

**Response**:
```json
{
  "success": true,
  "status": "verified",
  "verifiedAt": "2025-01-15T10:00:00Z",
  "level": "tier_2"
}
```

### Blockchain Transaction

Create blockchain transaction.

```http
POST /api/blockchain/transaction
```

**Request Body**:
```json
{
  "type": "payment",
  "amount": 1000,
  "currency": "USDT",
  "recipient": "0x123...",
  "metadata": {
    "bookingId": "booking_abc123"
  }
}
```

**Response**:
```json
{
  "success": true,
  "transaction": {
    "hash": "0xabc...",
    "status": "pending",
    "confirmations": 0
  }
}
```

---

## Gamification

### Get User Points

Get user gamification points and level.

```http
GET /api/gamification/points/:userId
```

**Response**:
```json
{
  "success": true,
  "points": {
    "total": 5000,
    "level": 5,
    "nextLevel": 6000,
    "badges": ["Early Adopter", "Frequent Traveler"],
    "rank": 150
  }
}
```

### Award Points

Award points to user (internal/admin).

```http
POST /api/gamification/award
```

**Request Body**:
```json
{
  "userId": "user123",
  "points": 100,
  "reason": "booking_completed",
  "metadata": {
    "bookingId": "booking_abc123"
  }
}
```

**Response**:
```json
{
  "success": true,
  "newTotal": 5100,
  "levelUp": false
}
```

### Get Leaderboard

Get gamification leaderboard.

```http
GET /api/gamification/leaderboard
```

**Query Parameters**:
- `period`: "daily" | "weekly" | "monthly" | "all_time"
- `limit`: Number of results (default: 100)

**Response**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user456",
      "username": "TravelKing",
      "points": 50000,
      "level": 25
    }
  ]
}
```

---

## Predictions

### Get Travel Predictions

Get AI-powered travel predictions.

```http
POST /api/predictions/travel
```

**Request Body**:
```json
{
  "userId": "user123",
  "context": {
    "currentLocation": "Cairo",
    "budget": 5000,
    "travelHistory": [...]
  }
}
```

**Response**:
```json
{
  "success": true,
  "predictions": [
    {
      "destination": "Dubai",
      "probability": 0.85,
      "reasoning": "Based on your preferences for luxury and shopping",
      "bestTime": "November-March",
      "estimatedCost": 4500
    }
  ]
}
```

### Get Price Predictions

Predict future price trends.

```http
POST /api/predictions/price
```

**Request Body**:
```json
{
  "route": "CAI-DXB",
  "type": "flight",
  "travelDate": "2025-06-01"
}
```

**Response**:
```json
{
  "success": true,
  "prediction": {
    "currentPrice": 3500,
    "predictedPrice": 3200,
    "trend": "decreasing",
    "confidence": 0.78,
    "bestTimeToBook": "2025-04-15"
  }
}
```

---

## Workflow Automation

### Trigger N8N Workflow

Trigger an N8N automation workflow.

```http
POST /api/workflow/trigger
```

**Request Body**:
```json
{
  "workflowId": "workflow_123",
  "data": {
    "bookingId": "booking_abc123",
    "userId": "user123",
    "action": "send_confirmation"
  }
}
```

**Response**:
```json
{
  "success": true,
  "execution": {
    "id": "exec_456",
    "status": "running",
    "startedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Get Workflow Status

Check workflow execution status.

```http
GET /api/workflow/status/:executionId
```

**Response**:
```json
{
  "success": true,
  "execution": {
    "id": "exec_456",
    "status": "completed",
    "startedAt": "2025-01-15T10:00:00Z",
    "completedAt": "2025-01-15T10:01:30Z",
    "result": {
      "emailSent": true,
      "smsDelivered": true
    }
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service down |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user
- **Admin**: 10000 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sort`: Sort field (e.g., "createdAt")
- `order`: Sort order ("asc" | "desc")

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Webhooks

The API can send webhooks for important events:

### Webhook Events

- `booking.created` - New booking created
- `booking.confirmed` - Booking confirmed
- `booking.cancelled` - Booking cancelled
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed
- `kyc.verified` - KYC verification completed

### Webhook Payload

```json
{
  "event": "booking.confirmed",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "bookingId": "booking_abc123",
    "userId": "user123",
    "status": "confirmed"
  }
}
```

---

## SDK & Client Libraries

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- PHP
- Ruby

---

## Support

- **Documentation**: https://docs.amrikyy.ai
- **API Status**: https://status.amrikyy.ai
- **Support Email**: api-support@amrikyy.ai
- **GitHub Issues**: https://github.com/Moeabdelaziz007/amrikyy-agent/issues

---

**Last Updated**: January 15, 2025  
**API Version**: 1.0.0
