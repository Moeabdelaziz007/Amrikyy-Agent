# Step 9: Testing All 10 Agent UIs

**Status**: ✅ Step 8 Complete - CORS Updated on Render  
**Next**: Test all agents on live deployment  
**Time**: 30-45 minutes

---

## Prerequisites Checklist

- ✅ Backend deployed: https://amrikyy-agent.onrender.com
- ✅ Frontend deployed: https://amrikyy-travel-agent.vercel.app
- ✅ CORS updated to allow frontend-backend communication
- ✅ Backend health endpoint responding (Redis healthy, Gemini temporary 503 will auto-retry)

---

## Quick CORS Verification

Before testing agents, verify CORS is working:

### 1. Open Browser Console

```bash
# Visit frontend
open https://amrikyy-travel-agent.vercel.app
```

### 2. Test API Call in Console

Open browser DevTools (F12) and paste:

```javascript
fetch('https://amrikyy-agent.onrender.com/api/health')
  .then((r) => r.json())
  .then((data) => console.log('✅ CORS Working!', data))
  .catch((err) => console.error('❌ CORS Error:', err));
```

**Expected Result**: Should see `✅ CORS Working!` with health data  
**If CORS Error**: Double-check Render environment variables are saved and redeployed

---

## Agent Testing Checklist

### Agent 1: Navigator Agent (Travel) 🗺️

**Location**: Main page or `/agents/navigator`

**5 Tabs to Test**:

- [ ] **Trip Planning**: Enter destination (e.g., "Paris"), get AI itinerary
- [ ] **Flight Search**: Search flights (JFK → LAX), see results
- [ ] **Hotel Booking**: Search hotels in destination city
- [ ] **Local Guide**: Get local recommendations for a city
- [ ] **Image Generation**: Generate travel image (e.g., "Eiffel Tower at sunset")

**Success Criteria**:

- ✅ All 5 tabs load without errors
- ✅ API calls to backend complete
- ✅ Gemini generates relevant responses
- ✅ Images appear (if Imagen 3 enabled)
- ✅ No CORS errors in console

---

### Agent 2: Vision Agent 👁️

**Location**: `/agents/vision`

**Tests**:

- [ ] **Upload Image**: Select local image file
- [ ] **AI Analysis**: Get image description from Gemini
- [ ] **OCR**: Extract text from image with text
- [ ] **Landmark Recognition**: Upload landmark photo, get identification

**Success Criteria**:

- ✅ Image upload works
- ✅ Gemini Vision API returns analysis
- ✅ OCR extracts text accurately
- ✅ No console errors

---

### Agent 3: Research Agent 🔍

**Location**: `/agents/research`

**Tests**:

- [ ] **Web Search**: Search for "latest AI news"
- [ ] **Grounding Responses**: Verify responses include sources
- [ ] **Follow-up Questions**: Ask related question
- [ ] **Multi-topic Research**: Test different topics (tech, travel, etc.)

**Success Criteria**:

- ✅ Search results appear
- ✅ Gemini with grounding returns sourced answers
- ✅ Follow-ups maintain context
- ✅ Sources are clickable/visible

---

### Agent 4: Translator Agent 🌐

**Location**: `/agents/translator`

**Tests**:

- [ ] **Text Translation**: Translate "Hello, how are you?" to Spanish
- [ ] **Voice Input**: Record voice and translate
- [ ] **Multiple Languages**: Test 3+ language pairs
- [ ] **Gemini Live API**: Test real-time voice translation

**Success Criteria**:

- ✅ Text translation accurate
- ✅ Voice input captures audio (if browser allows)
- ✅ Multiple languages work
- ✅ Real-time translation functional

---

### Agent 5: Scheduler Agent 📅

**Location**: `/agents/scheduler`

**Tests**:

- [ ] **Google Calendar Integration**: Connect calendar (if credentials set)
- [ ] **Create Event**: Create test event "Meeting with team"
- [ ] **View Events**: Display upcoming events
- [ ] **Update Event**: Edit event details

