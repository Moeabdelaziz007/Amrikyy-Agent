# Testing Guide

Comprehensive testing guide for the Amrikyy AI Automation Platform.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## 🎯 Testing Philosophy

We follow a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and services
- **E2E Tests**: Test complete user workflows
- **Load Tests**: Test performance under load
- **Security Tests**: Test for vulnerabilities

**Goal**: 80%+ code coverage with meaningful tests.

---

## 🧪 Test Types

### Unit Tests

Test individual functions and components in isolation.

**Tools**: Jest, React Testing Library

**What to Test**:
- Pure functions
- Component rendering
- State management
- Utility functions
- Business logic

**Example**:
```typescript
// src/utils/formatPrice.test.ts
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('should format USD correctly', () => {
    expect(formatPrice(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatPrice(0, 'USD')).toBe('$0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatPrice(-100, 'USD')).toBe('-$100.00');
  });
});
```

### Integration Tests

Test how different parts work together.

**Tools**: Jest, Supertest

**What to Test**:
- API endpoints
- Database operations
- External API calls
- Service interactions

**Example**:
```typescript
// backend/src/tests/integration/booking.test.js
const request = require('supertest');
const app = require('../../server');

describe('POST /api/book', () => {
  it('should create a booking', async () => {
    const response = await request(app)
      .post('/api/book')
      .send({
        userId: 'user123',
        flightId: 'flight456',
        passengers: 2
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.booking).toBeDefined();
    expect(response.body.booking.status).toBe('confirmed');
  });

  it('should reject invalid data', async () => {
    const response = await request(app)
      .post('/api/book')
      .send({
        userId: null
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });
});
```

### E2E Tests

Test complete user workflows from start to finish.

**Tools**: Playwright

**What to Test**:
- User registration/login
- Search and booking flow
- Payment processing
- Profile management

**Example**:
```typescript
// frontend/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test('user can search and book a flight', async ({ page }) => {
  // Navigate to home page
  await page.goto('http://localhost:8080');

  // Search for flight
  await page.fill('[data-testid="origin"]', 'CAI');
  await page.fill('[data-testid="destination"]', 'DXB');
  await page.fill('[data-testid="departure-date"]', '2025-03-15');
  await page.click('[data-testid="search-button"]');

  // Wait for results
  await page.waitForSelector('[data-testid="flight-result"]');
  expect(await page.locator('[data-testid="flight-result"]').count()).toBeGreaterThan(0);

  // Select first flight
  await page.click('[data-testid="book-button"]:first-child');

  // Fill passenger details
  await page.fill('[data-testid="first-name"]', 'Mohamed');
  await page.fill('[data-testid="last-name"]', 'Abdelaziz');
  await page.fill('[data-testid="email"]', 'test@example.com');

  // Proceed to payment
  await page.click('[data-testid="continue-button"]');

  // Verify booking confirmation
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
  await expect(page.locator('[data-testid="booking-id"]')).toContainText(/booking_/);
});
```

### Load Tests

Test performance under various load conditions.

**Tools**: K6

**What to Test**:
- Response times under load
- Throughput capacity
- Resource usage
- Breaking points

**Example**:
```javascript
// k6/scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:5001/api/health');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Security Tests

Test for security vulnerabilities.

**Tools**: npm audit, OWASP ZAP, Snyk

**What to Test**:
- Dependency vulnerabilities
- SQL injection
- XSS attacks
- CSRF protection
- Authentication bypass
- Authorization issues

**Example**:
```bash
# Dependency audit
npm audit

# Security scan
npm run test:security

# Manual security testing
curl -X POST http://localhost:5001/api/book \
  -H "Content-Type: application/json" \
  -d '{"userId": "1'\'' OR '\''1'\''='\''1"}'
```

---

## 🚀 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:unit -- --coverage

# Run specific test file
npm test -- booking.test.js

# Run in watch mode
npm test -- --watch

# Run security audit
npm run test:security
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch

# Run specific test
npm test -- Button.test.tsx

# Run E2E tests
npm run e2e

# Run E2E with UI
npm run e2e:ui

# Run accessibility tests
npm run a11y-check
```

### Load Tests

```bash
# Default load test
npm run test:load

# Smoke test (minimal load)
npm run test:load:smoke

# Stress test (high load)
npm run test:load:stress

# Spike test (sudden traffic)
npm run test:load:spike

# Soak test (sustained load)
npm run test:load:soak
```

### All Tests

