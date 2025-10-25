# Step 9: Quick Agent Testing

**Date**: October 25, 2025  
**Status**: ✅ Ready to Test (CORS Verified)

---

## ✅ Prerequisites Complete

- ✅ Backend: https://amrikyy-agent.onrender.com (CORS enabled)
- ✅ Frontend: https://amrikyy-travel-agent.vercel.app
- ✅ CORS Header: `access-control-allow-origin: *` ✓
- ✅ Health Endpoint: Working (Redis healthy, Gemini retrying)

---

## Quick Test Plan (30 minutes)

### 1️⃣ Open Frontend (1 minute)

```bash
# Visit the deployed site
open https://amrikyy-travel-agent.vercel.app

# Open Browser Console (F12 or Cmd+Option+I)
# Check for any errors
```

**What to look for**:

- ✅ Site loads without errors
- ✅ No CORS errors in console
- ✅ UI renders properly

---

### 2️⃣ Test Navigator Agent (5 minutes) 🗺️

**Most Important Agent - Test First!**

**Location**: Main page or navigation menu

**Quick Tests**:

1. **Trip Planning Tab**:
   - Enter: "Plan a 3-day trip to Paris"
   - Click: Generate/Submit
   - Expected: AI-generated itinerary appears

2. **Flight Search Tab**:
   - From: New York (JFK)
   - To: Los Angeles (LAX)
   - Date: Any future date
   - Expected: Flight results or search interface works

3. **Hotel Booking Tab**:
   - Location: "Paris"
   - Expected: Hotel search interface works

4. **Image Generation Tab**:
   - Prompt: "Eiffel Tower at sunset"
   - Expected: Image generates (may take 10-30 seconds)

**Success Criteria**:

- ✅ All tabs switch without errors
- ✅ API calls to backend work (check Network tab)
- ✅ Gemini responses appear (even if slow)
- ✅ No console errors

---

### 3️⃣ Test Vision Agent (3 minutes) 👁️

**Location**: `/agents/vision` or agent menu

**Quick Test**:

1. Upload any image (photo, screenshot, etc.)
2. Click "Analyze" or equivalent button
3. Wait for AI analysis

**Expected**:

- ✅ Image uploads successfully
- ✅ Gemini Vision returns description
- ✅ No errors

---

### 4️⃣ Test Research Agent (3 minutes) 🔍

**Location**: `/agents/research`

**Quick Test**:

1. Search: "Latest AI technology 2025"
2. Submit search
3. Check results

**Expected**:

- ✅ Search interface works
- ✅ Results appear (with or without grounding sources)
- ✅ No errors

---

### 5️⃣ Test Translator Agent (2 minutes) 🌐

**Location**: `/agents/translator`

**Quick Test**:

1. Input text: "Hello, how are you?"
2. Select language: Spanish
3. Translate

**Expected**:

- ✅ Translation appears: "Hola, ¿cómo estás?"
- ✅ Language selector works
- ✅ No errors

---

### 6️⃣ Test Coding Agent (5 minutes) 💻

**Location**: `/agents/coding`

**Quick Test - Try 2-3 sub-agents**:

1. **UI/UX Agent**:
   - Request: "Design a login page"
   - Expected: Code or design suggestions

2. **API Agent**:
   - Request: "Create REST API for user login"
   - Expected: API endpoint code

3. **Code Review Agent**:
   - Paste any code snippet
   - Request: "Review this code"
   - Expected: Code review feedback

**Success Criteria**:

- ✅ Sub-agents accessible
- ✅ Generates code/suggestions
- ✅ Syntax highlighting works
- ✅ No errors

---

### 7️⃣ Test Marketing Agent (5 minutes) 📊

**Location**: `/agents/marketing`

**Quick Test - Try 2-3 sub-agents**:

1. **Content Agent**:
   - Request: "Write blog post outline about travel"
   - Expected: Content outline

2. **SEO Agent**:
   - Request: "SEO keywords for travel blog"
   - Expected: Keyword list