**Success Criteria**:

- ✅ Calendar integration UI appears
- ✅ Event creation form works
- ✅ Events display correctly
- ✅ Google Calendar API calls succeed (if credentials set)

**Note**: If Google Calendar credentials not set, verify UI renders without errors

---

### Agent 6: Storage Agent 💾

**Location**: `/agents/storage`

**Tests**:

- [ ] **Google Drive Integration**: Connect Drive (if credentials set)
- [ ] **File Upload**: Upload test file
- [ ] **File List**: View uploaded files
- [ ] **File Download**: Download a file

**Success Criteria**:

- ✅ Drive integration UI appears
- ✅ File operations work
- ✅ File list displays correctly
- ✅ Google Drive API calls succeed (if credentials set)

**Note**: If Google Drive credentials not set, verify UI renders without errors

---

### Agent 7: Media Agent 🎬

**Location**: `/agents/media`

**Tests**:

- [ ] **Imagen 3**: Generate image "sunset over mountains"
- [ ] **Veo 3**: Generate video (if enabled)
- [ ] **YouTube Search**: Search "AI tutorials"
- [ ] **Media Gallery**: View generated media

**Success Criteria**:

- ✅ Image generation works
- ✅ Video generation UI appears
- ✅ YouTube search returns results
- ✅ Media displays correctly

---

### Agent 8: Communicator Agent 📱

**Location**: `/agents/communicator`

**Tests**:

- [ ] **Telegram Integration**: Connect bot (if token set)
- [ ] **Send Message**: Send test message
- [ ] **Email Integration**: Configure email (if credentials set)
- [ ] **Send Email**: Send test email

**Success Criteria**:

- ✅ Telegram UI appears
- ✅ Message sending works (if token set)
- ✅ Email UI appears
- ✅ Email sending works (if credentials set)

**Note**: If Telegram/Email credentials not set, verify UI renders without errors

---

### Agent 9: Coding Agent 💻

**Location**: `/agents/coding`

**6 Sub-Agents to Test**:

- [ ] **UI/UX Agent**: Request UI design for login page
- [ ] **API Agent**: Generate REST API endpoint code
- [ ] **DevOps Agent**: Get deployment configuration
- [ ] **QA Agent**: Request test cases for feature
- [ ] **Docs Agent**: Generate API documentation
- [ ] **Code Review Agent**: Submit code for review

**Success Criteria**:

- ✅ All 6 sub-agents accessible
- ✅ Each sub-agent generates relevant code/content
- ✅ Gemini Pro responses are code-focused
- ✅ Syntax highlighting works
- ✅ Copy-to-clipboard functional

---

### Agent 10: Marketing Agent 📊

**Location**: `/agents/marketing`

**6 Sub-Agents to Test**:

- [ ] **Market Research Agent**: Analyze target audience
- [ ] **SEO Agent**: Generate SEO keywords
- [ ] **Content Agent**: Create blog post outline
- [ ] **Social Media Agent**: Generate social posts
- [ ] **Campaign Agent**: Plan marketing campaign
- [ ] **Analytics Agent**: Request analytics insights

**Success Criteria**:

- ✅ All 6 sub-agents accessible
- ✅ Each sub-agent generates marketing content
- ✅ Gemini Pro responses are marketing-focused
- ✅ Content is relevant and actionable
- ✅ No console errors

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Symptoms**:

- Console shows "Access-Control-Allow-Origin" errors
- API calls fail with status 0 or CORS error

**Solution**:

1. Check Render environment variables:
   - CORS_ORIGIN=https://amrikyy-travel-agent.vercel.app
   - FRONTEND_URL=https://amrikyy-travel-agent.vercel.app
2. Ensure Render redeployed after saving variables
3. Wait 2-3 minutes for deployment to complete
4. Hard refresh frontend (Cmd+Shift+R or Ctrl+Shift+F5)

---

### Issue 2: Gemini 503 Errors

**Symptoms**:

