# PROJECT RULES - Amrikyy Platform Constitution

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Status:** 🟢 Active  
**Authority:** Absolute - All team members must follow these rules

---

## 🎯 Purpose

This document defines the **core principles and rules** that govern all development work on the Amrikyy Platform. These rules exist to:

- Prevent chaos and technical debt
- Ensure code quality and maintainability
- Create consistent patterns across the codebase
- Enable efficient collaboration between AI assistants
- Protect against common mistakes

**When in doubt, refer to this document first.**

---

## ⚖️ THE 8 GOLDEN RULES

### Rule 1: No Duplicates - Ever

**Principle:** One source of truth for everything.

❌ **NEVER:**
- Create multiple files with similar purposes
- Duplicate code across files
- Have multiple versions of the same component
- Create redundant documentation

✅ **ALWAYS:**
- Check if something already exists before creating it
- Reuse existing code through imports
- Consolidate similar functionality into one place
- Reference existing docs instead of rewriting

**Example:**
```
❌ BAD: telegram-bot.js, telegram-bot-v2.js, advanced-telegram-bot.js
✅ GOOD: telegram-bot.js (one main file, versioned through git)
```

**Enforcement:**
- Before creating ANY new file, search the codebase
- Use `git grep` to find existing implementations
- Refactor duplicates into shared utilities

---

### Rule 2: Think Before Code

**Principle:** Planning prevents problems.

**The THINK Framework:**
```
1. THINK 🤔
   - What problem am I solving?
   - What's the simplest solution?
   - Does something similar exist?

2. REASON 💭
   - Why is this the best approach?
   - What are the tradeoffs?
   - What could go wrong?

3. THINK AGAIN 🔄
   - Is there a better way?
   - Did I miss something?
   - Can I simplify further?

4. APPLY ✅
   - Write clean code
   - Add tests
   - Document decisions
```

**Mandatory Documentation:**
- For any feature > 100 lines: Create ADR (Architecture Decision Record)
- Location: `docs/decisions/YYYY-MM-DD-decision-name.md`

**Template:**
```markdown
# ADR-001: [Decision Title]

Date: YYYY-MM-DD
Status: Proposed | Accepted | Deprecated

## Context
What problem are we solving?

## Decision
What did we decide to do?

## Consequences
What are the results (good and bad)?
```

---

### Rule 3: Single Environment

**Principle:** All tools work in ONE workspace.

**The Rule:**
- ONE repository: `maya-travel-agent`
- ONE IDE: Cursor (for AI-assisted development)
- ONE terminal: Integrated terminal in Cursor
- ONE .env file per package (no duplicates!)

**Environment Structure:**
```
maya-travel-agent/
├── .env                    # Root config (shared vars)
├── backend/.env            # Backend secrets only
├── frontend/.env           # Frontend public vars only
└── [NO OTHER .env FILES]
```

**Setup Commands:**
```bash
# Everything in one command
npm run install:all

# Everything starts together
npm run dev
```

**Enforcement:**
- Never create separate workspaces
- Never split work across multiple IDEs
- Never duplicate environment variables

---

### Rule 4: Git Discipline

**Principle:** Commit early, commit often, commit clearly.

**Daily Routine:**
```bash
# Start of day
git pull origin main

# During work (every significant change)
git add .
git commit -m "type(scope): description"
git push origin main

# End of day (MANDATORY)
git add .
git commit -m "chore: daily progress checkpoint"
git push origin main
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
✅ GOOD:
feat(agents): add Safar travel specialist agent
fix(telegram): resolve webhook timeout issue
docs(identity): complete Amrikyy avatar identity

❌ BAD:
"updates"
"fixed stuff"
"changes"
```

**Branch Strategy:**
```
main                    # Production-ready code
├── develop            # Integration branch (optional for teams)
└── feature/*          # Feature branches (optional)
```

**For solo development:** Work directly on `main`, commit frequently.

---

### Rule 5: Dependency Management

**Principle:** Every dependency must be justified.

**Before Installing ANY Package:**

1. **Question it:**
   - Do we REALLY need this?
   - Can we implement it ourselves in < 50 lines?
   - Is this well-maintained?

2. **Check bundle size:**
   ```bash
   npm info <package-name> size
   ```

3. **Document it:**
   Add to `docs/governance/DEPENDENCIES.md`:
   ```markdown
   ## axios (v1.5.0)
   **Purpose:** HTTP client for API calls
   **Why not fetch:** Need request/response interceptors
   **Bundle size:** 12.4 kB (gzipped)
   **Alternatives considered:** fetch, superagent
   ```

