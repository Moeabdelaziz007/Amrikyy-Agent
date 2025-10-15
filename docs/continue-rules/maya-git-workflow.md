---
description: Maya Travel Agent Git & Commit Standards
---

# Git Workflow Standards

## Branch Naming

Follow this pattern:
```
feature/user-authentication
fix/trip-booking-bug
refactor/database-queries
docs/api-documentation
```

**Formats:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

## Commit Message Format

Use conventional commits:

```
type(scope): brief description

Longer explanation if needed.

- Bullet points for details
- Multiple changes listed
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance
- `perf:` - Performance improvement

**Examples:**
```
✅ GOOD:
feat(trips): add budget calculator with currency conversion
fix(auth): resolve JWT token expiration bug
refactor(database): optimize trip query performance

❌ BAD:
update code
fixes
done
```

## Pull Request Guidelines

### PR Title
Same format as commit messages:
```
feat(booking): implement multi-destination trip booking
```

### PR Description Template
```markdown
## Summary
- Brief overview of changes
- Why these changes were needed

## Changes
- Specific file/component changes
- New features added
- Bugs fixed

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing completed

## Screenshots
(if UI changes)
```

## Code Review Checklist

Before requesting review:
- [ ] Code follows Maya patterns (layered architecture)
- [ ] Tests are written and passing
- [ ] No console.logs or debugging code
- [ ] No secrets or API keys committed
- [ ] Documentation updated
- [ ] TypeScript types defined (frontend)
- [ ] ESLint warnings resolved
