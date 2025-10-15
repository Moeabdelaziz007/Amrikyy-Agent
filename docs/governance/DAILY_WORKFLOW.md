# DAILY WORKFLOW - Amrikyy Platform Productivity System

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Purpose:** Structured daily routine for maximum productivity

---

## 🎯 Philosophy

**"Organized days lead to shipped products."**

No wasted time wondering "what should I do next?" Every day has clear structure, focus time, and progress tracking.

---

## ⏰ DAILY ROUTINE

### 🌅 Morning Routine (30 minutes)

**Time:** 9:00 AM - 9:30 AM

**1. System Check (5 min)**

```bash
cd /Users/Shared/amrikyy-travel-agent

# Pull latest
git pull origin main

# Check what changed
git log --oneline -5

# Check status
git status
```

**2. Review Progress (10 min)**

Open: `docs/TASK_BOARD.md`

```markdown
## Yesterday's Accomplishments
- [x] Created governance documents
- [x] Designed agent identity system
- [ ] Started iOS app (in progress)

## Blockers Encountered
- None (or list any issues)

## Learnings
- [What you learned yesterday]
```

**3. Plan Today (15 min)**

**Update TASK_BOARD.md with today's plan:**

```markdown
## Today's Priorities (Max 3)

### 🎯 Priority 1: [Most important task]
- Agent assigned: [Which AI]
- Estimated time: [X hours]
- Success criteria: [How you know it's done]

### 🎯 Priority 2: [Second task]
- Agent assigned: [Which AI]
- Estimated time: [X hours]

### 🎯 Priority 3: [Third task]
- Agent assigned: [Which AI]
- Estimated time: [X hours]
```

**Questions to ask yourself:**
- What will have biggest impact?
- What can ship today?
- What's blocking other work?
- What will make users happy?

---

### 💪 Work Session 1 (2 hours)

**Time:** 9:30 AM - 11:30 AM

**Deep Focus - No Distractions**

**For each task:**

```
1. Open Cursor
2. Decide which AI agent to use
3. Craft clear prompt
4. Review output
5. Integrate or revise
6. Test manually
7. Commit

Repeat
```

**Example Session:**

```
9:30 - Start Priority 1 (Agent Gallery Page)
9:35 - Prompt Kombai to create gallery layout
9:45 - Review component code
9:50 - Cursor integrates into app
10:00 - Test in browser
10:10 - Prompt GPT-4 for agent descriptions
10:20 - Add descriptions to gallery
10:30 - Test responsive design
10:40 - Fix mobile layout issue
10:50 - Commit: "feat(agents): add agent gallery page"
11:00 - Start polish and animations
11:20 - Final test
11:25 - Commit: "style(agents): add hover animations to gallery"
11:30 - BREAK
```

---

### ☕ Break (30 minutes)

**Time:** 11:30 AM - 12:00 PM

- Step away from computer
- Stretch, walk, eat
- Don't check code or emails
- Let brain rest

**Why breaks matter:**
- Prevents burnout
- Improves focus when you return
- Brain processes solutions in background

---

### 💪 Work Session 2 (2 hours)

**Time:** 12:00 PM - 2:00 PM

**Continue with Priority 2 or finish Priority 1**

Same process as Session 1.

---

### 🍽️ Lunch Break (1 hour)

**Time:** 2:00 PM - 3:00 PM

- Proper meal away from desk
- No coding
- Optional: Review what you built (on phone, casual)

---

### 💪 Work Session 3 (2 hours)

**Time:** 3:00 PM - 5:00 PM

**Focus on Priority 3 or polish work from earlier**

**Good tasks for afternoon:**
- Documentation updates
- Code reviews
- Testing
- Polish and refinements
- Less intense cognitive load

---

### 🌆 Evening Wrap-Up (30 minutes)

**Time:** 5:00 PM - 5:30 PM

**1. Commit All Progress (5 min)**

```bash
# Even if incomplete, commit
git add .
git commit -m "chore: daily checkpoint - [summary of work]"
git push origin main
```

**2. Update TASK_BOARD.md (10 min)**

```markdown
## Today's Accomplishments
- [x] Priority 1: Agent gallery page complete
- [x] Priority 2: Agent identity files created
- [ ] Priority 3: Started but not finished (will continue tomorrow)

## Tomorrow's Plan
1. Finish Priority 3 from today
2. [Next task]
3. [Next task]
```

