# 🧪 Test MVP Immediately - Verification Guide

**Purpose:** Verify all Phase 1 components are working before deployment

---

## ✅ Pre-Flight Checklist

### Required Services

- [ ] **Redis** - Running and accessible
- [ ] **Supabase** - Project created, migrations applied
- [ ] **Environment** - `.env` file with real credentials

---

## 🔧 Local Testing (Before Docker)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Create .env

```bash
cp .env.test .env
nano .env
```

**Required variables:**
```env
OPENROUTER_API_KEY=sk-or-v1-...
ZAI_API_KEY=...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=5000
NODE_ENV=development
```

### Step 3: Run Supabase Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor:
# Copy content from: backend/supabase/migrations/001_openmemory_tables.sql
# Paste and run in SQL Editor
```

### Step 4: Start Dev Server

```bash
npm run dev:unified
```

**Expected output:**
```
🔐 Validating environment variables...
✅ Environment validation passed

🔧 Initializing security middleware...
✅ Security: Helmet configured
✅ Security: CORS configured

🧠 Initializing OpenMemory MCP...
✅ OpenMemory MCP initialized

🤖 Initializing Agent Manager...
✅ Agent Manager initialized and available to routes

🔧 Initializing MCP Servers...
✅ Travel MCP Server initialized
   → 9 tools registered

🔧 Core services status:
  ✅ Agent Manager - Ready
  ✅ OpenMemory MCP - Ready
  ✅ Travel MCP Server - Ready
  ⏳ WebSocket Server - Pending configuration

🚀 خادم Amrikyy Unified Backend يعمل على المنفذ 5000
```

---

## 🧪 Test Suite

### Test 1: Health Check ✅

```bash
curl http://localhost:5000/health
```

**Expected:**
```
خادم Amrikyy Unified Backend يعمل وبصحة جيدة!
```

---

### Test 2: MCP Tools Discovery ✅

```bash
curl http://localhost:5000/api/mcp/tools | jq
```

**Expected:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "search_flights",
      "description": "Search for flights..."
    },
    ...
    {
      "name": "openmemory_query",
      "description": "Query agent memory..."
    },
    {
      "name": "openmemory_store",
      "description": "Store information in agent memory..."
    }
  ],
  "count": 11,
  "categories": {
    "travel": 9,
    "memory": 2
  }
}
```

**Verify:**
- ✅ `count` = 11
- ✅ `openmemory_query` present
- ✅ `openmemory_store` present

---

### Test 3: MCP Health Check ✅

```bash
curl http://localhost:5000/api/mcp/health | jq
```

**Expected:**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "travelMcp": {
      "status": "up",
      "toolsCount": 9
    },
    "openMemory": {
      "status": "idle",
      "stats": {
        "ephemeralHits": 0,
        "ephemeralMisses": 0,
        "longTermHits": 0,
        "longTermMisses": 0
      }
    }
  }
}
```

---

### Test 4: OpenMemory Store (via MCP) ✅

```bash
curl -X POST http://localhost:5000/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "openmemory_store",
    "params": {
      "agentId": "TestAgent",
      "memoryType": "long_term",
      "key": "test_key_1",
      "content": {
        "message": "This is a test memory",
        "timestamp": "2025-10-20",
        "priority": "high"
      },
      "userId": "test_user_123",
      "projectId": "amrikyy_mvp",
      "namespace": "testing",
      "options": {
        "contentType": "test_data",
        "metadata": {
          "source": "mvp_test"
        }
      }
    }
  }' | jq
```

**Expected:**
```json
{
  "success": true,
  "tool": "openmemory_store",
  "stored": true,
  "id": "uuid-...",
  "memoryType": "long_term",
  "key": "test_key_1"
}
```

**Verify:**
- ✅ `success` = true
- ✅ `stored` = true
- ✅ `id` is a UUID

---

### Test 5: OpenMemory Query (via MCP) ✅

```bash
curl -X POST http://localhost:5000/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "openmemory_query",
    "params": {
      "agentId": "TestAgent",
      "query": "test_key_1",
      "queryType": "keyword",
      "userId": "test_user_123",
      "projectId": "amrikyy_mvp",
      "namespace": "testing",
      "options": {
        "limit": 10
      }
    }
  }' | jq
