# 🚀 API Endpoints Documentation

Complete API reference for Amrikyy Travel Agent.

## 📋 Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [MCP Tools API](#mcp-tools-api)
4. [Security API](#security-api)
5. [Flights API](#flights-api)
6. [Hotels API](#hotels-api)
7. [Travel Agents API](#travel-agents-api)
8. [Error Handling](#error-handling)
9. [Rate Limits](#rate-limits)

---

## 🌐 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## 🔐 Authentication

### Token-Based Authentication

Some endpoints require authentication using ephemeral tokens.

**Header Format:**
```
Authorization: Bearer <token>
```

**Generate Token:**
```bash
POST /api/security/tokens/generate
```

---

## 🔧 MCP Tools API

### List All Tools

Get all available MCP tools.

**Endpoint:** `GET /api/mcp/tools`

**Response:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "search_flights",
      "description": "Search for flights between two locations",
      "inputSchema": {
        "type": "object",
        "properties": {
          "from": { "type": "string" },
          "to": { "type": "string" },
          "departureDate": { "type": "string" }
        },
        "required": ["from", "to", "departureDate"]
      }
    }
  ],
  "count": 5
}
```

---

### Call MCP Tool

Execute a specific MCP tool.

**Endpoint:** `POST /api/mcp/call`

**Request Body:**
```json
{
  "tool": "analyze_budget",
  "params": {
    "destination": "Paris",
    "budget": 2000,
    "duration": 5,
    "travelers": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "tool": "analyze_budget",
  "result": {
    "breakdown": {
      "flights": { "total": 800, "perPerson": 400 },
      "accommodation": { "total": 700, "perNight": 140 },
      "food": { "total": 300, "perDay": 60 },
      "activities": { "total": 200, "perDay": 40 }
    },
    "perPerson": 1000,
    "perDay": 400,
    "recommendations": [
      "Consider Airbnb or hostels instead of hotels",
      "Mix dining out with self-catering"
    ]
  }
}
```

---

### Batch Tool Execution

Execute multiple tools in sequence.

**Endpoint:** `POST /api/mcp/batch`

**Request Body:**
```json
{
  "calls": [
    {
      "tool": "search_locations",
      "params": { "query": "Paris" }
    },
    {
      "tool": "analyze_budget",
      "params": {
        "destination": "Paris",
        "budget": 2000,
        "duration": 5,
        "travelers": 2
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "tool": "search_locations",
      "success": true,
      "data": [...]
    },
    {
      "tool": "analyze_budget",
      "success": true,
      "data": {...}
    }
  ],
  "count": 2
}
```

---

### Analyze Budget

Convenience endpoint for budget analysis.

**Endpoint:** `POST /api/mcp/analyze-budget`

**Request Body:**
```json
{
  "destination": "London",
  "budget": 3000,
  "duration": 7,
  "travelers": 2
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "breakdown": {...},
    "perPerson": 1500,
    "perDay": 428.57,
    "recommendations": [...]
  }
}
```

---

### Compare Prices

Compare flight prices across dates.

**Endpoint:** `POST /api/mcp/compare-prices`

**Request Body:**
```json
{
  "from": "NYC",
  "to": "LON",
  "startDate": "01/12/2025",
  "endDate": "15/12/2025"
}
```

**Response:**
```json
{
  "success": true,
  "comparison": {
    "pricesByDate": [
      {
        "date": "01/12/2025",
        "price": 450,
        "currency": "USD",
        "bookingToken": "..."
      }
    ],
    "bestPrice": {
      "date": "05/12/2025",
      "price": 380,
      "currency": "USD"
    },
    "averagePrice": 425
  }
}
```

---

### Health Check

Check MCP server health.

**Endpoint:** `GET /api/mcp/health`

**Response:**
```json
{
  "success": true,
  "service": "MCP Travel Server",
  "services": {
    "kiwi": true,
    "mcp": true
  },
  "toolCount": 5
}
```

---

## 🔐 Security API

### Generate Token

Generate ephemeral access token.

**Endpoint:** `POST /api/security/tokens/generate`

**Request Body:**
```json
{
  "userId": "user123",
  "scope": ["flights:read", "mcp:call"],
  "expiresIn": "15m",
  "metadata": {
    "source": "web-app"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6...",
  "expiresAt": 1697654321000,
  "expiresIn": "15m",
  "scope": ["flights:read", "mcp:call"]
}
```

**Available Scopes:**
- `flights:read` - Read flight information
- `flights:write` - Create flight bookings
- `hotels:read` - Read hotel information
- `hotels:write` - Create hotel bookings
- `maps:read` - Access maps and geocoding
- `mcp:call` - Call MCP tools
- `agents:execute` - Execute AI agents

---

### Revoke Token

Revoke an access token.

**Endpoint:** `POST /api/security/tokens/revoke`

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

---

### Get Token Info

Get information about a token.

**Endpoint:** `GET /api/security/tokens/info`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "tokenInfo": {
    "userId": "user123",
    "scope": ["flights:read", "mcp:call"],
    "expiresAt": "2025-10-17T12:00:00.000Z",
    "createdAt": "2025-10-17T11:45:00.000Z",
    "usageCount": 5,
    "lastUsed": "2025-10-17T11:50:00.000Z",
    "isExpired": false
  }
}
```

---

### Token Statistics

Get token statistics.

**Endpoint:** `GET /api/security/tokens/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "active": 120,
    "expired": 30
  }
}
```

---

### Get Rate Limits

Get user's rate limit status.

**Endpoint:** `GET /api/security/rate-limits/:userId`

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "stats": {
    "kiwi": {
      "usedMinute": 3,
      "usedHour": 15,
      "limitMinute": 5,
      "limitHour": 50
    },
    "bookingCom": {
      "usedMinute": 2,
      "usedHour": 10,
      "limitMinute": 5,
      "limitHour": 50
    },
    "mapbox": {
      "usedMinute": 5,
      "usedHour": 25,
      "limitMinute": 10,
      "limitHour": 100
    }
  }
}
```

---

### Reset Rate Limits

Reset user's rate limits.

**Endpoint:** `POST /api/security/rate-limits/:userId/reset`

**Request Body:**
```json
{
  "api": "kiwi"  // Optional: specific API, omit to reset all
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rate limits reset for kiwi",
  "userId": "user123"
}
```

---

### List Available Scopes

Get all available permission scopes.

**Endpoint:** `GET /api/security/scopes`

**Response:**
```json
{
  "success": true,
  "scopes": [
    {
      "name": "flights:read",
      "description": "Read flight information"
    },
    {
      "name": "flights:write",
      "description": "Create flight bookings"
    }
  ]
}
```

---

## ✈️ Flights API

### Search Flights

Search for flights.

**Endpoint:** `POST /api/flights/search`

**Request Body:**
```json
{
  "from": "NYC",
  "to": "LON",
  "departureDate": "01/12/2025",
  "returnDate": "08/12/2025",
  "adults": 2,
  "children": 0,
  "currency": "USD",
  "maxStopovers": 1,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "flights": [
    {
      "id": "flight123",
      "bookingToken": "token123",
      "price": {
        "amount": 450,
        "currency": "USD"
      },
      "route": {
        "from": {
          "city": "New York",
          "airport": "JFK",
          "country": "United States"
        },
        "to": {
          "city": "London",
          "airport": "LHR",
          "country": "United Kingdom"
        }
      },
      "departure": {
        "local": "2025-12-01T10:00:00",
        "utc": "2025-12-01T15:00:00"
      },
      "arrival": {
        "local": "2025-12-01T22:00:00",
        "utc": "2025-12-01T22:00:00"
      },
      "duration": {
        "total": 420
      },
      "airlines": ["British Airways"],
      "stops": 0
    }
  ],
  "searchParams": {
    "from": "NYC",
    "to": "LON",
    "departureDate": "01/12/2025",
    "returnDate": "08/12/2025"
  }
}
```

---

### Search Locations

Search for airports and cities.

**Endpoint:** `GET /api/flights/locations?query=London`

**Response:**
```json
{
  "success": true,
  "locations": [
    {
      "id": "LON",
      "name": "London",
      "type": "city",
      "country": "United Kingdom"
    },
    {
      "id": "LHR",
      "name": "London Heathrow",
      "type": "airport",
      "country": "United Kingdom"
    }
  ]
}
```

---

### Get Flight Details

Get detailed flight information.

**Endpoint:** `POST /api/flights/details`

**Request Body:**
```json
{
  "bookingToken": "token123"
}
```

**Response:**
```json
{
  "success": true,
  "flight": {
    "id": "flight123",
    "price": {...},
    "route": {...},
    "segments": [...],
    "baggage": {...}
  }
}
```

---

### Create Booking

Create a flight booking (sandbox mode).

**Endpoint:** `POST /api/flights/book`

**Request Body:**
```json
{
  "bookingToken": "token123",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "nationality": "US",
      "passportNumber": "123456789",
      "passportExpiry": "2030-01-01"
    }
  ],
  "contactEmail": "john@example.com",
  "contactPhone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "booking123",
  "pnr": "ABC123",
  "message": "Booking created successfully (sandbox mode)"
}
```

---

## 🏨 Hotels API

### Search Hotels

Search for hotels.

**Endpoint:** `POST /api/hotels/search`

**Request Body:**
```json
{
  "cityId": "-2601889",
  "checkin": "2025-12-01",
  "checkout": "2025-12-05",
  "adults": 2,
  "rooms": 1,
  "currency": "USD",
  "minStars": 3,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "hotels": [
    {
      "id": "hotel123",
      "name": "Grand Hotel",
      "address": "123 Main St",
      "city": "London",
      "rating": {
        "stars": 4,
        "review": 8.5,
        "reviewCount": 1250
      },
      "price": {
        "amount": 150,
        "currency": "USD",
        "perNight": 150
      },
      "image": "https://...",
      "facilities": ["WiFi", "Pool", "Gym"]
    }
  ]
}
```

---

### Search Cities

Search for cities.

**Endpoint:** `GET /api/hotels/cities?query=London`

**Response:**
```json
{
  "success": true,
  "cities": [
    {
      "id": "-2601889",
      "name": "London",
      "country": "United Kingdom",
      "region": "England",
      "hotelCount": 5000
    }
  ]
}
```

---

### Get Hotel Details

Get detailed hotel information.

**Endpoint:** `GET /api/hotels/:hotelId`

**Response:**
```json
{
  "success": true,
  "hotel": {
    "id": "hotel123",
    "name": "Grand Hotel",
    "description": "Luxury hotel in central London...",
    "address": {...},
    "rating": {...},
    "facilities": [...],
    "photos": [...],
    "policies": {
      "checkin": "15:00",
      "checkout": "11:00"
    }
  }
}
```

---

### Check Room Availability

Check room availability and prices.

**Endpoint:** `POST /api/hotels/availability`

**Request Body:**
```json
{
  "hotelId": "hotel123",
  "checkin": "2025-12-01",
  "checkout": "2025-12-05",
  "adults": 2,
  "rooms": 1
}
```

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "id": "room123",
      "name": "Deluxe Room",
      "maxOccupancy": 2,
      "price": {
        "amount": 150,
        "currency": "USD",
        "total": 600
      },
      "availability": 5,
      "refundable": true,
      "breakfast": true
    }
  ]
}
```

---

### Generate Booking URL

Generate booking URL with affiliate tracking.

**Endpoint:** `POST /api/hotels/booking-url`

**Request Body:**
```json
{
  "hotelId": "hotel123",
  "checkin": "2025-12-01",
  "checkout": "2025-12-05",
  "adults": 2,
  "rooms": 1
}
```

**Response:**
```json
{
  "success": true,
  "bookingURL": "https://www.booking.com/hotel?..."
}
```

---

## 🤖 Travel Agents API

### Submit Travel Request

Submit request to AI agents.

**Endpoint:** `POST /api/travel-agents/request`

**Request Body:**
```json
{
  "type": "plan_trip",
  "destination": "Paris",
  "origin": "New York",
  "departureDate": "01/12/2025",
  "returnDate": "08/12/2025",
  "budget": 3000,
  "travelers": 2,
  "preferences": {
    "interests": ["culture", "food", "art"]
  }
}
```

**Request Types:**
- `plan_trip` - Complete trip planning
- `optimize_budget` - Budget optimization
- `find_deals` - Deal discovery
- `full_service` - All agents coordinated

**Response:**
```json
{
  "success": true,
  "requestId": "req_1697654321_abc123",
  "agents": {
    "luna": {
      "success": true,
      "plan": {
        "flights": [...],
        "itinerary": [...],
        "recommendations": [...]
      }
    },
    "karim": {
      "success": true,
      "optimization": {
        "originalBudget": 3000,
        "optimizedBudget": 2650,
        "totalPotentialSavings": 350,
        "recommendations": [...]
      }
    }
  },
  "summary": {
    "destination": "Paris",
    "budget": {
      "original": 3000,
      "optimized": 2650,
      "savings": 350
    },
    "flights": 5,
    "itinerary": 7
  },
  "processingTime": 2500
}
```

---

### Get Agent Capabilities

Get capabilities of all agents.

**Endpoint:** `GET /api/travel-agents/capabilities`

**Response:**
```json
{
  "success": true,
  "agents": {
    "luna": {
      "name": "Luna",
      "role": "Trip Architect",
      "capabilities": [
        "flight_search",
        "price_comparison",
        "budget_analysis",
        "itinerary_planning"
      ],
      "mcpTools": [
        "search_flights",
        "compare_prices",
        "analyze_budget"
      ]
    },
    "karim": {...},
    "scout": {...}
  }
}
```

---

### Get Active Requests

Get list of active agent requests.

**Endpoint:** `GET /api/travel-agents/active-requests`

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "requestId": "req_123",
      "startTime": 1697654321000,
      "status": "processing",
      "agents": [
        {
          "name": "luna",
          "timestamp": 1697654322000
        }
      ]
    }
  ],
  "count": 1
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `MISSING_PARAMETER` | 400 | Required parameter missing |
| `INVALID_FORMAT` | 400 | Invalid parameter format |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limit Error

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "limit": 10,
  "window": "1 minute"
}
```

---

## 🚦 Rate Limits

### General API

- **Limit:** 100 requests per 15 minutes
- **Scope:** All API routes

### AI Endpoints

- **Limit:** 10 requests per minute
- **Scope:** `/api/ai/*`, `/api/mcp/*`, `/api/travel-agents/*`

### External APIs (Per User)

| API | Per Minute | Per Hour |
|-----|------------|----------|
| Kiwi (Flights) | 5 | 50 |
| Booking.com | 5 | 50 |
| Mapbox | 10 | 100 |

### Payment Endpoints

- **Limit:** 20 requests per hour
- **Scope:** `/api/payment/*`

### Webhooks

- **Limit:** 30 requests per minute
- **Scope:** Webhook endpoints

### Rate Limit Headers

```
X-RateLimit-Remaining-Minute: 8
X-RateLimit-Remaining-Hour: 45
```

---

## 📝 Examples

### Complete Trip Planning Flow

```bash
# 1. Generate token
curl -X POST http://localhost:5000/api/security/tokens/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "scope": ["flights:read", "hotels:read", "mcp:call", "agents:execute"],
    "expiresIn": "1h"
  }'

# 2. Submit trip planning request
curl -X POST http://localhost:5000/api/travel-agents/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "full_service",
    "destination": "Paris",
    "origin": "New York",
    "departureDate": "01/12/2025",
    "returnDate": "08/12/2025",
    "budget": 3000,
    "travelers": 2
  }'

# 3. Get specific flight details
curl -X POST http://localhost:5000/api/flights/details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "bookingToken": "token_from_search"
  }'

# 4. Search hotels
curl -X POST http://localhost:5000/api/hotels/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cityId": "-2601889",
    "checkin": "2025-12-01",
    "checkout": "2025-12-08",
    "adults": 2,
    "rooms": 1
  }'
```

---

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**API Version:** v1
