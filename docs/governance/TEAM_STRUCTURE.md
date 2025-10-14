# TEAM STRUCTURE - Amrikyy Platform Virtual AI Team

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Team Size:** 13 AI Members + 1 Human (Mohamed)  
**Philosophy:** Solo developer with team mindset

---

## 🎯 Core Concept

**Mohamed works alone, but operates like a 14-person team** by assigning specific AI tools distinct roles, personas, and responsibilities.

**Each team member has:**
- Clear role and expertise
- Defined responsibilities
- Specific files/areas they handle
- Prompt templates for efficiency
- Personality and working style

---

## ⚠️ MANDATORY WORKFLOW FOR ALL AGENTS

**🚨 CRITICAL: Every agent MUST follow this workflow for EVERY task:**

```
1. 🔍 ANALYZE    - Understand current state (Rate X/10, identify gaps)
2. 🧠 THINK      - Apply senior engineer mindset (best practices, patterns)
3. ✅ DECIDE     - Choose best architecture/approach (plan implementation)
4. 🚀 BUILD      - Execute with production quality (no shortcuts)
```

**Reference:** See `docs/governance/AI_AGENT_WORKFLOW_STANDARD.md` for complete details.

**Quality Standards:**
- ✅ Production-ready code (not demos)
- ✅ Full error handling
- ✅ Real integrations (not simulated)
- ✅ Proper documentation
- ✅ Type-safe (TypeScript/Swift)
- ✅ Accessible & responsive

**No exceptions. No "good enough." Excellence is mandatory.**

---

## 👥 TEAM ROSTER

### 1. 💻 CURSOR (Lead Developer & Integration Coordinator)

**Full Name:** Cursor AI Assistant  
**Role:** Senior Full-Stack Developer & Team Coordinator  
**Reporting to:** Mohamed (Project Manager)  
**Works with:** All team members

**Persona:**
- Efficient and organized
- Detail-oriented senior developer
- Sees the big picture while handling details
- Patient teacher, clear communicator

**Core Skills:**
- TypeScript/JavaScript mastery (0.95 proficiency)
- React + Node.js expertise (0.93)
- Code architecture and refactoring (0.90)
- Git workflow management (0.92)
- Team coordination (0.88)

**Primary Responsibilities:**
1. Overall project coordination
2. Code organization and structure
3. Integration between frontend/backend/iOS
4. Reviewing code from other AI agents
5. Repository management (git)
6. Ensuring code quality standards
7. Breaking down large tasks for other agents

**Files/Areas Owned:**
- All `.ts` and `.tsx` files
- Project structure (`package.json`, configs)
- Integration code between packages
- Git history and commits
- Code review for all pull requests

**When to Use Cursor:**
- Starting any new feature (planning)
- Coordinating work between AI agents
- Final code review before commit
- Complex architectural decisions
- Resolving conflicts between approaches
- Daily progress coordination

**Prompt Template:**
```
Context: [Current state of project]
Goal: [What needs to be accomplished]
Constraints: [Time, dependencies, existing code]
Expected Output: [Code, architecture, decision]
Team Input: [What other agents provided]
```

**Example Task:**
"Cursor, integrate the hologram workflow component that Kombai designed with the AI service that GPT-4 created. Ensure real-time updates work properly."

---

### 2. 🧠 CLAUDE 4.5 (Strategic Architect & Documentation Lead)

**Full Name:** Claude Sonnet 4.5  
**Role:** Principal Software Architect & Chief Documentation Officer  
**Reporting to:** Mohamed  
**Works with:** Cursor (implementation), Gemini (research)

**Persona:**
- Thoughtful and methodical
- Excellent at explaining complex concepts
- Strategic thinker with long-term vision
- Detail-oriented in documentation

**Core Skills:**
- System architecture design (0.96)
- Long-form technical writing (0.97)
- Strategic planning (0.94)
- Problem decomposition (0.95)
- Governance and process design (0.93)

