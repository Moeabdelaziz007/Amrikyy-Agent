# 📊 Analytics System Usage Guide

Complete guide for using the Amrikyy Travel Agent analytics system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [DataCollector API](#datacollector-api)
3. [Analytics Middleware](#analytics-middleware)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Overview

The analytics system provides comprehensive tracking of:
- User behavior and actions
- API usage and performance
- Search patterns
- Booking conversions
- Error monitoring
- Real-time metrics

### Architecture

```
Request → Analytics Middleware → DataCollector → Event Emitter
                                       ↓
                                  Aggregation
                                       ↓
                              Analytics API Endpoints
```

---

## DataCollector API

### Import

```javascript
const dataCollector = require('./src/analytics/DataCollector');
```

### Methods

#### 1. Track User Action

```javascript
dataCollector.trackUserAction(userId, action, metadata);
```

**Parameters:**
- `userId` (string): User identifier or 'anonymous'
- `action` (string): Action description (e.g., 'SEARCH_FLIGHT')
- `metadata` (object): Additional context

**Example:**
```javascript
dataCollector.trackUserAction('user123', 'SEARCH_FLIGHT', {
  from: 'NYC',
  to: 'LON',
  date: '2025-12-01',
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

---

#### 2. Track API Call

```javascript
dataCollector.trackAPICall(service, endpoint, duration, success, metadata);
```

**Parameters:**
- `service` (string): Service name ('kiwi', 'booking', 'mapbox', 'zai')
- `endpoint` (string): API endpoint called
- `duration` (number): Response time in milliseconds
- `success` (boolean): Whether call succeeded
- `metadata` (object): Additional context

**Example:**
```javascript
const startTime = Date.now();

try {
  const response = await axios.get('https://api.kiwi.com/...');
  const duration = Date.now() - startTime;
  
  dataCollector.trackAPICall('kiwi', '/search', duration, true, {
    statusCode: response.status
  });
} catch (error) {
  const duration = Date.now() - startTime;
  
  dataCollector.trackAPICall('kiwi', '/search', duration, false, {
    statusCode: error.response?.status,
    errorMessage: error.message
  });
}
```

---

#### 3. Track Search

```javascript
dataCollector.trackSearch(userId, searchType, query, resultsCount, metadata);
```

**Parameters:**
- `userId` (string): User identifier
- `searchType` (string): 'flight', 'hotel', 'destination', 'location'
- `query` (object): Search parameters
- `resultsCount` (number): Number of results returned
- `metadata` (object): Additional context

**Example:**
```javascript
dataCollector.trackSearch('user123', 'flight', {
  from: 'NYC',
  to: 'LON',
  departureDate: '2025-12-01',
  adults: 2
}, 15, {
  timestamp: new Date().toISOString()
});
```

---

#### 4. Track Booking

```javascript
dataCollector.trackBooking(userId, bookingType, amount, success, metadata);
```

**Parameters:**
- `userId` (string): User identifier
- `bookingType` (string): 'flight', 'hotel', 'package'
- `amount` (number): Booking amount
- `success` (boolean): Whether booking succeeded
- `metadata` (object): Additional context

**Example:**
```javascript
dataCollector.trackBooking('user123', 'flight', 599.99, true, {
  bookingId: 'BK123456',
  currency: 'USD',
  destination: 'London'
});
```

---

#### 5. Track Error

```javascript
dataCollector.trackError(errorType, message, stack, metadata);
```

**Parameters:**
- `errorType` (string): Error type/name
- `message` (string): Error message
- `stack` (string): Stack trace
- `metadata` (object): Additional context

**Example:**
```javascript
try {
  // Some operation
} catch (error) {
  dataCollector.trackError(
    error.name,
    error.message,
    error.stack,
    {
      userId: req.user?.id,
      path: req.path,
      method: req.method
    }
  );
}
```

---

#### 6. Track Performance

```javascript
dataCollector.trackPerformance(operation, duration, metadata);
```

**Parameters:**
- `operation` (string): Operation name
- `duration` (number): Duration in milliseconds
- `metadata` (object): Additional context

**Example:**
```javascript
const startTime = Date.now();

// Perform operation
await processBooking();

const duration = Date.now() - startTime;
dataCollector.trackPerformance('PROCESS_BOOKING', duration, {
  success: true,
  bookingId: 'BK123456'
});
```

---

## Analytics Middleware

### Automatic Tracking

The analytics middleware automatically tracks all requests:

```javascript
const { analyticsMiddleware } = require('./middleware/analyticsMiddleware');

app.use(analyticsMiddleware);
```

This tracks:
- User actions (every request)
- Response times
- Status codes
- User identification

---

### Search Tracking Middleware

```javascript
const { trackSearchMiddleware } = require('./middleware/analyticsMiddleware');

router.post('/search', trackSearchMiddleware('flight'), async (req, res) => {
  // Your search logic
  res.json({ success: true, data: results });
});
```

---

### Booking Tracking Middleware

```javascript
const { trackBookingMiddleware } = require('./middleware/analyticsMiddleware');

router.post('/book', trackBookingMiddleware('flight'), async (req, res) => {
  // Your booking logic
  res.json({ success: true, booking: bookingData });
});
```

---

### External API Tracking

```javascript
const { trackExternalAPICall } = require('./middleware/analyticsMiddleware');

// Wrap your API call
const response = await trackExternalAPICall(
  'kiwi',
  '/search',
  axios.get('https://api.kiwi.com/search', { params })
);
```

---

## API Endpoints

### 1. Get Analytics Summary

```bash
GET /api/analytics/summary?range=24h
```

**Query Parameters:**
- `range`: Time range ('1h', '24h', '7d', '30d')

**Response:**
```json
{
  "success": true,
  "data": {
    "timeRange": "24h",
    "period": {
      "start": "2025-10-15T21:00:00.000Z",
      "end": "2025-10-16T21:00:00.000Z"
    },
    "users": {
      "total": 150,
      "actions": 1250,
      "avgActionsPerUser": 8
    },
    "searches": {
      "total": 320,
      "byType": {
        "flight": 180,
        "hotel": 120,
        "destination": 20
      }
    },
    "bookings": {
      "total": 45,
      "successful": 42,
      "failed": 3,
      "revenue": 25499.50,
      "avgBookingValue": 606.65
    },
    "conversionRate": 13.13
  }
}
```

---

### 2. Get Real-Time Metrics

```bash
GET /api/analytics/realtime
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-10-16T21:00:00.000Z",
    "activeUsers": 12,
    "requestsPerMinute": 45,
    "searchesPerMinute": 8,
    "bookingsPerMinute": 2,
    "errorsPerMinute": 0,
    "apiCallsPerMinute": 15,
    "currentLoad": "medium"
  }
}
```

---

### 3. Get Service Health

```bash
GET /api/analytics/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "services": {
      "kiwi": {
        "status": "healthy",
        "successRate": "98.50",
        "totalCalls": 450
      },
      "booking": {
        "status": "healthy",
        "successRate": "97.20",
        "totalCalls": 380
      },
      "mapbox": {
        "status": "healthy",
        "successRate": "99.10",
        "totalCalls": 520
      }
    },
    "issues": []
  }
}
```

---

### 4. Export Data

```bash
GET /api/analytics/export?format=json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportedAt": "2025-10-16T21:00:00.000Z",
    "metrics": { ... },
    "aggregates": { ... },
    "summary24h": { ... },
    "summary7d": { ... }
  }
}
```

---

### 5. Get Dashboard Data

```bash
GET /api/analytics/dashboard?range=24h
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": { ... },
    "realtime": { ... },
    "health": { ... },
    "stats": { ... }
  }
}
```

---

### 6. Get Trends

```bash
GET /api/analytics/trends
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "current": 150,
      "previous": 120,
      "change": 25.00
    },
    "revenue": {
      "current": 25499.50,
      "previous": 18750.00,
      "change": 36.00
    },
    "conversionRate": {
      "current": 13.13,
      "previous": 11.50,
      "change": 1.63
    }
  }
}
```

---

## Usage Examples

### Example 1: Track Flight Search

```javascript
router.post('/api/flights/search', async (req, res) => {
  const userId = req.user?.id || 'anonymous';
  const { from, to, departureDate, adults } = req.body;
  
  try {
    // Call Kiwi API
    const startTime = Date.now();
    const response = await kiwiService.searchFlights(req.body);
    const duration = Date.now() - startTime;
    
    // Track API call
    dataCollector.trackAPICall('kiwi', '/search', duration, true, {
      statusCode: 200
    });
    
    // Track search
    dataCollector.trackSearch(userId, 'flight', req.body, response.data.length);
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    // Track error
    dataCollector.trackError(error.name, error.message, error.stack, {
      userId,
      path: req.path
    });
    
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Example 2: Track Booking with Conversion

```javascript
router.post('/api/bookings/create', async (req, res) => {
  const userId = req.user?.id;
  const { type, amount } = req.body;
  
  try {
    // Process booking
    const booking = await processBooking(req.body);
    
    // Track successful booking
    dataCollector.trackBooking(userId, type, amount, true, {
      bookingId: booking.id,
      currency: 'USD'
    });
    
    res.json({ success: true, booking });
  } catch (error) {
    // Track failed booking
    dataCollector.trackBooking(userId, type, amount, false, {
      failureReason: error.message
    });
    
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Example 3: Monitor Service Health

```javascript
// Health check endpoint
router.get('/api/health', async (req, res) => {
  const health = dataCollector.getServiceHealth();
  
  const statusCode = health.overall === 'healthy' ? 200 
                   : health.overall === 'degraded' ? 200 
                   : 503;
  
  res.status(statusCode).json({
    success: true,
    health
  });
});
```

---

### Example 4: Real-Time Dashboard

```javascript
// WebSocket for real-time updates
const io = require('socket.io')(server);

// Emit real-time metrics every 5 seconds
setInterval(() => {
  const metrics = dataCollector.getRealTimeMetrics();
  io.emit('metrics-update', metrics);
}, 5000);

// Listen for events
dataCollector.on('booking', (booking) => {
  io.emit('new-booking', booking);
});

dataCollector.on('error', (error) => {
  io.emit('error-alert', error);
});
```

---

## Best Practices

### 1. Always Track User Actions
```javascript
// ✅ Good
dataCollector.trackUserAction(userId, 'VIEW_DESTINATION', { destination: 'Paris' });

// ❌ Bad
// Not tracking user actions
```

### 2. Track API Calls with Timing
```javascript
// ✅ Good
const startTime = Date.now();
const response = await apiCall();
dataCollector.trackAPICall('service', '/endpoint', Date.now() - startTime, true);

// ❌ Bad
dataCollector.trackAPICall('service', '/endpoint', 0, true); // No timing
```

### 3. Include Metadata
```javascript
// ✅ Good
dataCollector.trackSearch(userId, 'flight', query, results.length, {
  timestamp: new Date().toISOString(),
  source: 'mobile-app'
});

// ❌ Bad
dataCollector.trackSearch(userId, 'flight', query, results.length); // No metadata
```

### 4. Handle Errors Properly
```javascript
// ✅ Good
try {
  await operation();
} catch (error) {
  dataCollector.trackError(error.name, error.message, error.stack, {
    userId,
    context: 'booking-process'
  });
  throw error;
}

// ❌ Bad
try {
  await operation();
} catch (error) {
  // Not tracking errors
  throw error;
}
```

### 5. Monitor Performance
```javascript
// ✅ Good
const startTime = Date.now();
await heavyOperation();
dataCollector.trackPerformance('HEAVY_OPERATION', Date.now() - startTime);

// ❌ Bad
await heavyOperation(); // No performance tracking
```

---

## Event Listeners

Subscribe to real-time events:

```javascript
// User action events
dataCollector.on('user-action', (action) => {
  console.log('User action:', action);
});

// API call events
dataCollector.on('api-call', (call) => {
  if (!call.success) {
    console.error('API call failed:', call);
  }
});

// Search events
dataCollector.on('search', (search) => {
  console.log('New search:', search);
});

// Booking events
dataCollector.on('booking', (booking) => {
  if (booking.success) {
    console.log('New booking:', booking);
  }
});

// Error events
dataCollector.on('error', (error) => {
  console.error('Error tracked:', error);
});

// Performance events
dataCollector.on('performance', (perf) => {
  if (perf.duration > 2000) {
    console.warn('Slow operation:', perf);
  }
});
```

---

## Configuration

Customize DataCollector settings:

```javascript
const dataCollector = require('./src/analytics/DataCollector');

// Update configuration
dataCollector.config.maxUserActions = 20000;
dataCollector.config.dataRetentionDays = 60;
dataCollector.config.cleanupInterval = 7200000; // 2 hours

// Manual cleanup
dataCollector.clearOldData(30); // Keep last 30 days
```

---

## Troubleshooting

### Issue: No data in analytics

**Solution:**
1. Check that analytics middleware is registered
2. Verify DataCollector is imported correctly
3. Check console for errors

### Issue: High memory usage

**Solution:**
1. Reduce max limits in config
2. Decrease data retention days
3. Increase cleanup frequency

### Issue: Missing user data

**Solution:**
1. Ensure user ID is passed correctly
2. Check authentication middleware
3. Verify extractUserId function

---

## Next Steps

1. Set up real-time dashboard
2. Integrate with monitoring tools (Sentry, DataDog)
3. Add custom analytics events
4. Export data to data warehouse
5. Create automated reports

---

**For more information, see:**
- [API Endpoints Documentation](../API_ENDPOINTS_DOCUMENTATION.md)
- [Testing Guide](../TESTING_GUIDE.md)
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md)

---

**Built with ❤️ by the Amrikyy Team**
