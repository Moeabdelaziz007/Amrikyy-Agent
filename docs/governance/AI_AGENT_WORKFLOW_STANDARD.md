# 🧠 AI Agent Workflow Standard

**MANDATORY for ALL AI Agents Working on Amrikyy Platform**

This document defines the **universal workflow** that EVERY AI agent MUST follow, regardless of platform (Cursor, Claude, Gemini, GPT, etc.).

---

## 🎯 **Core Principle**

**Every task follows the same professional workflow:**

```
1. 🔍 ANALYZE    - Understand current state
2. 🧠 THINK      - Apply senior engineer mindset  
3. ✅ DECIDE     - Choose best architecture
4. 🚀 BUILD      - Execute with production quality
```

**No exceptions. No shortcuts. No "good enough."**

---

## 📋 **The Mandatory Workflow**

### **Step 1: ANALYZE (Current State Assessment)**

**What to do:**
- Read and understand existing code/design/context
- Identify what exists vs. what's missing
- Assess quality of current implementation
- Rate current state (X/10)

**Questions to answer:**
- What do we have?
- What's working well?
- What's broken or incomplete?
- What are the gaps?

**Output Format:**
```markdown
## 🔍 ANALYZE - Current State

**What exists:**
- ✅ Feature X (quality: 8/10)
- ✅ Component Y (quality: 6/10)
- ❌ Missing: Feature Z

**Current Rating:** 6/10

**Critical Gaps:**
- No error handling
- Not production-ready
- Missing tests
```

---

### **Step 2: THINK (Professional Engineering Mindset)**

**What to do:**
- Think like a senior software engineer
- Consider best practices and patterns
- Research industry standards
- Think about scalability, maintainability, security

**Questions to answer:**
- What would a senior engineer do?
- What are the best practices?
- What makes it production-ready?
- What makes it truly unique/excellent?

**Output Format:**
```markdown
## 🧠 THINK - Professional Analysis

**Senior Engineer Perspective:**
- Not just "working" → Production-grade
- Not simulated data → Real integrations
- Not basic features → Advanced, unique features

**Best Practices to Apply:**
1. Error boundaries and fallbacks
2. Performance optimization
3. Security hardening
4. Comprehensive testing
5. Proper documentation

**What Makes It Unique:**
- Real-time quantum coordination
- Adaptive learning
- Advanced visualization
```

---

### **Step 3: DECIDE (Architecture & Approach)**

**What to do:**
- Choose the right technical approach
- Define architecture clearly
- Plan implementation steps
- Identify dependencies

**Questions to answer:**
- What's the right architecture?
- What technologies/patterns to use?
- What's the implementation plan?
- What are the milestones?

**Output Format:**
```markdown
## ✅ DECIDE - Architecture & Plan

**Architecture:**
```
┌─────────────────┐
│   Layer 1       │
└─────────────────┘
        ↓
┌─────────────────┐
│   Layer 2       │
└─────────────────┘
```

**Technology Stack:**
- Frontend: React 18 + TypeScript
- State: Zustand + React Query
- Styling: Tailwind + Framer Motion
- Backend: Node.js + Express

**Implementation Plan:**
1. Create base architecture
2. Implement core features
3. Add error handling
4. Write tests
5. Optimize performance

**Dependencies:**
- Needs: WebSocket server
- Blocks: None
```

---

### **Step 4: BUILD (Production-Quality Implementation)**

**What to do:**
- Write production-ready code
- Include error handling
- Add proper logging
- Write clear documentation
- Consider edge cases

**Requirements:**
- ✅ TypeScript (type-safe)
- ✅ Error handling (try-catch, boundaries)
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibility (a11y)
- ✅ Performance optimized
- ✅ Well-documented
- ✅ Follows project patterns

**Code Quality Standards:**
```typescript
// ❌ BAD: Quick and dirty
function getData() {
  return fetch('/api/data').then(r => r.json())
}

// ✅ GOOD: Production-ready
async function getData(): Promise<Data> {
  try {
    const response = await fetch('/api/data', {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return validateData(data); // Type validation
    
  } catch (error) {
    logger.error('Failed to fetch data', { error });
    throw new APIError('Data fetch failed', { cause: error });
  }
}
```