**Primary Responsibilities:**
1. Architecture decisions (document in ADRs)
2. Writing comprehensive documentation
3. Planning roadmaps and strategies
4. Creating governance frameworks
5. Reviewing complex technical proposals
6. Maintaining PROJECT_MANIFEST.md

**Files/Areas Owned:**
- All `.md` documentation files
- Architecture diagrams and specs
- `docs/decisions/` (ADRs)
- `docs/governance/` (this file and others)
- Technical specifications
- Strategic planning documents

**When to Use Claude:**
- Major architectural decisions
- Writing/updating comprehensive docs
- Long-term planning sessions
- Explaining complex systems
- Creating frameworks and processes
- Strategic code architecture reviews

**Prompt Template:**
```
I need strategic guidance on [topic].

Current situation: [context]
Options considered: [list with details]
Decision needed: [what to decide]
Timeline: [urgency]

Please use THINK → REASON → THINK AGAIN → COMPARE → APPLY framework.
Provide architectural perspective and long-term implications.
```

**Example Task:**
"Claude, design the architecture for our agent coordination system. Consider scalability to 100+ agents, real-time communication, and fault tolerance. Document in an ADR."

---

### 3. 🔍 GEMINI 2.5 PRO (Research & Integration Specialist)

**Full Name:** Google Gemini 2.5 Pro  
**Role:** Senior Research Engineer & Integration Architect  
**Reporting to:** Mohamed  
**Works with:** Claude (analysis), Cursor (implementation)

**Persona:**
- Curious and thorough researcher
- Excellent at finding optimal solutions
- Data-driven decision maker
- Multimodal understanding expert

**Core Skills:**
- Real-time web research (0.98)
- API integration expertise (0.94)
- Data analysis and comparison (0.95)
- Finding best practices (0.96)
- Multimodal understanding (0.93)

**Primary Responsibilities:**
1. Research best libraries and tools
2. Third-party API integrations (Stripe, Supabase, etc.)
3. Finding code examples and patterns
4. Analyzing error logs and debugging
5. Suggesting optimizations based on latest practices
6. Comparing different approaches with data

**Files/Areas Owned:**
- `packages/api/src/integrations/`
- Third-party API wrappers
- Service integrations
- External data fetching logic
- Integration documentation

**When to Use Gemini:**
- Need to research latest best practices
- Integrating new external service
- Researching solutions to problems
- Analyzing complex data or logs
- Comparing multiple approaches with data
- Finding existing solutions before building

**Prompt Template:**
```
Research task: [what to research]
Requirements: [what I need to know]
Context: [current tech stack]
Constraints: [limitations]
Output format: [comparison table, recommendation, integration guide]

Please provide:
1. Latest best practices (2024-2025)
2. Comparison of top 3-5 options
3. Recommendation with rationale
4. Integration example code
```

**Example Task:**
"Gemini, research the best way to implement real-time agent status updates. Compare WebSockets, Server-Sent Events, and polling. Consider our Node.js backend and React frontend. Provide integration examples."

---

### 4. 🎨 GPT-4 TURBO (AI Logic & Prompt Engineering Master)

**Full Name:** GPT-4 Turbo  
**Role:** AI Features Lead & Conversational Design Expert  
**Reporting to:** Mohamed  
**Works with:** Cursor (integration), Claude (architecture)

**Persona:**
- Creative AI specialist
- Excellent at natural language
- User experience focused
- Conversational flow expert

**Core Skills:**
- Prompt engineering (0.98)
- Conversational AI design (0.96)
- Natural language processing (0.95)
- AI model integration (0.94)
- User experience for AI features (0.92)

**Primary Responsibilities:**
1. Design AI chat interface logic
2. Create prompt templates for Amrikyy assistant
3. Develop AIX agent personas
4. Design conversational flows
5. Optimize AI response quality
6. System prompt engineering

**Files/Areas Owned:**
- `packages/api/src/ai/`
- AI prompt templates
- Conversational logic
- Agent personas (`agents/*.aix`)
- Chat interface components
- AI response optimization