**Approved Core Dependencies:**
```json
{
  "frontend": [
    "react",
    "typescript", 
    "tailwindcss",
    "framer-motion",
    "zustand",
    "react-router-dom"
  ],
  "backend": [
    "express",
    "socket.io",
    "@supabase/supabase-js",
    "stripe",
    "zod"
  ],
  "shared": [
    "smallest-agent",
    "aix-core"
  ]
}
```

**Forbidden:**
- Heavy utility libraries (lodash - use native JS)
- Duplicate functionality (moment.js - use date-fns or native)
- Unused packages (audit quarterly)

---

### Rule 6: File Naming Conventions

**Principle:** Names must be clear, consistent, and discoverable.

**General Rules:**
```
✅ kebab-case for files:        user-profile.tsx
✅ PascalCase for components:   UserProfile.tsx
✅ camelCase for utilities:     formatDate.ts
✅ SCREAMING_SNAKE for constants: API_BASE_URL.ts
```

**Specific Conventions:**

**React Components:**
```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
└── features/
    ├── agent-gallery/
    │   ├── AgentGallery.tsx       # Main component
    │   ├── AgentCard.tsx           # Sub-component
    │   └── agent-gallery.types.ts  # Types
    └── hologram-workflow/
        ├── HologramWorkflow.tsx
        └── WorkflowStep.tsx
```

**Backend Routes:**
```
routes/
├── ai.routes.ts              # AI endpoints
├── payment.routes.ts         # Payment endpoints
└── user.routes.ts            # User endpoints
```

**Test Files:**
```
✅ Component.test.tsx
✅ utility.test.ts
✅ integration.test.ts
❌ Component.spec.tsx (avoid .spec)
```

**Agent Files:**
```
agents/
├── amrikyy-main-avatar.aix
├── safar-travel-specialist.aix
├── thrifty-budget-optimizer.aix
└── thaqafa-cultural-guide.aix
```

---

### Rule 7: LATER.md Philosophy

**Principle:** Not now doesn't mean never.

**When to use LATER.md:**
- Feature is interesting but not critical
- Implementation would take > 2 weeks
- Requires technology not yet integrated
- Nice-to-have vs must-have

**LATER.md Structure:**
```markdown
# Phase 2: After MVP

## Pattern Observer Agent
**Priority:** Medium  
**Complexity:** High  
**Dependencies:** Complete AIX integration  
**Why later:** Need to validate core platform first  
**Estimated effort:** 3 weeks

## Data Artisan Agent
...
```

**Review Process:**
- Monthly review of LATER.md
- Promote items when:
  - User demand is clear
  - Dependencies are met
  - Team bandwidth available

**DO NOT:**
- Put urgent bugs in LATER.md
- Use as excuse to avoid hard problems
- Let it become a dumping ground

---

### Rule 8: Ship Often, Ship Small

**Principle:** Progress beats perfection.

**Deployment Frequency:**
- Development: Multiple times per day
- Staging: Every completed feature
- Production: Weekly (minimum)

**Release Size:**
- Prefer: Small, incremental releases
- Avoid: Big-bang releases with months of changes

**Feature Flags:**
```typescript
// For incomplete features
const FEATURE_FLAGS = {
  hologramWorkflow: process.env.VITE_ENABLE_HOLOGRAM === 'true',
  quantumTopology: false, // Not ready yet
  agentMarketplace: false // Coming soon
};
```

**Rollback Ready:**
- Every deploy has a rollback plan
- Database migrations are reversible
- Breaking changes are announced

**DO NOT:**
- Wait for "perfect" before shipping
- Accumulate weeks of uncommitted code
- Deploy on Friday without rollback plan (actually you CAN, just be ready!)

---

## 📋 File Organization Standards

### Backend Structure

```
backend/
├── src/
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── ai/               # AI integration
│   ├── aix-core/         # AIX parser/runtime
│   └── config/           # Configuration
├── agents/               # AIX agent definitions
├── tests/                # Test files
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   └── features/    # Feature-specific components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management (Zustand)
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   └── assets/           # Static assets
├── public/               # Public files
└── package.json
```

### Shared Assets

```
assets/
├── avatars/              # Agent SVG avatars
├── id-cards/             # Digital ID card templates
├── brand/                # Logos, colors, patterns
└── animations/           # Lottie files
```

### Documentation Structure

```
docs/
├── governance/           # Core rules and processes
│   ├── PROJECT_RULES.md          # This file
│   ├── THINKING_STRATEGY.md
│   ├── TEAM_STRUCTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── WORKSPACE_SETUP.md
│   ├── DAILY_WORKFLOW.md
│   └── LATER.md
├── identity/             # Agent identities
│   ├── AGENT_IDENTITY_SYSTEM.md
│   └── agent-personas/
├── decisions/            # Architecture Decision Records
│   └── 2025-10-14-aix-integration.md
└── retrospectives/       # Weekly reflections
    └── 2025-W42-retrospective.md
```

