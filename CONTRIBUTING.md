# Contributing to Amrikyy

Thank you for your interest in contributing to Amrikyy! 🎉

We welcome contributions from everyone. This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

**Positive behavior includes**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes**:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to **conduct@amrikyy.ai**. All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js v18+ installed
- Git installed
- A GitHub account
- Basic knowledge of JavaScript/TypeScript
- Familiarity with React (for frontend) or Express (for backend)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/amrikyy-agent.git
   cd amrikyy-agent
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Moeabdelaziz007/amrikyy-agent.git
   ```

4. **Install dependencies**
   ```bash
   npm run install:all
   ```

5. **Configure environment**
   ```bash
   cd backend && cp env.example .env
   cd ../frontend && cp .env.example .env
   # Edit .env files with your API keys
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

---

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

#### 🐛 Bug Reports
Found a bug? Please open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

#### ✨ Feature Requests
Have an idea? Open an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Mockups or examples (if applicable)

#### 📝 Documentation
Help improve our docs:
- Fix typos or unclear explanations
- Add examples or tutorials
- Translate documentation
- Improve API documentation

#### 💻 Code Contributions
Submit code changes:
- Bug fixes
- New features
- Performance improvements
- Refactoring
- Test coverage improvements

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Backend tests
cd backend
npm test
npm run lint

# Frontend tests
cd frontend
npm test
npm run lint
npm run type-check

# E2E tests
npm run e2e
```

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "type(scope): description"
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples**:
```bash
git commit -m "feat(ai): add sentiment analysis to chat"
git commit -m "fix(payment): resolve Stripe webhook validation"
git commit -m "docs(api): update endpoint documentation"
git commit -m "test(booking): add integration tests"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the PR

---

## 💻 Coding Standards

### General Principles

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Follow SOLID principles
- **Clean Code**: Write self-documenting code

### TypeScript/JavaScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): Promise<User> {
  return database.users.findById(id);
}

// ❌ Bad
function getUser(x: any): any {
  return database.users.findById(x);
}
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="btn-primary"
    >
      {label}
    </button>
  );
};

// ❌ Bad - No types, unclear props
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### Express Routes

```javascript
// ✅ Good - Clear, validated, error handled
const express = require('express');
const router = express.Router();
const { validateBooking } = require('../middleware/validation');

router.post('/book', validateBooking, async (req, res) => {
  try {
    const booking = await bookingService.create(req.body);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create booking' 
    });
  }
});

// ❌ Bad - No validation, no error handling
router.post('/book', (req, res) => {
  const booking = bookingService.create(req.body);
  res.json(booking);
});
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS, double for JSX
- **Semicolons**: Required
- **Line Length**: Max 100 characters
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and components
  - `UPPER_SNAKE_CASE` for constants
  - `kebab-case` for file names

### Comments

```typescript
// ✅ Good - Explains WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API
// during high traffic periods
const retryDelay = baseDelay * Math.pow(2, attemptNumber);

// ❌ Bad - States the obvious
// Multiply baseDelay by 2 to the power of attemptNumber
const retryDelay = baseDelay * Math.pow(2, attemptNumber);
```

---

## 🧪 Testing Guidelines

### Test Coverage

- Aim for **80%+ code coverage**
- All new features must include tests
- Bug fixes should include regression tests

### Unit Tests

```typescript
// Example unit test
describe('BookingService', () => {
  describe('createBooking', () => {
    it('should create a booking with valid data', async () => {
      const bookingData = {
        userId: 'user123',
        flightId: 'flight456',
        passengers: 2
      };
      
      const booking = await bookingService.create(bookingData);
      
      expect(booking).toBeDefined();
      expect(booking.id).toBeTruthy();
      expect(booking.status).toBe('confirmed');
    });
    
    it('should throw error with invalid data', async () => {
      const invalidData = { userId: null };
      
      await expect(
        bookingService.create(invalidData)
      ).rejects.toThrow('Invalid booking data');
    });
  });
});
```

### Integration Tests

```typescript
// Example integration test
describe('POST /api/book', () => {
  it('should create booking and return 201', async () => {
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
  });
});
```

### E2E Tests

```typescript
// Example E2E test
test('user can search and book a flight', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // Search for flight
  await page.fill('[data-testid="origin"]', 'CAI');
  await page.fill('[data-testid="destination"]', 'DXB');
  await page.click('[data-testid="search-button"]');
  
  // Wait for results
  await page.waitForSelector('[data-testid="flight-result"]');
  
  // Book first flight
  await page.click('[data-testid="book-button"]:first-child');
  
  // Verify booking confirmation
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
});
```

---

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Explain non-obvious decisions
- Keep comments up-to-date

```typescript
/**
 * Calculate the optimal route between multiple destinations
 * using a modified traveling salesman algorithm.
 * 
 * @param destinations - Array of destination coordinates
 * @param startPoint - Starting location coordinates
 * @returns Optimized route with total distance
 * 
 * @example
 * const route = calculateOptimalRoute(
 *   [{ lat: 30.0, lng: 31.0 }, { lat: 25.0, lng: 55.0 }],
 *   { lat: 24.0, lng: 46.0 }
 * );
 */
function calculateOptimalRoute(
  destinations: Coordinate[],
  startPoint: Coordinate
): OptimizedRoute {
  // Implementation
}
```

### API Documentation

When adding new endpoints, update [API_REFERENCE.md](API_REFERENCE.md):

```markdown
### Create Booking

Create a new travel booking.

\`\`\`http
POST /api/book
\`\`\`

**Request Body**:
\`\`\`json
{
  "userId": "user123",
  "flightId": "flight456",
  "passengers": 2
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "booking": {
    "id": "booking789",
    "status": "confirmed"
  }
}
\`\`\`
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing configuration
- Modifying setup process
- Adding dependencies

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commits follow conventional format
- [ ] No merge conflicts with main branch

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: PR approved by maintainer
5. **Merge**: PR merged into main branch

### After Merge

- Delete your feature branch
- Update your fork:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

---

## 🏆 Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- Release notes
- Project README
- Annual contributor spotlight

---

## 💬 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (coming soon)
- **Email**: support@amrikyy.ai

### Getting Help

- Check [QUICKSTART.md](QUICKSTART.md) for setup help
- Search existing issues before creating new ones
- Ask questions in GitHub Discussions
- Join our Discord community (coming soon)

### Mentorship

New to open source? We're here to help!
- Look for issues labeled `good first issue`
- Ask questions - no question is too basic
- Request code review feedback
- Pair programming sessions available

---

## 📝 License

By contributing to Amrikyy, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make Amrikyy better for everyone. We appreciate your time and effort!

**Happy Contributing!** 🚀

---

**Questions?** Email us at **contribute@amrikyy.ai**

**Found a security issue?** Email **security@amrikyy.ai** (do not open public issues)

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0