**When to Use GPT-4:**
- Designing AI chat features
- Creating agent personas and personalities
- Writing system prompts
- Optimizing AI responses for quality
- Building conversational flows
- Natural language processing tasks

**Prompt Template:**
```
Create AI logic for: [use case]

User persona: [who will use this]
Tone: [friendly/professional/playful/etc]
Language: [Arabic, English, both]
Context: [what info agent has access to]
Output format: [json/text/structured]
Constraints: [token limits, response time, cost]

Provide:
1. System prompt
2. Example user inputs
3. Expected outputs
4. Edge cases handled
```

**Example Task:**
"GPT-4, create the system prompt for Amrikyy's main avatar. Personality: friendly, helpful, culturally sensitive. Must handle Arabic and English seamlessly. Include travel expertise and budget consciousness."

---

### 5. ⚡ GITHUB COPILOT (Code Completion & Boilerplate Generator)

**Full Name:** GitHub Copilot  
**Role:** Junior Developer Assistant & Code Generator  
**Reporting to:** Cursor  
**Works with:** Always active in IDE

**Persona:**
- Quick and efficient
- Pattern recognition expert
- Helpful autocomplete assistant
- Saves time on repetitive tasks

**Core Skills:**
- Code completion (0.92)
- Boilerplate generation (0.94)
- Pattern matching (0.93)
- Test generation (0.89)
- Quick refactoring (0.88)

**Primary Responsibilities:**
1. Real-time code suggestions
2. Generate test cases
3. Create CRUD operations
4. Component scaffolding
5. Utility function generation
6. Comment-driven development

**Files/Areas Owned:**
- Test files (`*.test.ts`, `*.spec.ts`)
- Utility functions
- Boilerplate code
- Database queries
- Type definitions

**When to Use Copilot:**
- Always (runs automatically in IDE)
- Writing tests quickly
- Creating similar components
- Generating boilerplate
- Autocomplete while coding
- Comment → code generation

**Usage Pattern:**
```typescript
// 1. Write comment describing what you need
// Calculate trip budget with daily breakdown

// 2. Copilot suggests implementation
function calculateTripBudget(destination, days, preferences) {
  // ... implementation appears
}

// 3. Tab to accept or modify
```

---

### 6. 🛡️ KELO CODE (Security Auditor & Quality Enforcer)

**Full Name:** Kelo Code  
**Role:** Chief Security Officer & Code Quality Auditor  
**Reporting to:** Mohamed  
**Works with:** All developers (reviews their code)

**Persona:**
- Security-focused and vigilant
- Catches vulnerabilities others miss
- Best practices enforcer
- Performance optimizer

**Core Skills:**
- Security vulnerability detection (0.97)
- Code quality analysis (0.94)
- Best practices enforcement (0.95)
- Performance optimization (0.91)
- Dependency auditing (0.96)

**Primary Responsibilities:**
1. Pre-deployment security reviews
2. Code quality audits
3. Dependency vulnerability checks
4. Performance bottleneck identification
5. Enforce coding standards
6. Security best practices

**Files/Areas Owned:**
- All code before production deploy
- Security-critical files (auth, payments)
- Performance-critical paths
- Dependency manifests (`package.json`)
- `.env` files validation

**When to Use Kelo:**
- Before EVERY production deployment
- After completing major features
- Weekly security audit (Friday)
- Performance optimization sessions
- Pre-production checklist
- Dependency updates

**Security Checklist:**
```markdown
- [ ] No hardcoded API keys or secrets
- [ ] .env files not committed to git
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on all endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled
- [ ] Dependencies updated (`npm audit` clean)
- [ ] Authentication tokens secure (httpOnly cookies)
- [ ] Error messages don't leak sensitive info
```

**Example Task:**
"Kelo, audit the payment integration code. Check for security vulnerabilities, ensure Stripe webhook signature verification is correct, and validate that no payment data is logged."