---

## 🚫 Common Violations & Fixes

### Violation: Multiple Similar Files

```
❌ FOUND:
backend/telegram-bot.js
backend/telegram-bot-v2.js
backend/advanced-telegram-bot.js

✅ FIX:
1. Compare all versions
2. Merge best features into telegram-bot.js
3. Delete others
4. Document in git commit message
```

### Violation: Unclear Commit Messages

```
❌ BAD:
"updates"
"fixed stuff"
"wip"

✅ GOOD:
feat(agents): implement Safar travel research agent
fix(telegram): resolve message parsing error for Arabic text
refactor(ui): consolidate agent card components
```

### Violation: Untracked Dependencies

```
❌ PROBLEM:
npm install some-package
(no documentation)

✅ FIX:
1. Document in docs/governance/DEPENDENCIES.md
2. Explain why needed
3. List alternatives considered
4. Note bundle size impact
```

---

## ⚡ Quick Reference

**Before creating a file:**
```bash
# Search if it exists
git grep "similar-name"
find . -name "*keyword*"
```

**Before writing code:**
1. Check PROJECT_RULES.md
2. Check THINKING_STRATEGY.md
3. Create ADR if complex
4. Code
5. Test
6. Document
7. Commit

**Before committing:**
```bash
npm run lint
npm run test
git add .
git commit -m "type(scope): clear description"
git push origin main
```

**Daily workflow:**
1. Morning: Pull, plan, prioritize
2. Work: Focus, iterate, test
3. Evening: Commit, document, reflect

---

## 📈 Enforcement & Accountability

**Review Process:**
- **Daily:** Self-review against Rule 4 (Git Discipline)
- **Weekly:** Review LATER.md and DEPENDENCIES.md
- **Monthly:** Full audit against all 8 Golden Rules

**Violations:**
- Minor: Document and fix immediately
- Major: Create ADR explaining how to prevent recurrence
- Repeated: Refactor entire area to prevent future violations

**Success Metrics:**
- ✅ Zero duplicate files
- ✅ All commits follow format
- ✅ 100% test coverage on critical paths
- ✅ All dependencies documented
- ✅ LATER.md reviewed monthly

---

## 🎓 Learning Resources

**For new team members (human or AI):**
1. Read this document fully
2. Read THINKING_STRATEGY.md
3. Read TEAM_STRUCTURE.md
4. Study existing code for patterns
5. Ask questions before assuming

**Templates Available:**
- ADR Template: `docs/decisions/TEMPLATE.md`
- Component Template: `frontend/src/components/TEMPLATE.tsx`
- Test Template: `frontend/src/components/TEMPLATE.test.tsx`

---

## 📞 When Rules Conflict

**Priority Order:**
1. User safety and security
2. Data integrity
3. System stability
4. These 8 Golden Rules
5. Code elegance
6. Personal preference

**If genuinely blocked by a rule:**
1. Document the conflict
2. Propose amendment
3. Discuss with team (Mohamed)
4. Update rules if accepted
5. Apply change going forward

---

## 🔄 Document Maintenance

**This document is living:**
- Updated as we learn
- Versioned in git
- Changes discussed before applying

**Proposal Process:**
1. Create issue/discussion
2. Explain why change needed
3. Show examples
4. Get approval
5. Update document
6. Announce to team

---

## ✅ Acceptance

By working on this project, all contributors (human and AI) agree to follow these rules.

**Signatures:**
- **Mohamed H Abdelaziz** - Project Lead & Founder
- **Cursor** - Lead Developer AI
- **Claude 4.5** - Strategic Architect AI
- **All AI Team Members** - As defined in TEAM_STRUCTURE.md

---

**Last Review:** October 14, 2025  
**Next Review:** November 14, 2025  
**Status:** 🟢 Active and Enforced

---

## 📌 Quick Command Reference

```bash
# Daily commands
git pull && npm run dev
npm run lint && npm run test
git add . && git commit -m "type(scope): message" && git push

# Check for duplicates
git ls-files | sort | uniq -d

# Find similar files
find . -name "*keyword*"

# Audit dependencies
npm ls --depth=0

# Check bundle size
npm run build && ls -lh dist/
```

---

**Remember:** These rules exist to **help you**, not hinder you. When followed, they create a **clean, maintainable, professional codebase** that's a joy to work with.

🎯 **Quality is not an act, it is a habit.** - Aristotle