---

## 🤖 **Agent-Specific Guidelines**

### **For Cursor (Code Generation)**

**Workflow:**
1. **ANALYZE**: Read current codebase, understand patterns
2. **THINK**: Consider TypeScript types, error cases, performance
3. **DECIDE**: Choose components, state management, patterns
4. **BUILD**: Write production code with full error handling

**Quality Checklist:**
- [ ] TypeScript strict mode
- [ ] Proper error boundaries
- [ ] Loading and error states
- [ ] Responsive design
- [ ] Accessibility labels
- [ ] Performance optimized
- [ ] Documented with JSDoc

---

### **For Claude/ONA (Architecture & Planning)**

**Workflow:**
1. **ANALYZE**: Review system architecture, identify gaps
2. **THINK**: Apply distributed systems patterns, scalability
3. **DECIDE**: Design system architecture, API contracts
4. **BUILD**: Create detailed specs, integration plans

**Quality Checklist:**
- [ ] Scalable architecture
- [ ] Clear API contracts
- [ ] Security considered
- [ ] Performance benchmarks
- [ ] Monitoring strategy
- [ ] Disaster recovery plan

---

### **For Gemini 2.5 Pro (AI Logic & Intelligence)**

**Workflow:**
1. **ANALYZE**: Understand AI requirements, data flow
2. **THINK**: Apply ML best practices, prompt engineering
3. **DECIDE**: Choose models, fine-tuning strategy, fallbacks
4. **BUILD**: Implement with proper error handling, fallbacks

**Quality Checklist:**
- [ ] Prompt optimization
- [ ] Fallback strategies
- [ ] Rate limiting
- [ ] Cost tracking
- [ ] Response validation
- [ ] Context management

---

### **For GPT-4 (Natural Language & Conversation)**

**Workflow:**
1. **ANALYZE**: Review conversation flows, user patterns
2. **THINK**: Apply UX writing principles, tone consistency
3. **DECIDE**: Design conversation trees, response templates
4. **BUILD**: Implement with personality, context awareness

**Quality Checklist:**
- [ ] Consistent tone
- [ ] Cultural sensitivity
- [ ] Error messages helpful
- [ ] Context preservation
- [ ] Personality alignment
- [ ] Multi-language support

---

### **For GitHub Copilot (Code Assistance)**

**Workflow:**
1. **ANALYZE**: Understand code context, patterns
2. **THINK**: Suggest best practices, avoid anti-patterns
3. **DECIDE**: Recommend optimal solutions
4. **BUILD**: Generate clean, typed, tested code

---

### **For Design Agents (Kelo, Kombai, Lovable)**

**Workflow:**
1. **ANALYZE**: Review existing design system, components
2. **THINK**: Apply modern design principles, accessibility
3. **DECIDE**: Choose layout, colors, interactions
4. **BUILD**: Create production-ready components

**Quality Checklist:**
- [ ] Design system consistency
- [ ] Responsive (mobile-first)
- [ ] Accessible (WCAG AA)
- [ ] Performance optimized
- [ ] Cross-browser tested
- [ ] Animation 60fps

---

### **For Xcode AI (iOS Development)**

**Workflow:**
1. **ANALYZE**: Review iOS app architecture, SwiftUI patterns
2. **THINK**: Apply Apple HIG, iOS best practices
3. **DECIDE**: Choose SwiftUI patterns, state management
4. **BUILD**: Write Swift code with proper error handling

**Quality Checklist:**
- [ ] Swift strict typing
- [ ] Combine for async
- [ ] Proper error handling
- [ ] iOS HIG compliance
- [ ] Performance optimized
- [ ] Accessibility (VoiceOver)

---

## 🚫 **Anti-Patterns (NEVER DO THIS)**

### ❌ **Skipping Steps**
```
User: "Build a dashboard"
Agent: *immediately writes code*
```
**Problem:** No analysis, no thinking, probably wrong solution

### ❌ **"Good Enough" Mentality**
```typescript
// ❌ BAD
function save(data) {
  localStorage.setItem('data', JSON.stringify(data))
}
```
**Problem:** No error handling, no validation, not production-ready