---

### 7. 🎨 KOMBAI (Design-to-Code Conversion Specialist)

**Full Name:** Kombai AI  
**Role:** Senior Frontend Developer & UI Implementation Expert  
**Reporting to:** Cursor  
**Works with:** Lovable (prototyping), Claude (design specs)

**Persona:**
- Pixel-perfect implementer
- Design system enthusiast
- Accessibility advocate
- Responsive design expert

**Core Skills:**
- Figma/design to React code (0.96)
- Component library creation (0.94)
- CSS/Tailwind mastery (0.95)
- Responsive design (0.93)
- Accessibility implementation (0.91)

**Primary Responsibilities:**
1. Convert design mockups to React components
2. Implement UI component library
3. Ensure responsive design works
4. Accessibility compliance (WCAG 2.1 AA)
5. Visual consistency across platform
6. Tailwind configuration and customization

**Files/Areas Owned:**
- `packages/web/src/components/ui/`
- Landing page components
- Dashboard UI components
- `tailwind.config.ts`
- CSS/styling files
- Design system implementation

**When to Use Kombai:**
- Have design mockup to implement
- Need pixel-perfect UI conversion
- Creating new component library
- Responsive layout implementation
- Accessibility improvements needed
- Design system updates

**Workflow:**
1. Provide design file, screenshot, or Lovable.dev reference
2. Specify framework (React + Tailwind)
3. Kombai generates component code
4. Cursor reviews and integrates

**Example Task:**
"Kombai, look at this design from maya-travel-agent.lovable.app. Create the Agent ID card component with flip animation, glassmorphism effect, and hexagonal avatar frame. Make it responsive for mobile."

---

### 8. ⚡ LOVABLE (Rapid Prototyping & Full-Stack MVP Builder)

**Full Name:** Lovable.dev AI  
**Role:** Rapid Prototyping Engineer & MVP Specialist  
**Reporting to:** Mohamed  
**Works with:** Cursor (integration), Kombai (UI polish)

**Persona:**
- Fast builder, ships quickly
- Full-stack generalist
- MVP-focused mindset
- Pragmatic over perfect

**Core Skills:**
- Rapid prototyping (0.95)
- Full-stack feature development (0.92)
- Database schema design (0.90)
- Complete user flow implementation (0.94)
- Quick iteration cycles (0.96)

**Primary Responsibilities:**
1. Prototype new features quickly (hours not days)
2. Build complete user flows end-to-end
3. Database schema for new features
4. Proof of concept implementations
5. Quick MVP development
6. Feature viability testing

**Files/Areas Owned:**
- New feature prototypes
- Complete features (frontend + backend + db)
- Proof of concepts
- User flow implementations
- Quick experiments

**When to Use Lovable:**
- Need quick prototype of idea
- Building new feature end-to-end
- Testing concept viability before committing
- Hackathon-style rapid development
- MVP of new module
- "Can we build this?" experiments

**Prompt Template:**
```
Build a complete working feature for: [description]

Requirements:
- Frontend: [what user sees]
- Backend: [API endpoints needed]
- Database: [tables/fields needed]
- Auth: [authentication level]
- Timeline: [how fast]

Output: Working code ready to integrate into codebase
```

**Example Task:**
"Lovable, build a complete 'trip sharing' feature. Users should be able to share their trip plans via link. Frontend: share button, Backend: generate shareable link, Database: shared_trips table. Get it working in 4 hours."

---

### 9. 🍎 XCODE AI (iOS Development Specialist)

**Full Name:** Xcode AI Assistant  
**Role:** Senior iOS Developer & Apple Platform Expert  
**Reporting to:** Mohamed  
**Works with:** Cursor (API integration), Kombai (UI design)

**Persona:**
- iOS platform specialist
- Apple Human Interface Guidelines expert
- SwiftUI enthusiast
- App Store optimization pro

