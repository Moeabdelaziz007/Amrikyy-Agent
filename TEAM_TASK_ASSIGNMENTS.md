# 👥 Team Task Assignments - AIX Integration Test

**Date:** 2025-10-13  
**Project:** AIX Format Integration Pilot  
**Team:** Ona (Manager), Cursor (Developer), Gemini 2.5 (QA)

---

## 🎯 MISSION

Test AIX format integration with real team collaboration:
- **Cursor:** Implement code changes
- **Gemini 2.5:** Validate and audit
- **Ona:** Coordinate and report

---

## 📋 CURSOR - YOUR TASKS

### ✅ Task 1: Create AIX Loader (30 min)
**File:** `backend/src/utils/aix-loader.js`

**What to do:**
```javascript
// Create utility to load and parse AIX files
// Functions needed:
// - load(aixFilePath) - Load and parse AIX file
// - getSkill(aixDef, skillName) - Get skill by name
// - isOperationAllowed(aixDef, operation) - Check security
// - getRateLimit(aixDef, endpoint) - Get rate limit
```

**Dependencies:**
```bash
cd backend
npm install js-yaml
```

**Test:**
```bash
node -e "const AIXLoader = require('./src/utils/aix-loader'); console.log(AIXLoader.load('agents/mini-aladdin.aix'));"
```

---

### ✅ Task 2: Update Mini-Aladdin (1 hour)
**File:** `backend/src/agents/mini-aladdin.js`

**What to do:**
1. Import AIXLoader at top
2. Load AIX definition
3. Use AIX persona, skills, security
4. Add `executeSkill()` method
5. Add `getAgentInfo()` method
6. Keep all existing methods working

**Test:**
```bash
node -e "const {MiniAladdin} = require('./src/agents/mini-aladdin'); const a = new MiniAladdin(); console.log(a.getAgentInfo());"
```

---

### ✅ Task 3: Update Routes (30 min)
**File:** `backend/src/routes/aladdin.js`

**What to do:**
1. Load AIX definition
2. Use AIX rate limits in limiters
3. Add `/info` endpoint
4. Test all endpoints still work

**Test:**
```bash
curl http://localhost:3000/api/aladdin/info
```

---

### ✅ Task 4: Create Integration Test (30 min)
**File:** `backend/test-aix-integration.js`

**What to do:**
1. Test AIX loading
2. Test agent initialization
3. Test agent info retrieval
4. Test security checks
5. Run and verify all pass

**Run:**
```bash
cd backend
node test-aix-integration.js
```

---

## 📋 GEMINI 2.5 - YOUR TASKS

### ✅ Task 1: Validate AIX File (15 min)
**File:** `agents/mini-aladdin.aix`

**What to check:**
- [ ] Structure is valid (meta, persona, skills, memory, security)
- [ ] UUID is properly formatted
- [ ] Skills array is correct
- [ ] Security capabilities are defined
- [ ] Rate limits are set
- [ ] Compliance standards listed
- [ ] No sensitive data exposed

**Output:** List of issues found (if any)

---

### ✅ Task 2: Security Audit (15 min)
**What to verify:**
- [ ] `allowed_operations` are reasonable
- [ ] `restricted_operations` include dangerous ops
- [ ] Rate limits prevent abuse
- [ ] Compliance standards appropriate
- [ ] No PII in AIX file
- [ ] Audit logging enabled

**Output:** Security assessment report

---

### ✅ Task 3: Code Review (20 min)
**Files to review:**
- `backend/src/utils/aix-loader.js`
- `backend/src/agents/mini-aladdin.js` (changes only)
- `backend/src/routes/aladdin.js` (changes only)

**What to check:**
- [ ] Code loads AIX correctly
- [ ] Error handling present
- [ ] Security checks enforced
- [ ] No hardcoded values (use AIX)
- [ ] Tests are comprehensive

**Output:** Code review findings

---

### ✅ Task 4: Generate QA Report (10 min)
**File:** `QA_REPORT_AIX.md`

**Include:**
1. AIX validation results
2. Security audit findings
3. Code review summary
4. Issues found (with severity)
5. Recommendations
6. Overall assessment (PASS/FAIL)
7. Deployment recommendation

---

## 📋 ONA - MY TASKS

### ✅ Task 1: Monitor Progress
- Track Cursor's implementation
- Track Gemini's validation
- Answer questions
- Unblock issues

### ✅ Task 2: Test Integration
- Run all tests
- Verify functionality
- Check endpoints
- Validate results

### ✅ Task 3: Compile Results
- Gather Cursor's code
- Gather Gemini's reports
- Create summary
- Document learnings

### ✅ Task 4: Report to Boss
- Show working demo
- Present benefits
- Highlight issues (if any)
- Get approval for next steps

---

## 🎯 SUCCESS CRITERIA

**We succeed when ALL of these are true:**

### Code (Cursor):
- [x] AIX loader created and working
- [x] Mini-Aladdin loads from AIX
- [x] Routes use AIX configuration
- [x] All tests pass
- [x] No breaking changes

### Quality (Gemini):
- [x] AIX file validated
- [x] Security audit passed
- [x] Code review completed
- [x] QA report generated
- [x] Overall status: PASS

### Integration (Ona):
- [x] All endpoints working
- [x] Agent info accessible
- [x] Rate limits enforced
- [x] Documentation updated
- [x] Boss approval received

---

## 📊 PROGRESS TRACKING

### Cursor Progress:
- [ ] Task 1: AIX Loader
- [ ] Task 2: Update Mini-Aladdin
- [ ] Task 3: Update Routes
- [ ] Task 4: Integration Test

### Gemini Progress:
- [ ] Task 1: Validate AIX
- [ ] Task 2: Security Audit
- [ ] Task 3: Code Review
- [ ] Task 4: QA Report

### Ona Progress:
- [x] Task 1: Monitor (ongoing)
- [ ] Task 2: Test Integration
- [ ] Task 3: Compile Results
- [ ] Task 4: Report to Boss

---

## 🚀 GETTING STARTED

### For Cursor:
1. Read `.cursor/rules/aix-team-coordination.md`
2. Start with Task 1 (AIX Loader)
3. Test each task before moving to next
4. Commit with message: "feat(aix): [task description] - Cursor"

### For Gemini 2.5:
1. Read `agents/mini-aladdin.aix`
2. Start with Task 1 (Validate AIX)
3. Document all findings
4. Create QA_REPORT_AIX.md

### For Ona (Me):
1. Monitor both team members
2. Answer questions
3. Test integration
4. Report to Boss

---

## 💬 COMMUNICATION

### Cursor → Ona:
- Comment in code when task complete
- Report any blockers
- Ask questions if unclear

### Gemini → Ona:
- Create QA report when done
- Flag critical issues immediately
- Provide recommendations

### Ona → Boss:
- Regular progress updates
- Final demo and results
- Recommendation for next steps

---

## 📞 QUESTIONS?

**Cursor:** Check `.cursor/rules/aix-team-coordination.md` for detailed instructions

**Gemini:** Focus on validation, security, and quality

**Ona:** I'm coordinating everything and will compile final results

---

**LET'S START! Cursor and Gemini, begin your tasks!** 🚀

**Boss, I'll report back with results!** 👑