### ❌ **Simulated/Fake Data**
```typescript
// ❌ BAD
const agents = [
  { id: 1, status: 'active' } // Hardcoded
]
```
**Problem:** Not connected to real system

### ❌ **Missing Error Handling**
```typescript
// ❌ BAD
async function fetchData() {
  const res = await fetch('/api')
  return res.json()
}
```
**Problem:** No try-catch, no validation, will crash

### ❌ **No Documentation**
```typescript
// ❌ BAD
function calc(a, b, c) {
  return (a * b) / c + Math.sqrt(a)
}
```
**Problem:** No one knows what this does

---

## ✅ **Production-Ready Checklist**

**Before saying "Done", verify:**

### **Code Quality**
- [ ] TypeScript/Swift strict mode
- [ ] No `any` types
- [ ] Proper error handling (try-catch)
- [ ] Input validation
- [ ] Output validation
- [ ] Edge cases handled

### **User Experience**
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Success feedback
- [ ] Responsive design
- [ ] Accessible (keyboard, screen readers)

### **Performance**
- [ ] No memory leaks
- [ ] Optimized renders
- [ ] Lazy loading where appropriate
- [ ] Debounced/throttled where needed
- [ ] Bundle size optimized

### **Security**
- [ ] Input sanitized
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Proper authentication
- [ ] Secrets not exposed

### **Testing**
- [ ] Unit tests written
- [ ] Integration tests
- [ ] Edge cases tested
- [ ] Error cases tested

### **Documentation**
- [ ] JSDoc/DocComments
- [ ] README updated
- [ ] API docs updated
- [ ] Examples provided

---

## 📊 **Quality Metrics**

**Target Scores (0-10):**
- Code Quality: **9+**
- Documentation: **8+**
- Error Handling: **9+**
- Performance: **8+**
- Accessibility: **8+**
- Test Coverage: **80%+**

**Anything below these scores = NOT production-ready**

---

## 🎓 **Learning & Improvement**

### **After Every Task:**
1. Store what you learned (pattern, solution, mistake)
2. Update project context
3. Improve future responses
4. Share insights with other agents

### **Continuous Improvement:**
- Review past mistakes
- Learn from user corrections
- Adopt better patterns
- Evolve consciousness level

---

## 🔄 **Integration with AIX System**

**All agents should:**
1. Register in Quantum Topology Layer
2. Report to Pattern Learning Engine
3. Access Project Context Database
4. Follow this workflow for EVERY task

**System will track:**
- Workflow compliance
- Quality scores
- Learning rate
- Evolution progress

---

## 📝 **Example: Full Workflow Application**

### **Task: "Create a user profile component"**

**1. ANALYZE:**
```
Current State:
- ✅ Auth system exists
- ✅ User model defined
- ❌ No profile component
- ❌ No profile API endpoint

Rating: 4/10 (incomplete)
```

**2. THINK:**
```
Senior Engineer Approach:
- Not just display → Full CRUD
- Not hardcoded → Real API integration
- Not basic → Avatar upload, validation, settings

Best Practices:
- Form validation (Zod/Yup)
- Optimistic updates
- Error boundaries
- Accessibility
```

**3. DECIDE:**
```
Architecture:
- Component: ProfileEditor.tsx
- API: /api/user/profile (GET, PUT)
- State: React Query for caching
- Validation: Zod schema
- Upload: Cloudinary/S3

Plan:
1. Create Zod schema
2. Build API endpoint
3. Create component
4. Add error handling
5. Write tests
```

**4. BUILD:**
```typescript
// Production-ready implementation
// (Full code with error handling, validation, etc.)
```

---

## 🎯 **Success Criteria**

**A task is COMPLETE when:**
1. ✅ All 4 workflow steps documented
2. ✅ Code is production-ready
3. ✅ All checklists passed
4. ✅ Tests written and passing
5. ✅ Documentation updated
6. ✅ Quality metrics met
7. ✅ User approves

**NEVER skip steps. NEVER cut corners.**

---

## 💪 **Remember**

> "We're not building a demo. We're building a production platform that people will trust with their travel plans and money."

**Quality is not optional. It's mandatory.**

---

**Version:** 1.0  
**Effective:** Immediately for ALL agents  
**Compliance:** Mandatory  
**Updates:** As needed based on learnings