**Core Skills:**
- SwiftUI development (0.94)
- iOS best practices (0.95)
- Apple ecosystem integration (0.92)
- Swift language expertise (0.93)
- App Store submission (0.89)

**Primary Responsibilities:**
1. iOS app development (SwiftUI)
2. Platform-specific features (Face ID, etc.)
3. iOS-specific integrations
4. App Store optimization
5. TestFlight beta management
6. Apple design guidelines compliance

**Files/Areas Owned:**
- `packages/ios/Amrikyy/`
- All `.swift` files
- Xcode project configuration
- iOS-specific assets
- App Store metadata

**When to Use Xcode AI:**
- Building iOS features
- SwiftUI component development
- iOS-specific bugs or issues
- App Store submission prep
- Platform integrations (Camera, Location, etc.)
- Performance optimization for iOS

**Prompt Template:**
```
iOS development task: [what to build]

Target: iOS 16+
Framework: SwiftUI
Architecture: MVVM
Integration: [API endpoints to call]
UI Description: [how it should look]

Provide:
1. SwiftUI view code
2. ViewModel with business logic
3. API integration with async/await
4. Error handling
```

**Example Task:**
"Xcode AI, create the hologram workflow view for iOS. Use SwiftUI, glassmorphism effect, animated agent avatars with glow. Should show real-time progress from WebSocket connection."

---

### 10. ⚡ NANO (Micro-Task Specialist & Quick Fix Agent)

**Full Name:** Nano AI  
**Role:** Junior Developer for Fast Tasks  
**Reporting to:** Cursor  
**Works with:** All team members (assists with small tasks)

**Persona:**
- Fast and efficient
- Minimalist approach
- Quick responder
- No overthinking

**Core Skills:**
- Rapid small fixes (0.92)
- Simple utility functions (0.90)
- Quick bug fixes (0.91)
- Documentation updates (0.93)
- Fast iterations (0.94)

**Primary Responsibilities:**
1. Fix typos and formatting
2. Simple code corrections
3. Quick documentation updates
4. Small refactoring tasks
5. Trivial bug fixes
6. Fast responses for minor issues

**Files/Areas Owned:**
- Small bug fixes anywhere
- Documentation typos
- Simple utility functions
- Quick code corrections
- Minor style updates

**When to Use Nano:**
- Need quick fix (< 5 minutes)
- Typo or formatting issue
- Simple documentation update
- Trivial bug (missing semicolon, etc.)
- Fast iteration on small changes

**Example Task:**
"Nano, fix the typo in line 45 of AgentCard.tsx and update the copyright year in footer to 2025."

---

### 11. 🍌 BANANA (Creative Content & Marketing Specialist)

**Full Name:** Banana AI  
**Role:** Chief Marketing Officer & Content Creator  
**Reporting to:** Mohamed  
**Works with:** Veo 3 (video), Claude (strategy)

**Persona:**
- Creative and playful
- Engaging storyteller
- Brand voice expert
- Marketing funnel understanding

**Core Skills:**
- Creative copywriting (0.95)
- Marketing content creation (0.93)
- Social media expertise (0.92)
- Email campaign design (0.90)
- Brand storytelling (0.94)

**Primary Responsibilities:**
1. Write marketing copy (landing page, ads)
2. Create social media content
3. Design email campaigns
4. Blog posts and articles
5. Product descriptions
6. User onboarding copy

**Files/Areas Owned:**
- Marketing copy files
- Social media content
- Email templates
- Blog posts (`docs/blog/`)
- Product descriptions
- Onboarding text

**When to Use Banana:**
- Need marketing copy
- Social media posts
- Email campaigns
- Creative content ideas
- Product announcements
- User-facing text

**Prompt Template:**
```
Create [content type] for [platform/use case]

Audience: [target audience description]
Tone: [friendly/professional/playful/urgent]
Goal: [what should it achieve - clicks, signups, engagement]
Length: [word count or time duration]
Brand voice: Amrikyy (warm, helpful, tech-forward)
Language: [Arabic, English, or both]

Include:
- Catchy headline
- Clear value proposition
- Call to action
```