```

**Expected:**
```json
{
  "success": true,
  "tool": "openmemory_query",
  "results": [
    {
      "id": "uuid-...",
      "key": "test_key_1",
      "value": {
        "message": "This is a test memory",
        "timestamp": "2025-10-20",
        "priority": "high"
      },
      "content_type": "test_data",
      "created_at": "..."
    }
  ],
  "count": 1
}
```

**Verify:**
- ✅ `success` = true
- ✅ `results` array not empty
- ✅ Stored data retrieved correctly

---

### Test 6: Agency Status ✅

```bash
curl http://localhost:5000/api/agency/status | jq
```

**Expected:**
```json
{
  "status": "Amrikyy Agency Orchestrator فعال",
  "agentsRegistered": 0,
  "taskQueueLength": 0,
  "timestamp": "..."
}
```

---

### Test 7: Create Agent Task ✅

```bash
curl -X POST http://localhost:5000/api/agency/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "TravelAgent",
    "request": {
      "type": "plan_trip",
      "destination": "Istanbul",
      "budget": 5000,
      "duration": 7
    },
    "priority": "high"
  }' | jq
```

**Expected:**
```json
{
  "success": true,
  "message": "تم قبول المهمة للمعالجة",
  "taskId": "uuid-..."
}
```

---

### Test 8: Memory API Stats ✅

```bash
curl http://localhost:5000/api/memory/stats | jq
```

**Expected:**
```json
{
  "success": true,
  "stats": {
    "ephemeralHits": 0,
    "ephemeralMisses": 0,
    "shortTermHits": 0,
    "shortTermMisses": 0,
    "longTermHits": 1,
    "longTermMisses": 0,
    "patternCount": 0
  },
  "timestamp": "..."
}
```

---

### Test 9: Travel Tool (via MCP) ✅

```bash
curl -X POST http://localhost:5000/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "search_locations",
    "params": {
      "query": "Istanbul"
    }
  }' | jq
```

**Expected:**
```json
{
  "success": true,
  "tool": "search_locations",
  "result": [
    {
      "id": "...",
      "name": "Istanbul",
      "code": "IST"
    }
  ]
}
```

---

## 📊 Test Results Summary

### All Tests Passed ✅

```
╔═══════════════════════════════════════════════════╗
║           MVP TEST RESULTS                        ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  ✅ Test 1: Health Check                         ║
║  ✅ Test 2: MCP Tools Discovery                  ║
║  ✅ Test 3: MCP Health                           ║
║  ✅ Test 4: OpenMemory Store                     ║
║  ✅ Test 5: OpenMemory Query                     ║
║  ✅ Test 6: Agency Status                        ║
║  ✅ Test 7: Create Task                          ║
║  ✅ Test 8: Memory Stats                         ║
║  ✅ Test 9: Travel Tool                          ║
║                                                   ║
║  Status: READY FOR DEPLOYMENT 🚀                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

## 🐳 Docker Testing

### Build Image

```bash
cd /workspace
docker build -f backend/Dockerfile -t amrikyy-agent:test .
```

**Expected output:**
```
[+] Building 45.2s
 => [build 1/6] FROM node:18-alpine
 => [build 2/6] COPY backend/package*.json ./
 => [build 3/6] RUN npm ci
 => [build 4/6] COPY backend/ ./
 => [build 5/6] RUN npm run build
 => [runtime 1/3] COPY --from=build /app/backend/node_modules
 => [runtime 2/3] COPY --from=build /app/backend/dist
 => exporting to image
 => => naming to docker.io/library/amrikyy-agent:test
```

### Run Container

```bash
docker run -d \
  --name amrikyy-test \
  -p 5001:5000 \
  --env-file backend/.env \
  amrikyy-agent:test
```

### Check Logs

```bash
docker logs -f amrikyy-test
```

**Expected:**
```
🔐 Validating environment variables...
✅ Environment validation passed
...
🚀 خادم Amrikyy Unified Backend يعمل على المنفذ 5000
```

### Test Container

```bash
# Health check
curl http://localhost:5001/health

# MCP tools
curl http://localhost:5001/api/mcp/tools | jq '.count'
# Should return: 11
```

### Cleanup

```bash
docker stop amrikyy-test
docker rm amrikyy-test
```

---

## 🎯 Production Readiness Checklist

### Before Deployment

- [ ] All 9 tests pass locally
- [ ] Docker build succeeds
- [ ] Docker container runs
- [ ] Environment variables set
- [ ] Redis accessible
- [ ] Supabase migrations applied
- [ ] No errors in logs
- [ ] Response times acceptable

### Deployment Ready

- [ ] Choose deployment platform
- [ ] Set up environment variables
- [ ] Deploy application
- [ ] Run tests against production URL
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts

---

## 🚀 You're Ready!

**All tests passing?** ✅  
**Docker working?** ✅  
**No errors?** ✅  

**→ TIME TO DEPLOY MVP! 🎉**

See `MVP_DEPLOYMENT_GUIDE.md` for deployment instructions.

---

**Test Duration:** ~10 minutes  
**Status:** Production Ready  
**Next:** Deploy to cloud! 🚀
