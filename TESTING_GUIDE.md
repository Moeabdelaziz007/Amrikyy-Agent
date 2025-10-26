# 🧪 Testing Guide - Amrikyy Agent

**Last Updated:** October 23, 2025  
**Version:** 2.0.0

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Install Dependencies
```bash
cd backend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

---

## 📁 Test Structure

```
backend/tests/
├── setup.js                    # Test configuration
├── unit/                       # Unit tests
│   ├── services/
│   │   ├── streamService.test.js ✅
│   │   ├── coordinatorService.test.js
│   │   ├── authService.test.js
│   │   └── metricsService.test.js
│   └── middleware/
│       ├── auth.test.js
│       ├── validation.test.js
│       └── rateLimiter.test.js
├── integration/                # Integration tests
│   ├── stream-endpoints.test.js
│   ├── health-endpoints.test.js
│   ├── coordinator.test.js
│   └── metrics.test.js
└── e2e/                        # End-to-end tests
    └── full-flow.test.js
```

---

## 🏃 Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test streamService.test.js
```

### Tests by Pattern
```bash
npm test -- --testNamePattern="cancelation"
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode (No watch, with coverage)
```bash
npm run test:ci
```

---

## ✍️ Writing Tests

### Unit Test Example

```javascript
// tests/unit/services/streamService.test.js
const streamService = require('../../../src/services/streamService');

describe('StreamService', () => {
  describe('initializeStream', () => {
    it('should initialize a new stream with proper headers', () => {
      const mockRes = {
        setHeader: jest.fn(),
        on: jest.fn(),
        write: jest.fn()
      };
      
      const result = streamService.initializeStream(mockRes, 'TestAgent', 'user123');
      
      expect(result).toHaveProperty('streamId');
      expect(result).toHaveProperty('stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    });
  });
});
```

### Integration Test Example

```javascript
// tests/integration/stream-endpoints.test.js
const request = require('supertest');
const app = require('../../server');

describe('Stream Endpoints', () => {
  describe('GET /api/stream/:agent', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/stream/travel?prompt=test')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should stream response with valid token', async () => {
      const token = 'valid-test-token';
      
      const response = await request(app)
        .get('/api/stream/travel?prompt=test')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.headers['content-type']).toBe('text/event-stream');
    });
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/full-flow.test.js
describe('Full User Flow', () => {
  it('should complete entire trip planning flow', async () => {
    // 1. Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      });
    
    expect(registerRes.status).toBe(201);
    
    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!'
      });
    
    const token = loginRes.body.token;
    
    // 3. Request trip planning
    const tripRes = await request(app)
      .post('/api/coordinator/execute')
      .set('Authorization', `Bearer ${token}`)
      .send({
        prompt: 'Plan a 3-day trip to Paris'
      });
    
    expect(tripRes.status).toBe(200);
    expect(tripRes.body).toHaveProperty('taskId');
  });
});
```

---

## 📊 Test Coverage

### Current Coverage
```
Statements   : 30%
Branches     : 25%
Functions    : 28%
Lines        : 30%
```

### Target Coverage
```
Statements   : 80%
Branches     : 75%
Functions    : 80%
Lines        : 80%
```

### View Coverage Report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage by File
```bash
npm run test:coverage -- --collectCoverageFrom="src/services/**/*.js"
```

---

## 🔧 Test Configuration

### Jest Config (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000
};
```

### Test Setup (`tests/setup.js`)
```javascript
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Global test timeout
jest.setTimeout(30000);
```

---

## 🔄 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

```yaml
# .github/workflows/ci.yml
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm test
```

---

## 🧪 Manual Testing Scripts

### Test Endpoints
```bash
cd backend
./test-endpoints.sh
```

### Test Streaming Cancelation
```bash
cd backend
./test-streaming-cancelation.sh
```

### Test Health Checks
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/status
```

### Test Metrics
```bash
curl http://localhost:5000/api/metrics/json
```

### Test Streaming (with auth)
```bash
TOKEN="your-jwt-token"
curl -N -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/stream/travel?prompt=Plan a trip to Paris"
```

---

## 🐛 Troubleshooting

### Tests Failing

**Problem:** Tests timeout
```
Solution: Increase timeout in jest.config.js
testTimeout: 60000
```

**Problem:** Database connection errors
```
Solution: Use test database or mock database calls
```

**Problem:** Redis connection errors
```
Solution: Start Redis or use memory cache fallback
```

### Coverage Issues

**Problem:** Low coverage
```
Solution: Add more test cases for uncovered branches
```

**Problem:** Coverage report not generating
```
Solution: Run: npm run test:coverage -- --verbose
```

### CI/CD Issues

**Problem:** Tests pass locally but fail in CI
```
Solution: Check environment variables in GitHub Secrets
```

**Problem:** Timeout in CI
```
Solution: Increase timeout or optimize slow tests
```

---

## 📚 Best Practices

### 1. Test Naming
```javascript
// ✅ Good
describe('StreamService', () => {
  describe('cancelStream', () => {
    it('should cancel an active stream', () => {});
  });
});

// ❌ Bad
describe('test', () => {
  it('works', () => {});
});
```

### 2. Test Independence
```javascript
// ✅ Good - Each test is independent
beforeEach(() => {
  // Setup fresh state
});

afterEach(() => {
  // Cleanup
});

// ❌ Bad - Tests depend on each other
let sharedState;
it('test 1', () => { sharedState = 'value'; });
it('test 2', () => { expect(sharedState).toBe('value'); });
```

### 3. Mocking
```javascript
// ✅ Good - Mock external dependencies
jest.mock('../services/externalAPI');

// ❌ Bad - Real API calls in tests
const realAPI = require('../services/externalAPI');
```

### 4. Assertions
```javascript
// ✅ Good - Specific assertions
expect(result).toHaveProperty('streamId');
expect(result.streamId).toMatch(/^[0-9a-f-]{36}$/);

// ❌ Bad - Vague assertions
expect(result).toBeTruthy();
```

---

## 🎯 Testing Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] New code has tests
- [ ] Coverage doesn't decrease
- [ ] No console.log statements
- [ ] Tests are independent

### Before Deploying
- [ ] All CI tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual smoke tests done
- [ ] Performance tests pass

---

## 📞 Support

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

### Getting Help
- Check existing tests for examples
- Ask in team chat
- Create GitHub issue with `testing` label

---

**Happy Testing! 🧪**