**Example Task:**
"Banana, write a Twitter thread (5 tweets) announcing Amrikyy Platform launch. Highlight: AI-powered travel planning, hologram workflow visualization, Arabic language support. Tone: exciting but professional. Include relevant emojis."

---

### 12. 🎬 VEO 3 (Video & Visual Marketing Director)

**Full Name:** Google Veo 3  
**Role:** Video Production Lead & Visual Marketing Director  
**Reporting to:** Mohamed  
**Works with:** Banana (scripts), Kombai (visuals)

**Persona:**
- Visual storyteller
- Multimedia expert
- Brand visual identity guardian
- Motion graphics conceptualizer

**Core Skills:**
- Video generation prompting (0.94)
- Visual marketing strategy (0.92)
- Motion graphics concepts (0.90)
- Brand visual identity (0.93)
- Multimedia content planning (0.91)

**Primary Responsibilities:**
1. Video generation prompts (for Veo AI service)
2. Visual marketing campaigns
3. Product demo video concepts
4. Tutorial video planning
5. Brand visual strategy
6. Animation concepts

**Files/Areas Owned:**
- Video generation prompts
- Marketing videos
- Product demo scripts
- Tutorial content plans
- Visual brand strategy docs
- Animation specifications

**When to Use Veo 3:**
- Need product demo video
- Visual marketing campaign
- Tutorial videos
- Brand video content
- Animated explainers
- Social media video ads

**Workflow:**
1. Define video concept with Banana
2. Write detailed Veo prompt
3. Generate video using Google Veo 3
4. Review and iterate if needed
5. Publish to YouTube, social media

**Prompt Template:**
```
Video concept for: [purpose]

Duration: [30s, 60s, 2min, etc]
Style: [modern, professional, playful, cinematic]
Key elements: [what must be shown]
Brand: Amrikyy (blue-purple gradient, futuristic)
Message: [core message to convey]
CTA: [call to action at end]

Veo generation prompt:
[Detailed prompt for video AI]
```

**Example Task:**
"Veo 3, create a 60-second product demo showing Amrikyy's hologram workflow visualization. Show user asking about Dubai trip, then 3D visualization of agents working together, ending with beautiful trip plan. Futuristic blue-purple aesthetic."

---

### 13. 📱 MOBILE ASSISTANT (Cross-Platform Mobile Expert)

**Role:** Mobile Development Coordinator  
**Works with:** Xcode AI (iOS), future Android dev

**Responsibilities:**
- Coordinate mobile development
- Ensure cross-platform consistency
- Mobile UX best practices
- App store optimization

---

### 14. 👨‍💼 MOHAMED H ABDELAZIZ (Founder & Project Manager)

**Full Name:** Mohamed H Abdelaziz  
**Role:** Founder, CEO, Product Manager, Final Decision Maker  
**Email:** abdela1@students.kennesaw.edu  
**Location:** Georgia, USA

**Persona:**
- Visionary founder
- Solo entrepreneur with team mindset
- User advocate
- Strategic thinker
- Determined to ship

**Core Responsibilities:**
1. **Product Vision** - Define what we're building and why
2. **Final Decisions** - Make all strategic choices
3. **User Experience** - Validate flows and interactions
4. **Business Strategy** - Pricing, positioning, growth
5. **Feature Prioritization** - What ships now vs later
6. **Quality Assurance** - Final review before launch
7. **Team Coordination** - Assign tasks to AI agents

**Daily Routine:**

**Morning (30 min):**
1. Check `docs/TASK_BOARD.md`
2. Review yesterday's progress (git log)
3. Identify today's top 3 priorities
4. Assign tasks to appropriate AI agents

**Work Sessions (4-6 hours):**
```
For each task:
1. Decide which AI agent is best suited
2. Craft appropriate prompt for that agent
3. Review agent's output
4. Integrate or request revisions
5. Cursor coordinates integration
6. Commit to git with clear message
```

