---
description: Maya Travel Agent Backend Development Patterns
---

# Backend Architecture Rules

## Layered Architecture (MANDATORY)

Always follow this structure for backend code:
```
routes/ → controllers/ → services/ → database/
```

**Rules:**
- Routes ONLY handle HTTP (request/response)
- Controllers orchestrate flow (no business logic)
- Services contain ALL business logic
- Database layer handles data access only
- NO business logic in routes or controllers

## Code Quality Standards

### Error Handling
- Always use try-catch in async functions
- Return consistent error format: `{ success: false, error: message }`
- Log errors with context using the logger utility

### Async/Await
- Use async/await over promise chains
- Always handle errors in async functions
- No callbacks unless required by legacy APIs

### Documentation
- Add JSDoc to all exported functions
- Include @param and @returns annotations
- Document complex business logic with inline comments

## Example Pattern

```javascript
// ✅ GOOD
// routes/trips.js
router.post('/', authenticateToken, tripController.create);

// controllers/tripController.js
async create(req, res) {
  try {
    const trip = await tripService.createTrip(req.body, req.user.id);
    res.json({ success: true, data: trip });
  } catch (error) {
    logger.error('Trip creation failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// services/tripService.js
async createTrip(tripData, userId) {
  // Business logic here
  const trip = await db.trips.create({ ...tripData, userId });
  await notificationService.notifyNewTrip(trip);
  return trip;
}

// ❌ BAD - Business logic in route
router.post('/', async (req, res) => {
  const trip = await db.trips.create(req.body); // NO!
  res.json(trip);
});
```