```bash
# From project root
npm test

# This runs:
# - Backend unit tests
# - Backend integration tests
# - Frontend unit tests
# - Frontend E2E tests
```

---

## ✍️ Writing Tests

### Unit Test Template

```typescript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button label="Click me" onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Test Template

```typescript
// API endpoint test
const request = require('supertest');
const app = require('../../server');

describe('API Endpoint', () => {
  beforeAll(async () => {
    // Setup: Connect to test database
  });

  afterAll(async () => {
    // Teardown: Close connections
  });

  beforeEach(async () => {
    // Reset: Clear test data
  });

  it('should handle valid request', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: expect.any(Object)
    });
  });
});
```

### E2E Test Template

```typescript
// User workflow test
import { test, expect } from '@playwright/test';

test.describe('User Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to starting page
    await page.goto('http://localhost:8080');
  });

  test('should complete workflow', async ({ page }) => {
    // Step 1: Action
    await page.click('[data-testid="start-button"]');

    // Step 2: Verify
    await expect(page.locator('[data-testid="result"]')).toBeVisible();

    // Step 3: Assert
    const text = await page.locator('[data-testid="result"]').textContent();
    expect(text).toContain('Success');
  });
});
```

---

## 📊 Test Coverage

### Viewing Coverage

```bash
# Backend coverage
cd backend
npm run test:unit -- --coverage

# Frontend coverage
cd frontend
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

### Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| **Overall** | 80% | 85% |
| **Backend** | 85% | 90% |
| **Frontend** | 75% | 80% |
| **Critical Paths** | 95% | 95% |

### What to Cover

**High Priority** (95%+ coverage):
- Authentication logic
- Payment processing
- Booking flow
- Data validation
- Security functions

**Medium Priority** (80%+ coverage):
- API endpoints
- Business logic
- State management
- Utility functions

**Low Priority** (60%+ coverage):
- UI components
- Styling logic
- Configuration files

---

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, pr-*]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm test
      
      - name: Run E2E tests
        run: cd frontend && npm run e2e

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --audit-level=high
```

### Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests before commit
npm test

# Run linting
npm run lint

# Check types
cd frontend && npm run type-check
```

---

## 🎯 Best Practices

### General

- ✅ **Write tests first** (TDD when possible)
- ✅ **Test behavior, not implementation**
- ✅ **Keep tests simple and focused**
- ✅ **Use descriptive test names**
- ✅ **Avoid test interdependencies**
- ✅ **Mock external dependencies**
- ✅ **Clean up after tests**

### Unit Tests

- ✅ Test one thing per test
- ✅ Use AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies
- ✅ Test edge cases
- ✅ Test error conditions

### Integration Tests

- ✅ Test realistic scenarios
- ✅ Use test database
- ✅ Clean up test data
- ✅ Test error handling
- ✅ Verify side effects

### E2E Tests

- ✅ Test critical user paths
- ✅ Use data-testid attributes
- ✅ Wait for elements properly
- ✅ Test on multiple browsers
- ✅ Keep tests independent

### Load Tests

- ✅ Start with smoke tests
- ✅ Gradually increase load
- ✅ Monitor resource usage
- ✅ Test realistic scenarios
- ✅ Document results

---

## 🐛 Debugging Tests

### Debug Unit Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Use console.log
console.log('Debug:', variable);

# Use debugger statement
debugger;
```

### Debug E2E Tests

```bash
# Run with headed browser
npm run e2e -- --headed

# Run with debug mode
npm run e2e -- --debug

# Pause on failure
npm run e2e -- --pause-on-failure
```

### Common Issues

**Tests timing out**:
```typescript
// Increase timeout
jest.setTimeout(10000);

// Or per test
test('slow test', async () => {
  // ...
}, 10000);
```

**Flaky tests**:
```typescript
// Add proper waits
await page.waitForSelector('[data-testid="element"]');

// Use retry logic
await expect(async () => {
  const text = await page.textContent('[data-testid="element"]');
  expect(text).toBe('Expected');
}).toPass({ timeout: 5000 });
```

---

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [K6 Documentation](https://k6.io/docs/)

### Our Documentation
- [Contributing Guide](CONTRIBUTING.md)
- [API Reference](API_REFERENCE.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

---

## 🆘 Support

Need help with testing?

- **Email**: support@amrikyy.ai
- **GitHub Issues**: https://github.com/Moeabdelaziz007/amrikyy-agent/issues
- **Documentation**: https://docs.amrikyy.ai

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0