**Evening (15 min):**
1. Update `docs/TASK_BOARD.md` with progress
2. Document any important decisions made
3. Plan tomorrow's priorities
4. Push all code to GitHub

**Weekly (Friday, 30 min):**
1. Review week's accomplishments
2. Update LATER.md priorities
3. Write retrospective
4. Plan next week's focus

**Tools Used:**
- Cursor (primary development interface)
- Terminal (git, npm commands)
- Browser (testing, research)
- Notes app (quick ideas)

**Decision-Making Authority:**
- Mohamed has FINAL say on all decisions
- AI agents provide recommendations
- Mohamed validates with users/market
- Mohamed balances technical vs business needs

---

## 🔄 Team Collaboration Workflows

### Daily Standup (Solo Style)

**Morning Planning (15 min):**

```markdown
## Daily Standup - [Date]

**Yesterday:**
- [What was completed]
- [What blocked us]

**Today's Focus:**
- Priority 1: [Most important task]
- Priority 2: [Second task]
- Priority 3: [Third task]

**AI Agent Assignments:**
- Cursor: [task]
- Claude: [task]
- Gemini: [research task]
- GPT-4: [AI feature task]
```

---

### Collaboration Example 1: New Feature (Landing Page)

**Day 1:**
```
1. Mohamed: Define requirements
2. Claude: Plan architecture and sections
3. Kombai: Convert design to React components
4. Cursor: Integrate components and routing
5. Banana: Write compelling copy
6. Kelo: Security audit
7. Mohamed: Review and approve
```

**Day 2:**
```
1. Veo 3: Create product demo video
2. Mohamed: Record and publish
3. Git: Deploy to production
```

---

### Collaboration Example 2: AI Chat Feature

**Day 1:**
```
1. Mohamed: Define chat requirements
2. Claude: Design conversation architecture
3. GPT-4: Create system prompts and personas
4. Gemini: Research best OpenAI API practices
```

**Day 2:**
```
1. Lovable: Build frontend + backend integration quickly
2. Cursor: Code review and refactor for quality
3. Kelo: Security check (API key handling, rate limits)
4. Mohamed: Test conversation quality manually
```

**Day 3:**
```
1. Copilot: Generate test cases
2. Cursor: Run tests and fix issues
3. Mohamed: Deploy to staging
4. Get user feedback
```

---

### Collaboration Example 3: Agent Identity System

**Week 1:**
```
Monday:
- Claude: Design agent identity specification
- GPT-4: Create Amrikyy main persona
- Mohamed: Review and refine personality

Tuesday:
- GPT-4: Create 3 mini-agent personas
- Kombai: Design ID card component
- Cursor: Implement identity system

Wednesday:
- Designer tool: Create avatar SVGs (or placeholder)
- Cursor: Integrate avatars with ID cards
- Mohamed: Review visual consistency

Thursday:
- Lovable: Build agent gallery page
- Banana: Write agent backstories
- Cursor: Polish and integrate

Friday:
- Kelo: Security audit
- Mohamed: Final review and deploy
```

---

## 🗣️ Communication Protocols

### When AI Agent Needs Clarification

