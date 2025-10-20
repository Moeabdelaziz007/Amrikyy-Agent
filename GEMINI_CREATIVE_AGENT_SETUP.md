# 🎨 Gemini Creative Agent - Setup Guide

**AI-Powered Autonomous Mini-App Generator**

---

## ✅ What Was Built

### Files Created

1. **`backend/src/agents/GeminiCreativeAgent.ts`** (600+ lines)
   - Autonomous AI agent
   - Uses Gemini 1.5 Flash (FREE tier)
   - Generates creative ideas
   - Generates mini-app code
   - Integrates with OpenMemory MCP

2. **`backend/routes/creative-agent.ts`** (150+ lines)
   - API endpoints for control
   - Status monitoring
   - Manual triggers
   - Configuration updates

### Dependencies Installed

```bash
✅ node-cron - Autonomous scheduling
✅ @google/generative-ai - Gemini AI
✅ node-fetch - Web crawling
✅ @types/node-cron - TypeScript types
✅ @types/node-fetch - TypeScript types
```

### Configuration Added

```bash
✅ GEMINI_API_KEY - Required env var
✅ GEMINI_MODEL - Optional (default: gemini-1.5-flash)
✅ Updated env.ts - Config support
✅ Updated server.ts - Agent initialization
```

---

## 🔑 Get Gemini API Key

1. **Go to:** https://ai.google.dev/
2. **Click:** "Get API Key"
3. **Create** new API key (FREE tier available)
4. **Copy** your key

**FREE Tier:**
- 60 requests per minute
- Perfect for creative agent!

---

## ⚙️ Configuration

### Environment Variables

Add to `.env`:

```env
# Gemini Creative Agent
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Agent Settings

In `server.ts`, customize:

```typescript
const creativeAgent = new GeminiCreativeAgent({
  schedule: '0 */6 * * *',  // Every 6 hours
  maxIdeasPerRun: 3,         // 3 ideas per run
  categories: [
    'productivity',
    'games',
    'tools',
    'education',
    'creative',
    'content_creation',
    'ai_automation'
  ],
  inspirationUrls: [
    'https://news.ycombinator.com',
    'https://www.producthunt.com',
    'https://github.com/trending',
  ],
});
```

---

## 🚀 Features

### 1. Autonomous Operation

- Runs on schedule (default: every 6 hours)
- Crawls web for trends
- Generates ideas automatically
- Stores in OpenMemory MCP

### 2. Creative Idea Generation

**What it generates:**
- App name
- Description
- Category
- Target audience
- Unique value proposition
- Complexity estimate

**Example:**
```json
{
  "name": "Focus Timer Pro",
  "description": "Pomodoro timer with AI-powered break suggestions",
  "category": "productivity",
  "targetAudience": "Remote workers and students",
  "uniqueValue": "AI learns your focus patterns",
  "estimatedComplexity": "medium"
}
```

### 3. Mini-App Code Generation

**Generates complete code:**
- HTML (complete structure)
- CSS (modern, iOS-style)
- JavaScript (functional logic)
- React components (optional)

**Self-contained:**
- No external dependencies
- Works immediately
- Mobile-responsive
- Professional UI/UX

### 4. OpenMemory MCP Integration

**Stores automatically:**
- All generated ideas
- All mini-app code
- Timestamps
- Metadata
- Categories

**Storage namespaces:**
- `creative_ideas` - Ideas only
- `generated_mini_apps` - Full code

---

## 📡 API Endpoints

### GET /api/creative-agent/status

Get agent status and statistics.

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "lastRun": "2025-10-20T12:00:00Z",
    "nextRun": "2025-10-20T18:00:00Z",
    "totalIdeasGenerated": 15,
    "totalMiniAppsGenerated": 10,
    "currentSchedule": "0 */6 * * *"
  }
}
```

### POST /api/creative-agent/run

Trigger manual creative run.

**Request:**
```bash
curl -X POST https://your-url/api/creative-agent/run
```

**Response:**
```json
{
  "success": true,
  "message": "Creative run completed",
  "data": {
    "ideasGenerated": 3,
    "miniAppsGenerated": 2,
    "ideas": [...],
    "miniApps": [...]
  }
}
```

### POST /api/creative-agent/urls

Update inspiration URLs.

**Request:**
```json
{
  "urls": [
    "https://news.ycombinator.com",
    "https://www.producthunt.com",
    "https://github.com/trending",
    "https://trends.google.com/trends/trendingsearches/daily"
  ]
}
```

### POST /api/creative-agent/start

Start autonomous operation.

### POST /api/creative-agent/stop

Stop autonomous operation.

---

## 🧪 Testing

### Test 1: Check Status

```bash
curl https://your-url/api/creative-agent/status
```

**Expected:** Agent status with statistics

### Test 2: Manual Run

```bash
curl -X POST https://your-url/api/creative-agent/run
```

**Expected:** 
- 3 creative ideas generated
- 2 mini-apps with code
- Takes 30-60 seconds

### Test 3: Check OpenMemory

