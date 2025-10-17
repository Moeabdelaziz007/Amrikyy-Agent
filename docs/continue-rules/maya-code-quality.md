---
description: Maya Travel Agent Code Quality Standards
---

# Code Quality & Best Practices

## Naming Conventions

### Variables & Functions
- **camelCase** for variables and functions: `getUserPreferences`, `tripData`
- **PascalCase** for classes and components: `TripService`, `UserProfile`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRIES`, `API_TIMEOUT`
- **Descriptive names** over abbreviations: `destinationList` not `destList`

### Files & Directories
- **kebab-case** for files: `trip-service.js`, `user-profile.tsx`
- **PascalCase** for React components: `TripCard.tsx`, `UserDashboard.tsx`
- **Descriptive** over generic: `authentication-middleware.js` not `auth.js`

## Code Organization

### File Structure
```
src/
├── routes/          # HTTP route definitions
├── controllers/     # Request/response handling
├── services/        # Business logic
├── models/          # Data models
├── utils/           # Utility functions
├── middleware/      # Express middleware
└── ai/              # AI integration
```

### Import Order
```javascript
// 1. External dependencies
const express = require('express');
const jwt = require('jsonwebtoken');

// 2. Internal dependencies
const tripService = require('../services/tripService');
const logger = require('../utils/logger');

// 3. Types (TypeScript)
import type { Trip, User } from '../types';
```

## Testing Standards

### Test Coverage
- **Minimum 80%** code coverage
- **Unit tests** for all services
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows

### Test Naming
```javascript
// ✅ GOOD - Descriptive test names
describe('TripService', () => {
  describe('createTrip', () => {
    it('should create trip with valid data and return trip object', async () => {
      // Test implementation
    });
    
    it('should throw error when budget exceeds user limit', async () => {
      // Test implementation
    });
  });
});

// ❌ BAD - Vague test names
it('works', () => { ... });
it('test 1', () => { ... });
```

## Security Best Practices

- **NEVER** commit API keys or secrets
- **ALWAYS** validate user input
- **ALWAYS** use parameterized queries (no SQL injection)
- **ALWAYS** sanitize outputs (prevent XSS)
- **ALWAYS** implement rate limiting
- **ALWAYS** use HTTPS in production