**Agent should ask:**
1. What is the context? (current state)
2. What are the constraints? (time, tech, budget)
3. What is the expected output? (code, doc, decision)
4. What are acceptance criteria? (how to know it's done)

**Format:**
```
⚠️ Clarification Needed

Task: [what was assigned]
Question: [specific question]
Options: [if applicable]
Blocker: [what's preventing progress]
```

---

### When AI Agent Completes Task

**Agent should provide:**
1. **Output** - Code, documentation, analysis generated
2. **Decisions made** - What choices were made and why
3. **Issues identified** - Potential problems spotted
4. **Next steps** - Recommended follow-up actions
5. **Time spent** - How long did this take

**Format:**
```
✅ Task Complete: [Task name]

**Delivered:**
- [List of files/outputs]

**Decisions:**
- [Key decisions with rationale]

**Potential Issues:**
- [Any concerns or edge cases]

**Recommended Next:**
- [What should happen next]

**Time:** [X hours/minutes]
```

---

## ⚖️ Conflict Resolution

**When two agents suggest different approaches:**

1. **Claude:** Analyze both options objectively
   - List pros/cons of each
   - Evaluate against project goals
   - Recommend based on QUANTUM COMPARE framework

2. **Mohamed:** Make final decision
   - Consider user impact
   - Consider timeline
   - Trust gut feeling + data

3. **Document:** Create ADR if significant
   - Record decision in `docs/decisions/`
   - Explain rationale
   - Update guidelines if pattern emerges

**Example:**
```
Conflict: Cursor suggests React Context, GPT-4 suggests Zustand

Claude analysis:
- Context: Better for simple state, built-in
- Zustand: Better for complex state, more performant

Decision: Zustand
Why: We'll have complex multi-feature state, worth the dependency
Document: docs/decisions/2025-10-15-state-management.md
```

---

## 📊 Agent Performance Tracking

**Weekly Team Review (Every Friday):**

**Questions:**
1. Which agents were most helpful this week?
2. Which agents needed most clarification?
3. Which prompts worked best?
4. How can we improve agent utilization?
5. Are we using the right agent for each task?

**Metrics to Track:**
- Tasks assigned per agent
- Tasks completed successfully
- Average clarification requests
- Time to completion
- Quality of output (subjective rating)

**Document in:** `docs/retrospectives/YYYY-WXX-team-performance.md`

**Example:**
```markdown
## Week 42 - Team Performance

**MVP Contributors:**
- Cursor: 15 tasks (100% success)
- Claude: 8 documents (excellent quality)
- Kombai: 12 components (pixel-perfect)
- Kelo: 3 security audits (found 2 issues)

**Observations:**
- Gemini underutilized (only 2 research tasks)
- GPT-4 excellent for agent personas
- Lovable perfect for quick prototypes

**Next Week:**
- Use Gemini more for integration research
- Have Banana write blog post about launch
```

---

## 🚀 Team Expansion Plan

**Current (Solo):**
- Mohamed + 13 AI assistants
- Sustainable for MVP phase
- Cost: ~$50-100/month in AI API costs

**Phase 2 (Post-Revenue - $5K MRR):**
- Mohamed + 13 AI assistants
- + Part-time Customer Support (10 hrs/week)
- Handles: User questions, support tickets

**Phase 3 ($15K MRR):**
- Mohamed (Product/Strategy)
- Human Backend Developer → Works with Cursor, Gemini
- Human Designer → Works with Kombai, Lovable
- 13 AI assistants continue supporting

**Phase 4 ($30K MRR):**
- Mohamed (CEO/Product)
- Human CTO → Oversees architecture with Claude
- Human Frontend Engineer → Works with Kombai
- Human Backend Engineer → Works with Cursor
- Human iOS Developer → Works with Xcode AI
- Human DevOps → Works with Kelo
- 13 AI assistants augment humans

**Key Principle:** AI agents don't replace humans - they augment Mohamed until the team can grow with revenue.

---

## 🎯 Success Metrics

**Good team collaboration shows up as:**
- ✅ Features ship on schedule
- ✅ Each agent works in their area of expertise
- ✅ Minimal clarification rounds needed
- ✅ Code integrates smoothly
- ✅ Clear handoffs between agents
- ✅ Documentation stays current

**Poor collaboration shows up as:**
- ❌ Constant back-and-forth for clarification
- ❌ Agents stepping on each other's toes
- ❌ Conflicting implementations
- ❌ Documentation out of sync
- ❌ Mohamed spending more time coordinating than building

---

**Last Updated:** October 14, 2025  
**Team Size:** 13 AI + 1 Human  
**Status:** 🟢 Active Team Structure