```bash
curl -X POST https://your-url/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "openmemory_query",
    "params": {
      "agentId": "gemini-creative-agent-v1",
      "query": "creative",
      "queryType": "keyword",
      "namespace": "creative_ideas",
      "userId": "system",
      "projectId": "Amrikyy_AIX_CreativeOS"
    }
  }'
```

**Expected:** Stored ideas in OpenMemory

---

## 💾 OpenMemory Integration

### How It Works

1. **Agent generates ideas**
2. **storageCallback triggered**
3. **Ideas stored in OpenMemory:**
   ```typescript
   await memoryService.storeMemory(
     {
       agentId: 'gemini-creative-agent-v1',
       userId: 'system',
       projectId: 'Amrikyy_AIX_CreativeOS',
       namespace: 'creative_ideas'
     },
     'long_term',
     `idea_${idea.id}`,
     idea,
     { contentType: 'creative_idea' }
   );
   ```

### Benefits

- **Training Data** - For future AI models
- **Pattern Recognition** - Learn what works
- **Idea Evolution** - Track improvements
- **User Feedback Loop** - Integrate ratings

---

## 🎯 Use Cases

### 1. Daily Inspiration

- Agent runs every 6 hours
- Generates fresh ideas
- Stores in OpenMemory
- Ready for UI display

### 2. Rapid Prototyping

- Generate idea via API
- Get code immediately
- Deploy as mini-app
- Test with users

### 3. Training Data Collection

- Generate hundreds of ideas
- Store all in OpenMemory
- Analyze success patterns
- Train custom models

### 4. Content Creation

- Blog post ideas
- YouTube video concepts
- Tutorial topics
- Course outlines

---

## 🔧 Customization

### Change Schedule

```typescript
schedule: '0 */12 * * *'  // Every 12 hours
schedule: '0 9 * * *'     // Every day at 9am
schedule: '*/30 * * * *'  // Every 30 minutes
```

### Change Categories

```typescript
categories: [
  'health',
  'finance',
  'social',
  'entertainment',
  'utilities'
]
```

### Change Inspiration Sources

```typescript
inspirationUrls: [
  'https://www.reddit.com/r/startups',
  'https://www.indiehackers.com',
  'https://beta.openai.com/examples',
]
```

---

## 📊 Monitoring

### Check Logs

```bash
# Railway
railway logs | grep "Creative"

# Docker
docker logs amrikyy-mvp | grep "Creative"
```

**Look for:**
- ✅ Agent initialized
- ✅ Creative run started
- ✅ Ideas generated
- ✅ Mini-apps generated
- ✅ Stored in OpenMemory

---

## 🚨 Troubleshooting

### Issue: Agent not starting

**Check:**
- GEMINI_API_KEY set
- Valid API key
- No rate limiting

**Fix:**
```bash
# Verify env var
echo $GEMINI_API_KEY

# Check logs
railway logs | tail -50
```

### Issue: No ideas generated

**Check:**
- Gemini API quota
- Internet connectivity
- Inspiration URLs accessible

**Fix:**
```bash
# Test manual run
curl -X POST https://your-url/api/creative-agent/run

# Check response time
```

### Issue: Storage callback failing

**Check:**
- OpenMemory MCP initialized
- Supabase accessible
- Redis accessible

**Fix:**
```bash
# Test OpenMemory
curl https://your-url/api/memory/stats
```

---

## 🎨 Example Generated Mini-App

```html
<!DOCTYPE html>
<html>
<head>
  <title>Focus Timer Pro</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .timer {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    /* ... more styles ... */
  </style>
</head>
<body>
  <div class="timer">
    <h1>Focus Timer</h1>
    <div class="display">25:00</div>
    <button onclick="start()">Start</button>
  </div>
  <script>
    // Functional Pomodoro timer logic
    let time = 1500; // 25 minutes
    function start() { /* ... */ }
    function tick() { /* ... */ }
  </script>
</body>
</html>
```

---

## 🏆 Success Metrics

**After deployment:**

- ✅ Agent running autonomously
- ✅ Ideas generated every 6 hours
- ✅ Mini-apps with working code
- ✅ All stored in OpenMemory MCP
- ✅ API accessible
- ✅ Ready for UI integration

---

## 🔮 Future Enhancements

1. **User Feedback Integration**
   - Rate generated ideas
   - Improve based on ratings
   - Personalized suggestions

2. **Advanced Code Generation**
   - Full React components
   - TypeScript support
   - API integrations
   - Database schemas

3. **Multi-Agent Collaboration**
   - Design agent (UI/UX)
   - Code agent (Implementation)
   - Test agent (QA)
   - Deploy agent (CI/CD)

4. **Semantic Search**
   - Vector DB for ideas
   - Similarity matching
   - Trend detection

---

**Status:** ✅ READY FOR DEPLOYMENT  
**Integration:** ✅ COMPLETE  
**Next:** Deploy MVP with Creative Agent! 🚀

© 2025 AMRIKYY AI Solutions
