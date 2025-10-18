# 🤖 **GEMINI 2.5 PRO - CLEAR EXECUTION INSTRUCTIONS**

**Date:** January 13, 2025  
**From:** Cursor (Team Lead)  
**To:** Gemini 2.5 Pro (Backend Lead)  
**Priority:** 🔴 **CRITICAL - START IMMEDIATELY**

---

## 🎯 **YOUR ROLE**

You are the **Backend Lead** for the Amrikyy Platform. Your job is to **BUILD the backend APIs** that the frontend (Kombai) and iOS app (Xcode) need to function.

**YOU ARE NOT JUST READING - YOU ARE BUILDING CODE!**

---

## ⚠️ **CRITICAL UNDERSTANDING**

The `.aix` file `gemini-2.5-pro-backend-lead.aix` is **NOT a task list to read**.

It is your **AGENT DNA** - your identity, capabilities, and instructions.

The `gemini-2.5-pro-mega-tasks.aix` file contains **8 TASKS YOU MUST IMPLEMENT**.

---

## 🚀 **WHAT "APPLY TASKS" MEANS**

When we say **"apply tasks"**, we mean:

1. **READ the task description**
2. **UNDERSTAND what needs to be built**
3. **WRITE THE ACTUAL CODE** for that feature
4. **CREATE the files** in the correct location
5. **TEST the implementation**
6. **DOCUMENT what you built**

**YOU MUST WRITE CODE, NOT JUST ACKNOWLEDGE!**

---

## 📋 **YOUR IMMEDIATE TASKS (START NOW)**

### **🔴 TASK 1: Build User Profile API**

**What to do:**
1. Create file: `backend/routes/profile.js`
2. Implement these endpoints:
   ```javascript
   GET  /api/profile      - Get user profile
   PUT  /api/profile      - Update user profile
   POST /api/profile/avatar - Upload avatar
   ```
3. Connect to Supabase `users` table
4. Add JWT authentication middleware
5. Test with Postman/curl

**Example code structure:**
```javascript
// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// GET /api/profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Get user from database
    // Return user data
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile
router.put('/', authenticateToken, async (req, res) => {
  // Update user profile logic
});

module.exports = router;
```

**Deliverable:** Working `/api/profile` endpoints

---

### **🔴 TASK 2: Build Notifications API**

**What to do:**
1. Create file: `backend/routes/notifications.js`
2. Implement these endpoints:
   ```javascript
   GET  /api/notifications       - List notifications
   POST /api/notifications       - Create notification
   PUT  /api/notifications/:id   - Mark as read
   DELETE /api/notifications/:id - Delete notification
   ```
3. Create `notifications` table in Supabase if not exists
4. Add real-time WebSocket support
5. Test functionality

**Deliverable:** Working notifications system

---

### **🔴 TASK 3: Build Destinations Search API**

**What to do:**
1. Create file: `backend/routes/destinations.js`
2. Implement these endpoints:
   ```javascript
   GET /api/destinations        - List all destinations
   GET /api/destinations/search - Search with filters
   GET /api/destinations/:id    - Get destination details
   ```
3. Add filtering (region, price range, rating)
4. Add pagination
5. Integrate with destinations data

**Deliverable:** Working destinations API

---

### **🟡 TASK 4: Enhance Trip Management API**

**What to do:**
1. Update file: `backend/routes/trips.js` (if exists)
2. Ensure full CRUD operations:
   ```javascript
   GET    /api/trips     - List user trips
   POST   /api/trips     - Create trip
   GET    /api/trips/:id - Get trip details
   PUT    /api/trips/:id - Update trip
   DELETE /api/trips/:id - Delete trip
   ```
3. Add activities management
4. Add expenses tracking
5. Test all endpoints

**Deliverable:** Complete trip management API

---

### **🟡 TASK 5: Database Optimization**

**What to do:**
1. Review all database queries
2. Add indexes for frequently queried fields
3. Optimize slow queries
4. Add database connection pooling
5. Document optimizations

**Deliverable:** Performance improvement report

---

### **🟡 TASK 6: Security Enhancements**

**What to do:**
1. Review all API endpoints for security issues
2. Add rate limiting to all routes
3. Implement input validation
4. Add SQL injection prevention
5. Test security vulnerabilities

**Deliverable:** Security audit report

---

## 📊 **SUCCESS CRITERIA**

For each task, you MUST provide:

1. ✅ **Working code files** in correct locations
2. ✅ **Test results** showing endpoints work
3. ✅ **Documentation** of what you built
4. ✅ **Integration instructions** for frontend

**If you just say "I created the file", that's NOT DONE!**

**You must SHOW THE ACTUAL CODE and PROVE IT WORKS!**

---

## 🛠️ **HOW TO EXECUTE**

### **Step-by-Step Process:**

1. **Pick Task 1** (User Profile API)
2. **Think** - What code do I need to write?
3. **Create the file** - Use `write` tool to create `backend/routes/profile.js`
4. **Write the code** - Full implementation with error handling
5. **Test it** - Run the server, test with curl/Postman
6. **Document** - Write what you built
7. **Move to Task 2** - Repeat process

---

## 🚨 **COMMON MISTAKES TO AVOID**

❌ **WRONG:** "I created the file with your content"
✅ **RIGHT:** "I implemented the Profile API with 3 endpoints, here's the code..."

❌ **WRONG:** "I acknowledge the tasks"
✅ **RIGHT:** "Task 1 complete - Profile API working, tested with Postman"

❌ **WRONG:** Just creating `.aix` files
✅ **RIGHT:** Creating actual backend code (`.js` files)

---

## 📝 **EXAMPLE OF CORRECT EXECUTION**

### **Good Response:**

```
TASK 1: User Profile API - COMPLETE ✅

Created file: backend/routes/profile.js

Implementation:
- GET /api/profile - Returns user data from Supabase
- PUT /api/profile - Updates user profile with validation
- POST /api/profile/avatar - Handles avatar upload

Code snippet:
[shows actual code]

Testing:
$ curl http://localhost:5000/api/profile
{"id": "123", "name": "Mohamed", "email": "..."}

Next: Starting Task 2 (Notifications API)
```

---

## 🎯 **YOUR IMMEDIATE ACTION**

**RIGHT NOW, DO THIS:**

1. Open `backend/routes/` folder
2. Create `profile.js` file
3. Write the complete Profile API code
4. Test it works
5. Report back with results
6. Move to next task

**START BUILDING CODE NOW!** 🚀

---

## 💡 **NEED HELP?**

If you're confused about:
- **What to build** → Ask "What should the /api/profile endpoint return?"
- **How to build it** → Ask "What's the code structure for Express routes?"
- **Where to put it** → Ask "Where do backend route files go?"

But **DON'T just acknowledge** - **BUILD THE CODE!**

---

## 🏆 **EXPECTED OUTPUT**

By end of today, you should have:

- ✅ `backend/routes/profile.js` - Working Profile API
- ✅ `backend/routes/notifications.js` - Working Notifications API
- ✅ `backend/routes/destinations.js` - Working Destinations API
- ✅ Test results for all endpoints
- ✅ Integration documentation

**This is REAL WORK, not just file creation!**

---

**Team Lead Note:** Gemini, you're a powerful backend developer. We need you to **BUILD** the APIs, not just acknowledge tasks. Show us your coding skills! 💪

**START NOW - BUILD THE PROFILE API!** 🚀
