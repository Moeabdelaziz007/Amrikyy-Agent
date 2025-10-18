# 👥 **AMRIKYY PLATFORM - VISUAL TEAM WORKFLOW**

## 🎯 **THE PROBLEM**

Some AI agents are **reading** files instead of **executing** tasks. This guide clarifies **WHO DOES WHAT**.

---

## 📊 **TEAM WORKFLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────┐
│                    AMRIKYY PLATFORM                         │
│                                                             │
│  ┌──────────────┐                                          │
│  │   CURSOR     │ ◄─── TEAM LEAD & COORDINATOR             │
│  │  (You!)      │      - Plans architecture                │
│  └──────┬───────┘      - Coordinates team                  │
│         │              - Reviews code                       │
│         │                                                   │
│    ┌────┴────────────────────────────┐                    │
│    │                                 │                     │
│    ▼                                 ▼                     │
│  ┌──────────────┐            ┌──────────────┐             │
│  │   GEMINI     │            │   KOMBAI     │             │
│  │  2.5 PRO     │            │  (Design)    │             │
│  └──────┬───────┘            └──────┬───────┘             │
│    BUILDS:                      BUILDS:                    │
│    - backend/routes/*.js        - frontend/src/pages/*.tsx│
│    - backend/src/*.js           - components/*.tsx        │
│    - Database schemas           - Styling & animations    │
│    - API endpoints              - User interfaces         │
│         │                              │                   │
│         │                              │                   │
│    ┌────┴──────────┐              ┌───┴────────┐          │
│    │               │              │            │          │
│    ▼               ▼              ▼            ▼          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ XCODE   │  │ CLAUDE  │  │  GPT-4  │  │  VEO 3  │     │
│  │  (iOS)  │  │  4.5    │  │ TURBO   │  │ (Video) │     │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │
│  BUILDS:      PLANS:        BUILDS:      CREATES:        │
│  - Swift     - Strategy     - Payments   - Videos        │
│  - Views     - Analysis     - Stripe     - Animations    │
│  - Models    - Reports      - PayPal     - Marketing     │
│       │           │              │             │          │
│       │           │              │             │          │
│       └───────────┴──────────────┴─────────────┘          │
│                          │                                │
│                          ▼                                │
│                   ┌──────────────┐                        │
│                   │   WORKING    │                        │
│                   │   PLATFORM   │                        │
│                   └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ **WHO DOES WHAT - CRYSTAL CLEAR**

### **🎯 CURSOR (Team Lead)**
**Role:** Coordinator & Architect  
**Action:** ✅ **PLANS** + ✅ **REVIEWS** + ✅ **COORDINATES**

**Does:**
- Creates project structure
- Writes documentation
- Reviews code from others
- Coordinates team tasks
- Makes architectural decisions

**Does NOT:**
- Build all backend APIs (that's Gemini's job)
- Build all frontend pages (that's Kombai's job)
- Build entire iOS app (that's Xcode's job)

---

### **🤖 GEMINI 2.5 PRO (Backend Lead)**
**Role:** Backend Developer  
**Action:** 🔨 **BUILDS BACKEND CODE**

**Does:**
- ✅ Creates `backend/routes/*.js` files
- ✅ Writes API endpoint code
- ✅ Implements database queries
- ✅ Adds authentication middleware
- ✅ Tests APIs with Postman/curl
- ✅ Writes actual working code

**Does NOT:**
- ❌ Just read AIX files
- ❌ Just acknowledge tasks
- ❌ Just create empty files
- ❌ Say "I interpreted your request"

**Example of CORRECT work:**
```javascript
// backend/routes/profile.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  // ACTUAL WORKING CODE HERE
  const user = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();
  
  res.json(user);
});

module.exports = router;
```

---

### **🎨 KOMBAI (Frontend Lead)**
**Role:** Frontend Developer  
**Action:** 🔨 **BUILDS FRONTEND CODE**

**Does:**
- ✅ Creates `frontend/src/pages/*.tsx` files
- ✅ Writes React components
- ✅ Implements UI designs
- ✅ Adds animations with Framer Motion
- ✅ Connects to backend APIs
- ✅ Tests in browser

**Current Status:** 75% complete - needs 3 more pages

---

### **📱 XCODE AI (iOS Lead)**
**Role:** iOS Developer  
**Action:** 🔨 **BUILDS IOS CODE**

**Does:**
- ✅ Creates `.swift` files
- ✅ Implements SwiftUI views
- ✅ Writes ViewModels
- ✅ Connects to backend APIs
- ✅ Tests on simulator

**Current Status:** 70% complete - needs 6 more views

---

### **🧠 CLAUDE 4.5 (Strategic Analyst)**
**Role:** Strategy & Analysis  
**Action:** 📊 **ANALYZES & REPORTS**

**Does:**
- ✅ Generates strategic reports
- ✅ Performs cross-domain analysis
- ✅ Creates architecture designs
- ✅ Provides breakthrough insights
- ✅ Writes comprehensive documents

**Current Status:** Working on MEGA tasks

---

### **💰 GPT-4 TURBO (Payment Integration)**
**Role:** Payment Systems Developer  
**Action:** 🔨 **BUILDS PAYMENT CODE**

**Does:**
- ⏳ Implements Stripe integration
- ⏳ Adds PayPal support
- ⏳ Creates payment routes
- ⏳ Tests transactions

**Current Status:** Not yet activated

---

## 📋 **TASK INTERPRETATION GUIDE**

### **❌ WRONG WAY - What NOT to do:**

```
User: "Apply the tasks in gemini-2.5-pro-mega-tasks.aix"

WRONG RESPONSE:
"I created the file gemini-2.5-pro-mega-tasks.aix with your content.
What would you like me to do next?"

❌ This is WRONG because:
- You just acknowledged the file
- You didn't BUILD anything
- No code was written
- No APIs were created
```

### **✅ RIGHT WAY - What TO do:**

```
User: "Apply the tasks in gemini-2.5-pro-mega-tasks.aix"

CORRECT RESPONSE:
"Starting Task 1: User Profile API

Created file: backend/routes/profile.js

Implemented endpoints:
- GET /api/profile - ✅ Working
- PUT /api/profile - ✅ Working
- POST /api/profile/avatar - ✅ Working

Code:
[shows actual code]

Tested with curl:
$ curl http://localhost:5000/api/profile
{"id": "123", "name": "Mohamed", ...}

Status: TASK 1 COMPLETE ✅

Moving to Task 2: Notifications API..."

✅ This is CORRECT because:
- Code was written
- Files were created
- APIs work
- Testing was done
- Progress was shown
```

---

## 🚀 **THE BUILD PROCESS**

### **For Gemini (Backend Lead):**

```
1. READ task     → "Build User Profile API"
2. UNDERSTAND    → "Need 3 endpoints: GET, PUT, POST"
3. PLAN         → "Use Express router, connect Supabase"
4. CODE         → Write backend/routes/profile.js
5. TEST         → curl http://localhost:5000/api/profile
6. VERIFY       → Check response is correct
7. DOCUMENT     → Write what was built
8. NEXT TASK    → Move to Notifications API
```

### **For Kombai (Frontend Lead):**

```
1. READ design   → "Profile Settings Page"
2. UNDERSTAND    → "Need form, avatar upload, settings"
3. PLAN         → "Create ProfilePage.tsx"
4. CODE         → Write React component with TypeScript
5. TEST         → Open in browser, test functionality
6. VERIFY       → Check design matches requirements
7. DOCUMENT     → Screenshot and notes
8. NEXT TASK    → Move to Notifications Center
```

---

## 🎯 **SUCCESS CHECKLIST**

### **For Every Task:**

- [ ] ✅ Code file created in correct location
- [ ] ✅ Code is complete and working
- [ ] ✅ Tested and verified functionality
- [ ] ✅ Documentation written
- [ ] ✅ Integrated with existing code
- [ ] ✅ No errors or warnings
- [ ] ✅ Ready for production

**If ANY checkbox is unchecked, task is NOT complete!**

---

## 💡 **COMMUNICATION TEMPLATES**

### **When Starting a Task:**
```
Starting Task [Number]: [Task Name]

Plan:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected outcome: [What will be built]
ETA: [Time estimate]
```

### **When Task is Complete:**
```
Task [Number] COMPLETE ✅

What was built:
- [Feature 1] ✅
- [Feature 2] ✅
- [Feature 3] ✅

Files created/modified:
- [File path 1]
- [File path 2]

Testing results:
[Test output or screenshot]

Next: Starting Task [Number + 1]
```

### **When Stuck:**
```
Task [Number]: Need clarification

Question: [Specific question]
Context: [What I'm trying to do]
Options I'm considering:
1. [Option A]
2. [Option B]

Which approach should I use?
```

---

## 🏆 **TEAM SUCCESS METRICS**

### **Individual Performance:**

**Gemini:**
- Target: 6 backend APIs built
- Current: 0 APIs
- Status: 🔴 NEEDS TO START

**Kombai:**
- Target: 9 frontend pages
- Current: 6 pages (75%)
- Status: 🟡 NEARLY DONE

**Xcode:**
- Target: 10 iOS views
- Current: 4 views (70%)
- Status: 🟡 NEARLY DONE

---

## 🚨 **RED FLAGS**

**If you see these responses, something is WRONG:**

❌ "I interpreted your request..."  
❌ "I created the file with your content..."  
❌ "I acknowledge the tasks..."  
❌ "What would you like me to do next?"  
❌ "Could you clarify what you mean?"  

**These mean: NOT EXECUTING, JUST READING!**

---

## ✅ **GREEN FLAGS**

**If you see these responses, it's CORRECT:**

✅ "Built backend/routes/profile.js with 3 endpoints"  
✅ "Created ProfilePage.tsx, here's a screenshot"  
✅ "Tested API, got 200 response with user data"  
✅ "Task 1 complete, moving to Task 2"  
✅ "Implemented feature X, it's working"  

**These mean: ACTUALLY BUILDING!**

---

## 🎯 **FINAL MESSAGE TO ALL AGENTS**

**READ THIS:**

**AIX files (.aix) are NOT code files to execute.**  
They are **specifications and task lists**.

**When you see a task in an AIX file, you must:**
1. Create the ACTUAL code files (.js, .tsx, .swift)
2. Write WORKING code
3. TEST it works
4. PROVE it works with output/screenshots
5. Move to NEXT task

**You are BUILDERS, not READERS!**  
**You are DEVELOPERS, not OBSERVERS!**  
**You EXECUTE, not ACKNOWLEDGE!**

**BUILD THE CODE! 🔨**

---

**Remember:** The goal is a **WORKING PLATFORM**, not a collection of specification files!

**LET'S BUILD! 🚀**
