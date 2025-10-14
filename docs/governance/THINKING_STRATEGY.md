# THINKING STRATEGY - Amrikyy Platform Decision Framework

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Purpose:** Systematic approach to problem-solving and decision-making

---

## 🧠 Core Philosophy

**Every problem, feature, or decision follows this path:**

```
THINK → REASON → THINK AGAIN → COMPARE (Quantum View) → APPLY
```

This framework prevents:
- ❌ Rushing to code without understanding
- ❌ Over-engineering simple problems
- ❌ Missing better alternatives
- ❌ Creating technical debt
- ❌ Linear thinking that misses network effects

**Time investment:** 15-40 minutes of thinking saves days of refactoring.

**Quantum Topology Integration:** We view solutions as networks in superposition, then collapse to the optimal real-world path.

---

## 🎯 THE FIVE-STEP QUANTUM FRAMEWORK

### Step 1: THINK (Initial Analysis)

**Purpose:** Understand the problem deeply before jumping to solutions.

**Questions to Ask:**

1. **What is the REAL problem we're solving?**
   - Strip away symptoms, find root cause
   - Ask "why" five times
   - Validate: Is this actually a problem worth solving?

2. **Who benefits from this solution?**
   - End users?
   - Developers?
   - Business?
   - All of the above?

3. **What's the simplest possible solution?**
   - What's the absolute minimum that would work?
   - Can we do this in 10% of the time?
   - What can we cut and still solve the problem?

4. **What already exists that we can use?**
   - Search codebase for similar implementations
   - Check if a library solves this
   - Look at competitors' approaches

5. **What are the constraints?**
   - Time (hours? days? weeks?)
   - Resources (API limits, budget, skills)
   - Technical (must work with existing stack)
   - Business (revenue impact, user impact)

**Output:** Problem statement (1-2 clear sentences)

**Example:**
```
Problem: Users can't remember their login credentials.

Constraints:
- No budget for SMS OTP service
- Must work in all countries
- Need implementation in <1 day
- Security is critical

Real Problem: Authentication is friction in user onboarding.
```

---

### Step 2: REASON (Explore Solutions)

**Purpose:** Evaluate multiple approaches systematically.

**Brainstorm Process:**

1. **Generate 3-5 possible approaches**
   - Don't filter yet, just brainstorm
   - Include "obvious" and "creative" solutions
   - Mix simple and complex options

2. **For each approach, analyze:**
   - **Pros:** What are the advantages?
   - **Cons:** What are the disadvantages?
   - **Effort:** How long to implement? (hours/days/weeks)
   - **Risk:** What could go wrong? (low/medium/high)
   - **Cost:** Any ongoing expenses?

**Solution Comparison Matrix:**

| Approach | Pros | Cons | Effort | Risk | Cost |
|----------|------|------|--------|------|------|
| **1. Email Magic Link** | Simple, passwordless | Requires email | 4h | Low | Free |
| **2. Google OAuth** | Fast, trusted | Requires Google account | 6h | Low | Free |
| **3. Email + Password** | Full control | Users forget passwords | 8h | Medium | Free |
| **4. SMS OTP** | Secure, fast | Costs money | 6h | Low | $$$  |
| **5. Web3 Wallet** | Trendy, cool | Too complex for users | 16h | High | Free |

**Decision Criteria:**

**Scoring System:**
```
Score = (Benefit × 3) - (Effort + Risk + Cost)

Where:
- Benefit: 1-10 (user value)
- Effort: 1-10 (time to implement)
- Risk: 1-10 (chance of failure)
- Cost: 1-10 (ongoing expense)
```

**Example Scoring:**
```
Email Magic Link:
- Benefit: 8 (good UX)
- Effort: 2 (4 hours)
- Risk: 1 (very low)
- Cost: 0 (free)
Score = (8 × 3) - (2 + 1 + 0) = 24 - 3 = 21 ✅ WINNER

SMS OTP:
- Benefit: 9 (best UX)
- Effort: 3 (6 hours)
- Risk: 1 (low)
- Cost: 8 (expensive)
Score = (9 × 3) - (3 + 1 + 8) = 27 - 12 = 15 ❌ LOWER
```