**3. Document Decisions (10 min)**

If you made any significant decisions:

```bash
# Create decision record
touch docs/decisions/2025-10-14-agent-gallery-layout.md

# Document what you decided and why
```

**4. Plan Tomorrow (5 min)**

Write down tomorrow's top 3 priorities in TASK_BOARD.md

**Then STOP CODING.** Rest. Tomorrow is a new day.

---

## 📊 WEEKLY ROUTINE

### Friday Afternoon (30 minutes)

**Time:** Friday 4:30 PM - 5:00 PM

**Weekly Retrospective:**

**Create:** `docs/retrospectives/2025-W[XX]-retrospective.md`

```markdown
# Week [XX] Retrospective - Oct 14-18, 2025

## 📈 What Went Well

- [Success 1]
- [Success 2]
- [Success 3]

## 🐛 What Slowed Us Down

- [Challenge 1]
- [Challenge 2]

## 💡 Insights & Learnings

- [Learning 1]
- [Learning 2]

## 🎯 Actions for Next Week

- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

## 📊 Metrics

- Commits: [X]
- Features shipped: [X]
- Tests written: [X]
- Hours coded: ~[X]

## 🔋 Energy Check

Energy Level: 🔋🔋🔋🔋○ (4/5)
Burnout Risk: Low | Medium | High
Next Week Focus: [Main priority]
```

**Review LATER.md:**
- Any features ready to promote?
- Any priorities changed?
- Update estimates based on learnings

---

## 🎯 MONTHLY ROUTINE

### First Monday of Month (1 hour)

**Big Picture Review:**

**1. Review Project Manifest (15 min)**
- Are we on track for goals?
- Do goals need adjustment?
- Are metrics improving?

**2. Review LATER.md (20 min)**
- Promote features with met dependencies
- Archive low-priority items (6+ months)
- Update complexity estimates

**3. Audit Dependencies (10 min)**

```bash
npm audit
npm outdated

# Update if needed
npm update
```

**4. Financial Review (10 min)**
- Hosting costs this month?
- AI API costs?
- Any cost optimizations needed?
- Update budget projections

**5. Plan Next Month (5 min)**
- Set main goal for the month
- Identify risks
- Allocate time for each major feature

---

## 📝 TASK MANAGEMENT

### TASK_BOARD.md Structure

**Location:** `docs/TASK_BOARD.md`

```markdown
# Amrikyy Platform - Task Board

**Week:** [XX] (Oct 14-18, 2025)  
**Sprint Goal:** [Main focus this week]

---

## 🎯 This Week's Goals

- [ ] Goal 1: [Specific, measurable]
- [ ] Goal 2: [Specific, measurable]
- [ ] Goal 3: [Specific, measurable]

---

## 📅 Monday (Oct 14)

### Priorities
1. ✅ Create governance documents
2. ⏳ Design agent identity system
3. ⏸️ Not started yet

### Accomplished
- Created 9 governance documents
- Set up folder structure
- Defined 13 AI team members

### Tomorrow
- Integrate AIX format
- Create agent avatars
- Build ID card component

---

## 📅 Tuesday (Oct 15)

[Same structure]

---

## 📅 Wednesday (Oct 16)

[Same structure]

---

## Backlog (Not This Week)

- [ ] Item 1
- [ ] Item 2
```

---

## ⏱️ TIME TRACKING (Optional)

**Simple approach:**

```markdown
## Time Log - [Date]

9:30-11:30: Agent gallery page (2h)
12:00-2:00: Identity system docs (2h)
3:00-5:00: iOS app with Rork (2h)

**Total:** 6 hours productive work
```

**Why track:**
- See where time actually goes
- Identify time sinks
- Improve estimation
- Celebrate productivity

**Don't obsess over it** - just rough tracking helps.

---

## 🧠 FOCUS TECHNIQUES

### Pomodoro Technique

```
25 min: Deep focus work
5 min: Short break
25 min: Deep focus work
5 min: Short break
25 min: Deep focus work
5 min: Short break
25 min: Deep focus work
15 min: Long break
```

**Tools:**
- Browser timer: pomofocus.io
- Or just phone timer

