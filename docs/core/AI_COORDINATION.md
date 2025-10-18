# 🤝 AI Agent Coordination System

## 👥 Active Agents

- **Ona (Claude)** - Primary AI assistant
- **Cursor (Claude)** - Code editor AI assistant

---

## 📋 Communication Protocol

### 1. Task Assignment Board

#### 🟢 Available Tasks
- [ ] Fix NPM vulnerabilities
- [ ] Create environment documentation
- [ ] Add unit tests for Mini-Aladdin
- [ ] Build frontend dashboard
- [ ] Integrate real exchange APIs

#### 🟡 In Progress
| Task | Agent | Started | ETA |
|------|-------|---------|-----|
| Implementation plans | Ona | 06:33 | Done ✅ |
| - | - | - | - |

#### ✅ Completed
| Task | Agent | Completed |
|------|-------|-----------|
| AIX Security Auditor fixes | Ona | 2025-10-13 |
| Mini-Aladdin code review | Ona | 2025-10-13 |
| Implementation plans | Ona | 2025-10-13 |

---

## 🔄 Git Workflow

### Before Starting Work:
```bash
# 1. Pull latest changes
git pull origin pr-7

# 2. Announce in this file what you're working on
# Edit AI_COORDINATION.md → Add to "In Progress"

# 3. Commit the announcement
git add AI_COORDINATION.md
git commit -m "chore: [Agent Name] starting work on [Task]"
git push origin pr-7
```

### While Working:
```bash
# Commit frequently with clear messages
git add [files]
git commit -m "[Agent Name]: [what you did]"

# Don't push yet - wait until task complete
```

### After Completing Task:
```bash
# 1. Pull latest (in case other agent pushed)
git pull --rebase origin pr-7

# 2. Update this file - move task to "Completed"
# Edit AI_COORDINATION.md

# 3. Push everything
git add -A
git commit -m "[Agent Name]: Completed [Task]"
git push origin pr-7
```

---

## 📝 Status Updates

### Format:
```markdown
**[Timestamp] - [Agent Name]:**
- Working on: [Task description]
- Files modified: [list]
- ETA: [time]
- Blockers: [any issues]
```

### Current Status:

**2025-10-13 06:52 - Ona:**
- Working on: Creating coordination system
- Files modified: AI_COORDINATION.md, EXPERT_IMPLEMENTATION_PLAN.md, MICRO_STEPS_PLAN.md
- ETA: Done ✅
- Blockers: None

**2025-10-13 [Time] - Cursor:**
- Working on: [Waiting for assignment]
- Files modified: []
- ETA: -
- Blockers: None

---

## 🎯 Task Assignment Strategy

### Ona (Primary AI) - Best for:
- Architecture decisions
- Complex problem solving
- Multi-file refactoring
- Documentation writing
- Code reviews
- Planning and strategy

### Cursor (Code Editor AI) - Best for:
- Single file edits
- Quick fixes
- Code generation
- Syntax corrections
- Implementing specific functions
- Testing individual components

---

## 🚨 Conflict Resolution

### If Git Conflict Occurs:

**Option 1: Rebase (Preferred)**
```bash
git pull --rebase origin pr-7
# Resolve conflicts
git add [resolved files]
git rebase --continue
git push origin pr-7
```

**Option 2: Merge**
```bash
git pull origin pr-7
# Resolve conflicts
git add [resolved files]
git commit -m "merge: Resolve conflicts between [Agent1] and [Agent2]"
git push origin pr-7
```

**Option 3: Ask Human**
```markdown
@User: We have a conflict in [file]. 
- Ona changed: [description]
- Cursor changed: [description]
Which should we keep?
```

---

## 💬 Inter-Agent Messages

### Leave messages for each other here:

**From Ona to Cursor:**
> Hey Cursor! I've created two implementation plans:
> - EXPERT_IMPLEMENTATION_PLAN.md (full roadmap)
> - MICRO_STEPS_PLAN.md (broken into small tasks)
> 
> Pick any task from MICRO_STEPS_PLAN.md and mark it "In Progress" here.
> I'll work on different tasks to avoid conflicts.
> 
> Suggested for you:
> - Step 1.1: Fix NPM vulnerabilities (15 min)
> - Step 2.1: Fix Mini-Aladdin syntax error (5 min)
> - Step 2.2: Add input validation (30 min)

**From Cursor to Ona:**
> [Your message here]

---

## 📊 Work Distribution

### Current Sprint (Today):

**Ona's Tasks:**
- [x] Create coordination system
- [x] Write implementation plans
- [ ] Review Cursor's work
- [ ] Handle complex refactoring

**Cursor's Tasks:**
- [ ] [Pick from MICRO_STEPS_PLAN.md]
- [ ] [Pick from MICRO_STEPS_PLAN.md]
- [ ] [Pick from MICRO_STEPS_PLAN.md]

---

## 🎮 Collaboration Examples

### Example 1: Parallel Work
```
Ona: Working on backend routes (backend/src/routes/aladdin.js)
Cursor: Working on frontend page (frontend/src/pages/Aladdin.tsx)
Result: No conflicts ✅
```

### Example 2: Sequential Work
```
Ona: Creates function skeleton in mini-aladdin.js
Cursor: Implements the function body
Result: Clean handoff ✅
```

### Example 3: Review & Iterate
```
Cursor: Implements feature
Ona: Reviews code, suggests improvements
Cursor: Applies improvements
Result: High quality code ✅
```

---

## 🔧 Quick Commands

### Check what other agent is doing:
```bash
git log --oneline -5  # See recent commits
git diff origin/pr-7  # See unpushed changes
cat AI_COORDINATION.md  # Read status updates
```

### Announce you're starting work:
```bash
echo "**$(date +%Y-%m-%d\ %H:%M) - [Your Name]:**
- Working on: [Task]
- Files: [list]
- ETA: [time]" >> AI_COORDINATION.md

git add AI_COORDINATION.md
git commit -m "chore: [Your Name] starting [Task]"
git push origin pr-7
```

---

## 🎯 Next Steps

1. **Cursor**: Pick a task from MICRO_STEPS_PLAN.md
2. **Update this file**: Add task to "In Progress"
3. **Commit & Push**: Let Ona know you're working on it
4. **Do the work**: Follow the micro-steps
5. **Update this file**: Move task to "Completed"
6. **Commit & Push**: Share your work

---

## 📞 Emergency Contact

If something goes wrong:
1. **Stop working immediately**
2. **Don't push**
3. **Update this file** with the issue
4. **Ask the human** for guidance

---

**Last Updated:** 2025-10-13 06:52 by Ona
**Status:** ✅ Coordination system active
**Next:** Waiting for Cursor to pick first task
