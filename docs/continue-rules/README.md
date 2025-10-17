# 📋 Continue Rules - Maya Travel Agent

Custom rules for AI-assisted development with Continue.

## 📦 Available Rules

### 1. **Backend Patterns** (`maya-backend-patterns.md`)
- Layered architecture (routes → controllers → services)
- Error handling standards
- Async/await best practices
- Example patterns (✅ GOOD vs ❌ BAD)

### 2. **Frontend Patterns** (`maya-frontend-patterns.md`)
- React + TypeScript patterns
- Component structure (functional only)
- Custom hooks for business logic
- Props interfaces required
- TailwindCSS styling

### 3. **AI & Agent Patterns** (`maya-ai-patterns.md`)
- AIX v3.0 agent configuration
- Multi-agent coordination
- Event-driven communication
- Model switching strategies

### 4. **Code Quality** (`maya-code-quality.md`)
- Naming conventions
- File organization
- Testing standards (80% coverage minimum)
- Security best practices

### 5. **Git Workflow** (`maya-git-workflow.md`)
- Branch naming conventions
- Commit message format (conventional commits)
- PR guidelines and templates
- Code review checklist

---

## 🚀 How Rules Work

Continue automatically applies these rules when:
- Generating new code
- Refactoring existing code
- Reviewing code quality
- Making suggestions

The AI will **automatically**:
- Follow layered architecture patterns
- Use correct naming conventions
- Add proper TypeScript types
- Include error handling
- Follow git commit standards

---

## 💡 Usage Examples

### Example 1: Backend Development
When you ask Continue to create an API endpoint, it will:
- Create route in `routes/`
- Create controller in `controllers/`
- Create service in `services/`
- Follow error handling pattern
- Add JSDoc documentation

### Example 2: Frontend Development
When creating a React component, it will:
- Use TypeScript with Props interface
- Implement as functional component
- Extract logic into custom hooks
- Use TailwindCSS for styling

### Example 3: Git Commits
When generating commit messages, it will:
- Use conventional commit format
- Include scope and description
- Add details in commit body

---

## ✅ Best Practices

### DO:
- ✅ Let Continue follow the rules automatically
- ✅ Review generated code for project fit
- ✅ Update rules as patterns evolve
- ✅ Share rules with team members

### DON'T:
- ❌ Override rules without good reason
- ❌ Commit API keys or secrets
- ❌ Skip testing requirements
- ❌ Ignore code review checklist

---

## 🔧 Customizing Rules

To add or modify rules:

1. **Create new rule file:**
   ```bash
   touch .continue/rules/my-new-rule.md
   ```

2. **Add frontmatter:**
   ```markdown
   ---
   description: Description of your rule
   ---
   
   # Rule Content
   Your rules here...
   ```

3. **Restart Continue:**
   - Rules are loaded automatically
   - No configuration needed

---

## 📖 Documentation

- [Continue Rules Docs](https://docs.continue.dev/customization/rules)
- [Maya Backend Patterns](./maya-backend-patterns.md)
- [Maya Frontend Patterns](./maya-frontend-patterns.md)
- [Maya AI Patterns](./maya-ai-patterns.md)

---

**Rules ensure consistent, high-quality code across the Maya Travel Agent project** ✨