- "Model is overloaded" errors
- Some AI responses fail

**Solution**:

- This is normal for free tier Gemini API
- Automatic retries implemented in backend
- Wait 30-60 seconds and try again
- Most requests will succeed on retry

---

### Issue 3: Missing Google API Credentials

**Symptoms**:

- Scheduler, Storage, Communicator agents show errors
- "Missing credentials" messages

**Solution**:

- This is expected if Google APIs not configured
- Verify UI still renders without crashing
- Mark test as "partial pass" if UI works but API calls fail
- Full integration requires Google Cloud credentials (optional)

---

### Issue 4: Render Cold Start

**Symptoms**:

- First API call takes 20-30 seconds
- Subsequent calls are fast

**Solution**:

- Render Free tier spins down after 15 minutes inactivity
- First request wakes up the service (cold start)
- This is normal behavior
- Consider upgrading to Render Starter ($7/month) to avoid cold starts

---

### Issue 5: Image Generation Slow

**Symptoms**:

- Imagen 3 takes 10-30 seconds to generate
- Video generation very slow or fails

**Solution**:

- Imagen 3 generation is intentionally slower (high quality)
- Video generation (Veo 3) may be disabled due to API limits
- This is expected behavior
- Ensure loading indicators work properly

---

## Testing Notes Template

Use this template to document your testing:

```markdown
## Agent Testing Results

### Agent 1: Navigator (Travel)

- Trip Planning: ✅ Working
- Flight Search: ✅ Working
- Hotel Booking: ✅ Working
- Local Guide: ✅ Working
- Image Generation: ⚠️ Slow but works

**Issues**: None

---

### Agent 2: Vision

- Upload Image: ✅ Working
- AI Analysis: ✅ Working
- OCR: ✅ Working
- Landmark Recognition: ✅ Working

**Issues**: None

---

[Continue for all 10 agents...]
```

---

## Success Metrics

**Minimum for Step 9 Pass**:

- [ ] 8/10 agents functional (80% success rate)
- [ ] No critical CORS errors
- [ ] Frontend loads without crashes
- [ ] At least 3 agents can successfully call Gemini API
- [ ] Mobile responsive (test on phone)

**Ideal for Step 9 Pass**:

- [ ] 10/10 agents functional
- [ ] All API calls succeed
- [ ] No console errors
- [ ] Fast load times (<3 seconds)
- [ ] Perfect mobile experience

---

## After Testing

Once all testing is complete:

1. **Document Results**: Fill in testing notes template above
2. **Report Issues**: Create list of any bugs found
3. **Update Todo**: Mark Step 9 as complete
4. **Proceed to Step 10**: Final validation and monitoring

---

## Quick Test Commands

### Test Backend API

```bash
# Health check
curl https://amrikyy-agent.onrender.com/api/health

# Test specific agent endpoint (example)
curl -X POST https://amrikyy-agent.onrender.com/api/agents/travel \
  -H "Content-Type: application/json" \
  -d '{"query": "Plan a trip to Paris"}'
```

### Monitor Backend Logs

```bash
# Go to Render dashboard
# Click on your service
# Click "Logs" tab
# Watch for errors during testing
```

### Check Vercel Analytics

```bash
# Visit Vercel dashboard
# Click on amrikyy-travel-agent project
# Go to Analytics tab
# Monitor real-time traffic during testing
```

---

## Timeline

**Estimated Time**: 30-45 minutes

- CORS Verification: 5 minutes
- Agent 1-5 Testing: 15 minutes
- Agent 6-10 Testing: 15 minutes
- Documentation: 5 minutes
- Issue Troubleshooting: 5 minutes (if needed)

---

## Next Steps

After completing Step 9:

- Proceed to **Step 10: Final Validation & Monitoring**
- See `DEPLOYMENT_COMPLETE.md` for Step 10 checklist

---

**Created**: October 25, 2025  
**Status**: Ready for Testing  
**Prerequisites**: ✅ All complete (Steps 1-8 done)