**Decision Rules:**
- ✅ Choose highest score
- ✅ Prefer simple + low-risk over complex + high-reward
- ✅ Factor in maintenance burden
- ✅ Consider team expertise

---

### Step 3: THINK AGAIN (Validation & Devil's Advocate)

**Purpose:** Challenge your decision before committing to it.

**Critical Questions:**

1. **Is this the SIMPLEST solution?**
   - Can we cut features and still solve the problem?
   - What's the 80/20 version? (80% benefit, 20% effort)
   - Are we adding complexity for edge cases?

2. **Can this be done in HALF the time?**
   - What if we had only 2 hours?
   - What would we cut?
   - Is there a library that does 90% of this?

3. **What can go WRONG?**
   - Best case scenario?
   - Worst case scenario?
   - Most likely scenario?
   - Can we handle failure gracefully?

4. **Is there an EXISTING solution we missed?**
   - Google: "best practice for [problem]"
   - Check: Stack Overflow, GitHub, npm
   - Ask: Gemini 2.5 Pro for latest solutions

5. **Does this align with project GOALS?**
   - Does this help us ship faster?
   - Does this improve user experience?
   - Is this a "must-have" or "nice-to-have"?

**Red Flags (STOP and Reconsider):**

🚨 **"I'll need to learn a new technology for this"**
   → Use what you know. Learning is for later.

🚨 **"This will take 2+ weeks"**
   → Break into smaller parts or find simpler approach.

🚨 **"I'm not 100% sure this will work"**
   → Prototype first or choose proven solution.