### Single-Tasking

- ❌ Don't: Work on web AND iOS AND docs simultaneously
- ✅ Do: Finish web feature THEN move to iOS

**Context switching kills productivity.**

### Time Boxing

```
Set limit BEFORE starting:
- Small task: 30 min
- Medium task: 2 hours
- Large task: 1 day

If exceeded → STOP, reassess, simplify
```

---

## 🎊 CELEBRATING WINS

**Daily Wins:**
- Commit message with "feat" or "fix"
- Feature working end-to-end
- User feedback (even if just testing)

**Weekly Wins:**
- Feature shipped to production
- User milestone (10th user, 1st paying customer)
- All tests green for entire week

**Monthly Wins:**
- Product milestone (MVP launch, 100 users, etc.)
- Revenue milestone
- Major feature completed

**Celebrate!**
- Tweet about it
- Share screenshot
- Tell a friend
- Write blog post
- Take evening off

**You're building something amazing - acknowledge progress!**

---

## 🚫 WHAT TO AVOID

### Anti-Patterns

**1. No-Plan Days**
- Waking up with no idea what to build
- Jumping between random tasks
- No accomplishments by end of day

**Fix:** Morning planning routine (mandatory)

**2. Perfectionism Paralysis**
- Spending all day on small detail
- Never shipping because "not perfect"
- Endless refactoring

**Fix:** Time-box everything, ship imperfect

**3. Tutorial Hell**
- Watching tutorials instead of building
- Reading docs without applying
- Learning everything before doing anything

**Fix:** Learn just enough, build, learn more when blocked

**4. Scope Creep**
- "While I'm at it, let me add..."
- Simple feature becomes complex
- Never finishing anything

**Fix:** LATER.md for all "nice to have"

**5. No Breaks**
- Coding for 8 hours straight
- Burnt out by evening
- Next day starts exhausted

**Fix:** Mandatory breaks every 2 hours

---

## 📋 WEEKLY TASKS

### Monday
- [ ] Plan week's goals
- [ ] Review TASK_BOARD.md
- [ ] Assign AI agents to tasks

### Wednesday (Midweek Check)
- [ ] Review progress (50% done?)
- [ ] Adjust priorities if needed
- [ ] Check costs (Railway, OpenAI)

### Friday
- [ ] Deploy if ready
- [ ] Write retrospective
- [ ] Update CHANGELOG.md
- [ ] Plan next week
- [ ] Celebrate wins! 🎉

---

## 🔋 ENERGY MANAGEMENT

### Recognize Burnout Signs

**🚨 Warning Signs:**
- Don't want to open Cursor
- Every task feels overwhelming
- Making careless mistakes
- Irritable or frustrated
- Not enjoying the work

**If 3+ signs:** TAKE A DAY OFF. Seriously.

### Sustainable Pace

**Sustainable:**
- 4-6 hours productive coding per day
- 5 days per week
- Regular breaks
- Weekends mostly off
- Consistent for months

**Unsustainable:**
- 12+ hours per day
- 7 days per week
- No breaks
- Constant stress
- Burns out in weeks

**Marathon, not sprint.** Pace yourself.

---

## 🎯 WEEKLY GOALS (Realistic)

**Week 1:**
- Create all governance documents ✅
- Set up workspace ✅
- Define agent identities ✅

**Week 2:**
- Integrate AIX format
- Create 3 agent avatars
- Build ID card component
- Start iOS app with Rork

**Week 3:**
- Build agent gallery
- Implement hologram workflow
- Polish landing page

**Week 4:**
- Testing and bug fixes
- Deploy MVP
- Get first users

**One feature per week = Sustainable progress**

---

## 📝 QUICK REFERENCE

**Start day:**
```bash
git pull && npm run dev
```

**During day:**
```bash
git add . && git commit -m "type: message" && git push
```

**End day:**
```bash
git add . && git commit -m "chore: daily checkpoint" && git push
# Update TASK_BOARD.md
# Plan tomorrow
```

**Weekly:**
- Monday: Plan week
- Friday: Retro + deploy

---

**Remember: Consistency beats intensity. Show up every day, make progress, ship regularly.** 🚀

**Last Updated:** October 14, 2025  
**Status:** 🟢 Active Workflow Guide