3. **Social Media Agent**:
   - Request: "Create Instagram post for Paris trip"
   - Expected: Social media content

**Success Criteria**:

- ✅ Sub-agents accessible
- ✅ Generates marketing content
- ✅ Content is relevant
- ✅ No errors

---

### 8️⃣ Quick Check Remaining Agents (6 minutes)

**For each agent, just verify**:

- ✅ UI loads
- ✅ No critical errors
- ⚠️ May show "API not configured" for Google services (OK)

**Agents to check**:

- **Scheduler** (`/agents/scheduler`) - Calendar UI loads
- **Storage** (`/agents/storage`) - File manager UI loads
- **Media** (`/agents/media`) - Media generation UI loads
- **Communicator** (`/agents/communicator`) - Messaging UI loads

---

## Console Testing (Alternative Method)

If you don't want to click through UI, test backend directly:

### Test Backend Connection

```javascript
// Paste in browser console at https://amrikyy-travel-agent.vercel.app

// Test 1: Health check
fetch('https://amrikyy-agent.onrender.com/api/health')
  .then((r) => r.json())
  .then((d) => console.log('✅ Health:', d.status))
  .catch((e) => console.error('❌ Error:', e));

// Test 2: Sample agent call (adjust endpoint as needed)
fetch('https://amrikyy-agent.onrender.com/api/agents/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, test message' }),
})
  .then((r) => r.json())
  .then((d) => console.log('✅ Agent Response:', d))
  .catch((e) => console.error('❌ Error:', e));
```

---

## Common Issues & Quick Fixes

### Issue: Gemini 503 Errors

**Symptom**: "Model is overloaded"  
**Fix**: Wait 30 seconds, try again. This is normal for free tier.

### Issue: Slow Response

**Symptom**: Takes 20-30 seconds for first request  
**Fix**: Render cold start (first request wakes server). Normal behavior.

### Issue: Database Errors

**Symptom**: "Table 'users' not found"  
**Fix**: Expected - using placeholder Supabase. Doesn't affect AI agents.

### Issue: Google API Errors

**Symptom**: "Missing credentials" for Calendar/Drive/Email  
**Fix**: Expected - these are optional integrations. UI should still render.

---

## Quick Testing Checklist

Use this for rapid testing:

```
✅ Frontend loads
✅ No CORS errors
✅ Navigator Agent - Trip Planning works
✅ Navigator Agent - At least 1 other tab works
✅ Vision Agent - Image upload works
✅ Research Agent - Search works
✅ Translator Agent - Translation works
✅ Coding Agent - At least 2 sub-agents work
✅ Marketing Agent - At least 2 sub-agents work
✅ Other 4 agents - UI loads without crash

Minimum Success: 8/10 items checked ✅
```

---

## After Testing

### If 8+ Tests Pass ✅

**Congratulations! Step 9 Complete!**

Mark todo as complete and proceed to:

- **Step 10: Final Validation & Monitoring**

### If <8 Tests Pass ❌

**Document Issues**:

1. List which agents failed
2. Copy exact error messages from console
3. Check Render logs: https://dashboard.render.com → Logs tab
4. Report back for troubleshooting

---

## Next Steps

1. **Complete this quick test** (30 minutes)
2. **Document results** (note any issues)
3. **Mark Step 9 complete** if 8+ tests pass
4. **Proceed to Step 10**: Final validation and monitoring

---

## Monitoring During Testing

### Browser Console

- Watch for errors (red text)
- Check Network tab for failed requests
- Note any CORS or 503 errors

### Render Logs

- Go to: https://dashboard.render.com
- Click: Your backend service
- Tab: Logs
- Watch for: Error messages during testing

---

**Time Budget**: 30 minutes  
**Success Target**: 8/10 agents working  
**Priority**: Navigator, Vision, Research, Translator, Coding, Marketing

---

**Start Testing Now!** 🚀
Visit: https://amrikyy-travel-agent.vercel.app