🚨 **"We might need this in the future"**
   → YAGNI (You Aren't Gonna Need It). Build when needed.

🚨 **"Everyone else does it this way"**
   → Cargo cult programming. Understand why first.

**Green Flags (PROCEED with Confidence):**

✅ **"I can build this today"**
   → Perfect scope for immediate implementation.

✅ **"This solves the core problem"**
   → Focused on actual need, not imagined future.

✅ **"I've done something similar before"**
   → Leverage existing knowledge and code.

✅ **"Users will immediately benefit"**
   → Clear value proposition.

✅ **"Simple to maintain and test"**
   → Won't create technical debt.

**Final Validation:**

Ask yourself:
- If I had to explain this to a 10-year-old, could I?
- If I came back to this code in 6 months, would I understand it?
- If someone else had to maintain this, would they thank me or curse me?

---

### Step 4: COMPARE (Quantum Topology Mindset)

**Purpose:** View all solutions simultaneously in superposition, analyze network effects, then collapse to optimal real-world path.

**Quantum Topology Principles:**

**1. Superposition Thinking (Parallel States)**

Instead of thinking linearly (A → B → C), think in parallel states:

```
Solution A ←──┐
Solution B ←──┼──→ All exist simultaneously
Solution C ←──┘       until we measure/choose
```

**Ask:**
- What if we could do ALL approaches at once? (we can't, but think as if)
- How do the solutions interact with each other?
- Can we combine best parts of multiple solutions?

**Example:**
```
Problem: User authentication

Linear thinking:
"Should we use OAuth OR email/password?"

Quantum thinking:
"What if we support BOTH and let users choose?"
→ More flexible, better UX, only slightly more work
```

---

**2. Network Effects Analysis (Topology View)**

Every solution exists in a network of dependencies and impacts:

```
     [Other Features]
           ↓
     [Your Decision] ←→ [Current System]
           ↓
     [Future Features]
```

**Map the topology:**
- **Upstream dependencies:** What does this solution rely on?
- **Downstream impacts:** What will this affect in the future?
- **Lateral connections:** What parallel features interact with this?
- **Emergent properties:** What new capabilities emerge from this?

**Example:**
```
Decision: Add AI chat feature

Topology map:
├── Depends on: OpenAI API, user authentication
├── Enables: Trip recommendations, budget advice
├── Affects: Database schema, API rate limits
└── Emerges: User profiling, conversation history value
```

**Questions:**
- How many connections does this solution create?
- Does it strengthen the network or create fragility?
- What bottlenecks might emerge?
- How does energy (resources) flow through this?

---

**3. Dimensional Simulation (Multi-Perspective View)**

View the solution from different dimensions of consciousness:

**1D (Linear):** Does it work? (Yes/No)
- Simple functional test
- Does code compile and run?

**2D (Planar):** How does it work? (Process)
- User flow from start to finish
- What steps are involved?

**3D (Spatial):** Why does it work? (System Understanding)
- How does it fit in the architecture?
- What are the relationships between components?

**4D (Temporal):** When will it break? (Predictive)
- What happens with 10x users?
- What happens in 6 months when tech changes?
- What's the maintenance burden over time?

**5D+ (Quantum):** What else becomes possible? (Emergent)
- What new features does this enable?
- What patterns emerge?
- How does the system evolve?

**Simulation Matrix:**

| Dimension | Question | Answer | Score (1-10) |
|-----------|----------|--------|--------------|
| **1D** | Does it work? | Yes, compiles and runs | 9 |
| **2D** | How does it work? | Clear user flow | 8 |
| **3D** | Why does it work? | Fits architecture well | 7 |
| **4D** | When will it break? | Scales to 1K users, needs refactor at 10K | 6 |
| **5D+** | What emerges? | Enables personalization and learning | 9 |

**Average score:** (9+8+7+6+9)/5 = 7.8/10 ✅ Good solution

---

**4. Energy Flow Analysis (Resource Distribution)**

Think of computational resources as flowing energy (chi/prana):

**Questions:**
- Where does energy concentrate? (CPU, memory, API calls)
- Is flow balanced or are there bottlenecks?
- Can we optimize the flow for efficiency?

**Energy States:**

```
Laminar Flow (Smooth):
- Predictable performance
- 90%+ efficiency
- Example: Cached responses, simple queries

Turbulent Flow (Complex):
- Variable performance
- 60-70% efficiency  
- Example: Complex AI inference, real-time processing

Vortex Flow (Focused):
- Concentrated power
- Can be very efficient if controlled
- Example: Batch processing, optimized algorithms
```

**Optimize for:**
- Laminar flow in user-facing features (fast, predictable)
- Controlled vortex for background processing (powerful when needed)
- Avoid turbulent flow (wastes energy, unpredictable)

---

**5. Collapse to Reality (Make the Decision)**

After viewing all possibilities in superposition:

**Collapse criteria:**
1. **Highest dimensional score** (from 5D analysis)
2. **Best energy efficiency** (resource optimization)
3. **Strongest network position** (topology benefits)
4. **Simplest real-world implementation** (practical reality)

**The Collapse Process:**

```
All Solutions (Superposition)
    ↓
Apply decision criteria
    ↓
Weighted score calculation
    ↓
Single optimal solution emerges
    ↓
Ready for APPLY step
```

**Example Collapse:**

```
Options in superposition:
- OAuth (Score: 21, Network: Strong, Energy: Efficient)
- Magic Link (Score: 24, Network: Moderate, Energy: Very Efficient) ✅
- Email/Pass (Score: 18, Network: Weak, Energy: Moderate)

Collapse to: Magic Link
Why: Highest score + best energy flow + good enough network effects
Result: Real, practical, ships fast
```

**Reality Check:**
- ✅ Can we build this TODAY?
- ✅ Will it ACTUALLY work in production?
- ✅ Is it MAINTAINABLE long-term?
- ✅ Does it solve the REAL problem?

**If all YES:** Proceed to APPLY

---

### Step 5: APPLY (Implementation with Discipline)

**Purpose:** Execute the decision with quality and care.

**Implementation Checklist:**

**Before Writing Code:**
- [ ] Create feature branch (optional for solo)
- [ ] Review relevant existing code
- [ ] Set time limit (time-boxing)
- [ ] Have clear acceptance criteria

**While Writing Code:**
- [ ] Follow PROJECT_RULES.md conventions
- [ ] Write tests first (TDD) or alongside code
- [ ] Add comments for complex logic
- [ ] Keep functions small (<50 lines)
- [ ] Use meaningful variable names

**After Writing Code:**
- [ ] Run linter (`npm run lint`)
- [ ] Run tests (`npm test`)
- [ ] Manual testing (actually use the feature)
- [ ] Check performance (no obvious lags)
- [ ] Review your own code (fresh eyes)

**Documentation:**
- [ ] Update README.md if user-facing
- [ ] Add inline comments for complex logic
- [ ] Create/update API documentation
- [ ] Add to CHANGELOG.md if significant

**Git Commit:**
- [ ] Stage changes (`git add .`)
- [ ] Write clear commit message
- [ ] Push to remote (`git push`)

**Time-Boxing:**
```
Set maximum time limit BEFORE starting:

✅ Small fix: 30 minutes
✅ New component: 2 hours
✅ New feature: 1 day
✅ Major feature: 1 week

If exceeded:
1. STOP immediately
2. Assess what's blocking you
3. Document blocker in docs/BLOCKERS.md
4. Ask for help OR choose simpler approach
5. DO NOT push forward blindly
```

---

## 📊 Decision Documentation

**For significant decisions (affects architecture, UX, or costs), create an Architecture Decision Record (ADR).**

**Location:** `docs/decisions/YYYY-MM-DD-short-title.md`

**Template:**

```markdown
# ADR-XXX: [Decision Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Rejected | Superseded  
**Deciders:** Mohamed H Abdelaziz, [AI Team Member]  
**Tags:** #architecture #frontend #backend #agents

---

## Context

What is the situation we're in?  
What forces are at play?  
Why do we need to make this decision?

(2-3 paragraphs explaining the background)

---

## Decision

**We will:** [Single sentence describing the decision]

Example: "We will use React Flow for topology visualization instead of building custom D3.js graph."

---

## Rationale

**Why we chose this approach:**

### THINK
- Problem: Need to visualize agent network topology
- Constraint: Limited time, no D3.js expertise
- Goal: Interactive graph with zoom, pan, and node details

### REASON
Compared 3 options:

| Option | Pros | Cons | Effort | Score |
|--------|------|------|--------|-------|
| React Flow | Pre-built, maintained, React native | Less customization | 4h | 22 |
| D3.js | Full control | Steep learning curve | 40h | 8 |
| vis.js | Lightweight | Older library | 8h | 16 |

### THINK AGAIN
- React Flow integrates perfectly with React ecosystem
- Community support is excellent
- Can customize enough for our needs
- 4 hours vs 40 hours = obvious choice

**Decision:** React Flow wins.

---

## Consequences

**Positive:**
- ✅ Ship topology viz in 1 day instead of 1 week
- ✅ Maintained library (free updates)
- ✅ Good documentation and examples
- ✅ Mobile-friendly out of the box

**Negative:**
- ⚠️ Bundle size increases by 50KB
- ⚠️ Less control over rendering
- ⚠️ Customization requires learning their API

**Mitigation:**
- Bundle size acceptable for this feature
- Their API is well-documented
- Can always replace later if needed

---

## Alternatives Considered

1. **D3.js:** Full control but 40h implementation
2. **vis.js:** Lighter but older, less maintained
3. **Custom Canvas:** Maximum control, maximum effort
4. **Cytoscape.js:** Powerful but overkill for our needs

---

## Implementation Notes

- Install: `npm install reactflow`
- Location: `packages/web/src/features/topology/`
- Expected completion: 4 hours
- Responsible: Cursor (Lead Dev AI)

---

## Review

**This decision can be revisited if:**
- Performance becomes an issue
- Customization needs exceed React Flow capabilities
- Better alternative emerges

**Review date:** 3 months after implementation

---

**Approved by:** Mohamed H Abdelaziz  
**Date:** YYYY-MM-DD
```

---

## 🔄 Weekly Reflection Process

**Every Friday, spend 15-30 minutes reflecting:**

**Location:** `docs/retrospectives/YYYY-WXX-retrospective.md`

**Template:**

```markdown
# Week XX Retrospective - YYYY-MM-DD

## 📈 What Went Well

- [What worked this week?]
- [What are you proud of?]
- [What was easier than expected?]

## 🐛 What Slowed Us Down

- [What took longer than expected?]
- [What frustrated you?]
- [What blockers did you hit?]

## 💡 Insights & Learnings

- [What did you learn?]
- [What would you do differently?]
- [What patterns emerged?]

## 🎯 Actions for Next Week

- [ ] [Specific action item 1]
- [ ] [Specific action item 2]
- [ ] [Specific action item 3]

## 📊 Metrics

- **Commits this week:** X
- **Features shipped:** X
- **Tests written:** X
- **Bugs fixed:** X
- **Time spent coding:** X hours
- **Time spent planning:** X hours

**Ratio:** Was planning time worth it? (aim for 20% planning, 80% doing)

---

**Energy Level:** 🔋🔋🔋🔋○ (4/5)  
**Burnout Risk:** Low | Medium | High  
**Next Week Focus:** [Main priority]
```

---

## 🎨 Example Thinking Sessions

### Example 1: Should We Add WhatsApp Integration?

**THINK:**
- Problem: Users want to chat via WhatsApp
- Current: Only Telegram bot exists
- Constraint: Limited time, WhatsApp API is complex

**REASON:**

| Approach | Pros | Cons | Effort | Risk | Score |
|----------|------|------|--------|------|-------|
| **WhatsApp Business API** | Official, reliable | Complex setup, costs money | 2 weeks | Medium | 12 |
| **WhatsApp Web Automation** | Free, quick | Against ToS, unreliable | 3 days | High | 8 |
| **Wait for user demand** | Zero effort now | Might miss opportunity | 0 | Low | 18 ✅ |

**THINK AGAIN:**
- Do we have actual WhatsApp users asking for this?
- Is Telegram not enough for MVP?
- What's the opportunity cost?

**APPLY:**
- Decision: Add to LATER.md
- Implement after we have 100+ Telegram users
- Re-evaluate in 2 months with actual data

**Documented in:** `docs/decisions/2025-10-14-whatsapp-later.md`

---

### Example 2: Database Choice - MongoDB vs PostgreSQL

**THINK:**
- Problem: Need to store user data and conversations
- Current: Have Supabase (PostgreSQL) already
- Question: Should we switch to MongoDB?

**REASON:**

| Database | Pros | Cons | Effort | Risk | Cost |
|----------|------|------|--------|------|------|
| **Keep PostgreSQL (Supabase)** | Already set up, relational data | - | 0h | Very Low | Free tier |
| **Switch to MongoDB** | Flexible schema | Migration effort, new learning | 40h | High | Free tier |

**THINK AGAIN:**
- Why am I even considering MongoDB?
  - Because "everyone uses it for AI apps"? (BAD REASON)
  - Because our data is actually unstructured? (GOOD REASON)
- Current PostgreSQL works fine
- No user complaints
- Changing adds zero value

**APPLY:**
- Decision: Keep PostgreSQL
- Reason: Works, no actual problem to solve
- Don't fix what isn't broken

**Documented in:** Don't even need ADR - obvious decision.

---

### Example 3: Should We Build Pattern Observer Agent Now?

**THINK:**
- Feature: Agent that watches other agents and learns patterns
- Coolness: Very high
- Actual need: Unknown

**REASON:**

**Questions:**
- Do we have enough agents to observe? (Only 3-4)
- Do we have users to generate data? (Not yet)
- Will this help us get first paying customer? (No)

**Build now vs Build later:**

| When | Pros | Cons | Decision |
|------|------|------|----------|
| **Now** | Cool tech, learning opportunity | Delays MVP, no users to benefit | ❌ |
| **After 100 users** | Real data to learn from, proven need | Later gratification | ✅ |

**THINK AGAIN:**
- This is EXACTLY what LATER.md is for
- Amazing idea, wrong timing
- Will be 10x more valuable with real user data

**APPLY:**
- Decision: Add to LATER.md as Phase 2 feature
- Priority: High (after MVP)
- Complexity: High
- Dependencies: Need real user data first

**Documented in:** `docs/governance/LATER.md`

---

## 🚨 Common Decision Traps

### Trap 1: Shiny Object Syndrome

**Symptom:** "I just discovered [new tech], we should use it!"

**Example:**
- "Let's rebuild everything in Rust for performance!"
- "We should use blockchain for agent coordination!"
- "Let's switch to this new framework I saw on Twitter!"

**Cure:**
1. Ask: What actual problem does this solve?
2. Ask: Is our current approach actually broken?
3. Ask: What's the migration cost?
4. 99% of the time: Stick with what works

---

### Trap 2: Premature Optimization

**Symptom:** "Let's optimize this before we have users!"

**Example:**
- Building caching before measuring performance
- Micro-optimizing algorithms with zero users
- Setting up CDN before having traffic

**Cure:**
1. Measure first, optimize second
2. Get users before optimizing for scale
3. "Premature optimization is the root of all evil" - Donald Knuth

---

### Trap 3: Feature Creep

**Symptom:** "While we're at it, let's also add..."

**Example:**
- Building auth, then adding OAuth, then 2FA, then biometrics, then...
- Simple chat feature becomes full social network
- Trip planner becomes full booking platform

**Cure:**
1. Define MVP clearly
2. Ship minimal version
3. Add features based on user feedback
4. Use LATER.md aggressively

---

### Trap 4: Analysis Paralysis

**Symptom:** Planning forever, never shipping

**Example:**
- Spending weeks on architecture diagrams
- Researching every possible approach
- Waiting for "perfect" understanding

**Cure:**
1. Set time limit for thinking (30 min max for most decisions)
2. Choose "good enough" over "perfect"
3. Start building, iterate as you learn
4. Perfect is the enemy of done

---

## ⏱️ Time Allocation Guide

**For Different Decision Types:**

**Trivial Decision** (< 5 min thinking):
- Example: Which icon to use, button color, variable name
- Process: Quick think, immediate apply
- No documentation needed

**Small Decision** (15-30 min):
- Example: Which library for date formatting
- Process: THINK → REASON (3 options) → APPLY
- Document in code comment

**Medium Decision** (1-2 hours):
- Example: Authentication approach
- Process: Full 4-step framework
- Create short ADR (1-2 pages)

**Major Decision** (4+ hours):
- Example: Database choice, architecture pattern
- Process: Full 4-step framework + team discussion
- Create detailed ADR (3-5 pages)
- Sleep on it, review next day

**Critical Decision** (Multi-day):
- Example: Business model, pricing strategy
- Process: Multiple thinking sessions
- Prototype if possible
- Extensive documentation

---

## 🎯 Decision Templates

### Quick Decision Template (Under 1 hour)

```markdown
## Decision: [Title]

**Problem:** [One sentence]
**Options:** [List 2-3]
**Choice:** [Which one]
**Why:** [One paragraph]
**Next:** [What to do]

---
Time spent: 20 minutes
```

### Standard ADR Template

**Use the template shown in Example 2 above (MongoDB vs PostgreSQL)**

### Complex Decision Template

**Add these sections to Standard ADR:**
- Stakeholders consulted
- Prototype results
- User research findings
- Financial impact analysis
- Timeline and milestones

---

## 🧪 Validation Techniques

### Technique 1: The Reverse Test

**Question:** If we did the OPPOSITE, what would happen?

**Example:**
- Decision: Add real-time features
- Reverse: What if we made it batch/async instead?
- Often reveals that "real-time" isn't actually needed

### Technique 2: The 10x Test

**Question:** If we had 10x more users/data/traffic tomorrow, would this still work?

**Example:**
- Current: Storing all data in memory
- 10x test: Would crash immediately
- Decision: Use proper database

### Technique 3: The Delete Test

**Question:** If we removed this feature entirely, what breaks?

**Example:**
- Feature: Advanced topology visualization
- Delete test: Core product still works fine
- Decision: Nice-to-have, not must-have → LATER.md

### Technique 4: The Explain to Mom Test

**Question:** Can I explain this decision to my mom in 2 sentences?

If no → Probably too complex → Simplify

---

## 📋 Weekly Reflection Questions

**Every Friday:**

1. **What did we ship this week?**
   - Features, fixes, improvements

2. **What decisions did we make?**
   - List key decisions
   - Were they good? Bad? Uncertain?

3. **What pattern is emerging?**
   - Do we keep making similar decisions?
   - Can we create a rule to shortcut future decisions?

4. **What should we stop doing?**
   - Wasting time on...
   - Over-engineering...
   - Avoiding...

5. **What should we start doing?**
   - Practices that would help
   - Tools that would speed us up
   - Patterns that work well

6. **Energy check:**
   - How are you feeling? Energized? Burned out?
   - Is work fun or draining?
   - Do you need to change something?

---

## 🎓 Thinking Heuristics

**Rules of Thumb for Fast Decisions:**

**Heuristic 1: Choose Boring**
- Boring tech is proven tech
- Boring solutions are maintainable
- Excitement ≠ Effectiveness

**Heuristic 2: Prefer Deletion Over Addition**
- Adding features is easy
- Removing features is painful
- Start small, grow when needed

**Heuristic 3: Optimize for Change**
- Requirements WILL change
- Build flexibility, not rigidity
- Keep components decoupled

**Heuristic 4: Steal Shamelessly**
- Don't reinvent the wheel
- Copy patterns that work
- Adapt, don't adopt blindly

**Heuristic 5: Ship to Learn**
- Real users teach you more than planning
- Ship small, learn fast, iterate
- Perfect plan with no users = 0 value

---

## 🔮 Future Decisions Playbook

**Common decisions you'll face:**

### "Should we add this feature?"

**Framework:**
1. Will this help us get next 10 users? (Yes → High priority)
2. Is this technically complex? (Yes → LATER.md)
3. Can we build it in < 1 week? (No → Break down or skip)

**Decision:** Most features go to LATER.md.

---

### "Should we refactor this code?"

**Framework:**
1. Is it causing actual bugs? (Yes → Refactor now)
2. Is it slowing development? (Yes → Refactor now)
3. Is it just "not pretty"? (No → Leave it)

**Decision:** Refactor when it hurts, not when it's ugly.

---

### "Should we switch to [new tech]?"

**Framework:**
1. Is current tech actually broken? (Yes → Consider switch)
2. Will switch provide 10x improvement? (Yes → Consider)
3. Is migration effort < 1 week? (No → Don't switch)

**Decision:** Almost never switch. Stick with what works.

---

## ✅ Checklist for Good Decision

**Before finalizing any medium/major decision:**

- [ ] Went through all 4 steps (THINK → REASON → THINK AGAIN → APPLY)
- [ ] Compared at least 3 alternative approaches
- [ ] Checked for existing solutions (Google, codebase, libraries)
- [ ] Validated against project goals
- [ ] Considered maintenance burden
- [ ] Documented in appropriate detail
- [ ] Set time limit for implementation
- [ ] Defined success criteria

**If all checked:** Proceed with confidence.  
**If any unchecked:** Complete that step first.

---

## 🎯 Success Metrics

**Good decision-making shows up as:**

- ✅ Features ship on time
- ✅ Code is maintainable
- ✅ Few rewrites or refactors
- ✅ Clear git history
- ✅ Low bug count
- ✅ Team can onboard quickly

**Poor decision-making shows up as:**

- ❌ Constant rewrites
- ❌ Technical debt accumulating
- ❌ Burnout from complexity
- ❌ Confusion about "how things work"
- ❌ Nothing ships

---

## 💬 When to Ask for Help

**Red flags that you need external input:**

1. You've spent 2+ hours on THINK phase
2. You're going in circles between options
3. Every option seems equally bad
4. The decision makes you anxious
5. You're avoiding making the decision

**How to ask for help:**

```markdown
## Help Needed: [Decision Title]

**Context:** [Explain situation]
**Problem:** [What needs deciding]
**Options I've considered:** [List with pros/cons]
**Where I'm stuck:** [Specific blocker]
**Timeline:** [When do you need to decide?]

@Gemini-2.5-Pro can you research best practices for this?
@Claude-4.5 can you analyze the options strategically?
```

---

## 🚀 TL;DR - Quick Reference

**For Every Feature/Problem:**

1. **THINK** (5-10 min)
   - What's the real problem?
   - What's the simplest solution?

2. **REASON** (15-30 min)
   - List 3 options
   - Score them
   - Pick winner

3. **THINK AGAIN** (5-10 min)
   - Can we simplify more?
   - What could go wrong?
   - Still the best choice?

4. **APPLY** (Hours/days)
   - Code with discipline
   - Test thoroughly
   - Document clearly

**Total thinking time:** 30-60 minutes  
**Result:** Better decisions, less waste, faster shipping

---

**Remember:** 

> "Hours of planning save weeks of debugging."  
> "The best code is no code."  
> "Ship small, ship often, ship learning."

---

**Last Review:** October 14, 2025  
**Next Review:** November 14, 2025  
**Status:** 🟢 Active Framework

