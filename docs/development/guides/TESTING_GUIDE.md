# 🧪 Testing Guide - Amrikyy Travel Agent

Complete guide for testing the travel agent system.

## 📋 Table of Contents

1. [Test Structure](#test-structure)
2. [Running Tests](#running-tests)
3. [Test Categories](#test-categories)
4. [Writing Tests](#writing-tests)
5. [Coverage Reports](#coverage-reports)
6. [CI/CD Integration](#cicd-integration)

---

## 🏗️ Test Structure

```
backend/
├── tests/
│   ├── unit/              # Unit tests
│   │   └── security.test.js
│   ├── integration/       # Integration tests
│   │   ├── agents.test.js
│   │   └── mcp-tools.test.js
│   └── api/              # API endpoint tests
│       └── endpoints.test.js
├── test-agents-simple.js  # Structure validation
├── test-travel-agents.js  # Full integration test
└── run-tests.sh          # Test runner script
```

---

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
cd backend
./run-tests.sh
```

### Individual Test Suites

```bash
# Structure validation (no dependencies)
node test-agents-simple.js

# Unit tests
npm test -- tests/unit

# Integration tests
npm test -- tests/integration

# API tests
npm test -- tests/api

# All Jest tests
npm test

# With coverage
npm run test:coverage
```

### Watch Mode

```bash
# Watch for changes and re-run tests
npm run test:watch
```

---

## 📊 Test Categories

### 1. Structure Tests (test-agents-simple.js)

**Purpose:** Validate file structure and code organization

**Tests:**
- ✅ File existence (12 files)
- ✅ Luna agent structure (7 methods)
- ✅ Karim agent structure (6 methods)
- ✅ Scout agent structure (6 methods)
- ✅ Agent Coordinator structure (9 methods)
- ✅ MCP Server structure (13 methods + 5 tools)
- ✅ External services structure (12 methods)

**Run:**
```bash
node backend/test-agents-simple.js
```

**Expected Output:**
```
✅ filesExist
✅ lunaStructure
✅ karimStructure
✅ scoutStructure
✅ coordinatorStructure
✅ mcpServerStructure
✅ servicesStructure

🎉 All structure tests passed!
```

---

### 2. Unit Tests (tests/unit/)

**Purpose:** Test individual components in isolation

#### Security Tests (security.test.js)

**Token Manager Tests:**
- Token generation with various configurations
- Token validation and expiration
- Token revocation (single and bulk)
- Scope-based access control
- Usage tracking
- Statistics

**External API Limiter Tests:**
- Rate limit checking
- Per-user tracking
- Limit reset functionality
- Statistics retrieval

**Run:**
```bash
npm test -- tests/unit/security.test.js
```

**Coverage:**
- TokenManager: ~90%
- ExternalAPILimiter: ~85%

---

### 3. Integration Tests (tests/integration/)

**Purpose:** Test component interactions

#### Agent Tests (agents.test.js)

**Luna Trip Architect:**
- Capability verification
- Trip duration calculation
- MCP tools integration
- Itinerary generation

**Karim Budget Optimizer:**
- Budget analysis
- Savings calculation
- Recommendation generation
- Price comparison

**Scout Deal Finder:**
- Deal discovery
- Destination filtering
- Price scoring
- Distance calculation

**Agent Coordinator:**
- Multi-agent orchestration
- Request tracking
- Date calculations

**Run:**
```bash
npm test -- tests/integration/agents.test.js
```

#### MCP Tools Tests (mcp-tools.test.js)

**Tool Registration:**
- Tool listing
- Required tools verification
- Schema validation

**Budget Analysis Tool:**
- Budget breakdown
- Per-person calculations
- Daily budget
- Recommendations

**Tool Validation:**
- Parameter validation
- Error handling
- Context passing

**Run:**
```bash
npm test -- tests/integration/mcp-tools.test.js
```

---

### 4. API Tests (tests/api/)

**Purpose:** Test HTTP endpoints

#### Endpoint Tests (endpoints.test.js)

**MCP Routes:**
- `GET /api/mcp/tools` - List tools
- `POST /api/mcp/call` - Call tool
- `POST /api/mcp/analyze-budget` - Budget analysis
- `GET /api/mcp/health` - Health check

**Security Routes:**
- `POST /api/security/tokens/generate` - Generate token
- `POST /api/security/tokens/revoke` - Revoke token
- `GET /api/security/tokens/info` - Token info
- `GET /api/security/tokens/stats` - Statistics
- `GET /api/security/rate-limits/:userId` - User limits
- `GET /api/security/scopes` - Available scopes

**Travel Agents Routes:**
- `GET /api/travel-agents/capabilities` - Agent capabilities
- `GET /api/travel-agents/active-requests` - Active requests
- `POST /api/travel-agents/request` - Submit request

**Run:**
```bash
npm test -- tests/api/endpoints.test.js
```

---

## ✍️ Writing Tests

### Test Template

```javascript
/**
 * Component Tests
 * Description of what is being tested
 */

const ComponentToTest = require('../../src/path/to/component');

describe('Component Name', () => {
  describe('Feature Group', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = ComponentToTest.method(input);
      
      // Assert
      expect(result).toBe('expected output');
    });

    test('should handle edge case', () => {
      expect(() => {
        ComponentToTest.method(null);
      }).toThrow();
    });
  });
});
```

### Best Practices

1. **Descriptive Names**
   ```javascript
   // ✅ Good
   test('should calculate trip duration in days', () => {});
   
   // ❌ Bad
   test('test1', () => {});
   ```

2. **Arrange-Act-Assert Pattern**
   ```javascript
   test('should validate token', () => {
     // Arrange
     const token = generateToken();
     
     // Act
     const result = validateToken(token);
     
     // Assert
     expect(result.valid).toBe(true);
   });
   ```

3. **Test One Thing**
   ```javascript
   // ✅ Good - tests one behavior
   test('should reject expired token', () => {});
   test('should reject invalid scope', () => {});
   
   // ❌ Bad - tests multiple things
   test('should validate token correctly', () => {
     // Tests expiration, scope, format, etc.
   });
   ```

4. **Use Meaningful Assertions**
   ```javascript
   // ✅ Good
   expect(result.userId).toBe('test-user');
   expect(result.scope).toContain('flights:read');
   
   // ❌ Bad
   expect(result).toBeTruthy();
   ```

---

## 📈 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

### View Coverage

```bash
# Open HTML report
open coverage/lcov-report/index.html

# Or view in terminal
cat coverage/coverage-summary.json
```

### Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| Agents | 80% | ~75% |
| MCP Server | 85% | ~80% |
| Security | 90% | ~85% |
| Services | 70% | ~65% |
| Routes | 75% | ~70% |

### Improving Coverage

1. **Identify Uncovered Lines**
   ```bash
   npm run test:coverage
   # Check coverage/lcov-report/index.html
   ```

2. **Add Missing Tests**
   - Focus on error paths
   - Test edge cases
   - Add integration tests

3. **Remove Dead Code**
   - Unused functions
   - Unreachable code
   - Deprecated methods

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run structure tests
        run: |
          cd backend
          node test-agents-simple.js
      
      - name: Run Jest tests
        run: |
          cd backend
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./backend/coverage/lcov.info
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

cd backend
npm test

if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

---

## 🐛 Debugging Tests

### Run Single Test

```bash
npm test -- -t "should validate token"
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest tests/unit/security.test.js
```

### Verbose Output

```bash
npm test -- --verbose
```

### Show Console Logs

```bash
npm test -- --silent=false
```

---

## 📝 Test Checklist

Before committing:

- [ ] All structure tests pass
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All API tests pass
- [ ] Coverage > 70%
- [ ] No console errors
- [ ] Tests run in < 30 seconds
- [ ] New features have tests
- [ ] Edge cases covered

---

## 🆘 Troubleshooting

### Tests Fail Locally

1. **Check Node version**
   ```bash
   node --version  # Should be >= 16
   ```

2. **Reinstall dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Clear Jest cache**
   ```bash
   npm test -- --clearCache
   ```

### Tests Pass Locally but Fail in CI

1. **Check environment variables**
2. **Verify Node version matches**
3. **Check for timing issues**
4. **Review CI logs**

### Slow Tests

1. **Identify slow tests**
   ```bash
   npm test -- --verbose
   ```

2. **Optimize**
   - Reduce timeouts
   - Mock external calls
   - Use test.concurrent

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated:** October 16, 2025  
**Version:** 1.0.0
