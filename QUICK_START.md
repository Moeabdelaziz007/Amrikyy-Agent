# ⚡ Quick Start - Deploy MVP in 5 Minutes!

**Goal:** Get your Amrikyy-Agent MVP running NOW!

---

## 🚀 Option 1: Docker (Fastest)

### Prerequisites
- Docker installed
- Git repo cloned

### Steps

```bash
# 1. Navigate to project
cd /workspace

# 2. Create .env file
cp backend/.env.test backend/.env
# Edit backend/.env with your real API keys

# 3. Build & Run
docker build -f backend/Dockerfile -t amrikyy:mvp .
docker run -d -p 5000:5000 --env-file backend/.env --name amrikyy-mvp amrikyy:mvp

# 4. Test
curl http://localhost:5000/health
# Should return: "خادم Amrikyy Unified Backend يعمل وبصحة جيدة!"

# 5. Check MCP Tools
curl http://localhost:5000/api/mcp/tools | jq '.count'
# Should return: 11
```

**✅ Done! MVP running on http://localhost:5000**

---

## 🌐 Option 2: Railway.app (Cloud Deploy)

### Prerequisites
- Railway account (free tier OK)
- GitHub repo pushed

### Steps

1. **Go to:** https://railway.app
2. **Click:** "New Project" → "Deploy from GitHub"
3. **Select:** Your repo
4. **Configure:**
   - Dockerfile path: `backend/Dockerfile`
   - Port: `5000`
5. **Add Environment Variables:**
   - Copy from `backend/.env.test`
   - Add REAL values
6. **Deploy!**

**✅ Done! Railway gives you a public URL!**

---

## 🧪 Test Your MVP

### Test 1: Health Check
```bash
curl https://your-domain.com/health
```

### Test 2: List Tools
```bash
curl https://your-domain.com/api/mcp/tools
```

### Test 3: Store Memory
```bash
curl -X POST https://your-domain.com/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "openmemory_store",
    "params": {
      "agentId": "TestAgent",
      "memoryType": "long_term",
      "key": "first_memory",
      "content": {"message": "Hello MVP!"},
      "namespace": "test"
    }
  }'
```

### Test 4: Query Memory
```bash
curl -X POST https://your-domain.com/api/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "openmemory_query",
    "params": {
      "agentId": "TestAgent",
      "query": "first_memory",
      "queryType": "keyword",
      "namespace": "test"
    }
  }'
```

---

## 📊 What's Available

### API Endpoints (30+)

**Core:**
- `GET /health` - Health check
- `GET /api/mcp/tools` - List 11 MCP tools
- `POST /api/mcp/call` - Execute any tool

**Agency:**
- `POST /api/agency/tasks` - Create agent task
- `GET /api/agency/status` - Agent manager status

**Memory:**
- `POST /api/memory/query` - Query memory
- `POST /api/memory/store` - Store memory

**+ 20 more routes!**

### MCP Tools (11)

1. `openmemory_query` ⭐
2. `openmemory_store` ⭐
3. `search_flights`
4. `search_locations`
5. `get_flight_details`
6. `compare_prices`
7. `analyze_budget`
8. `advanced_chat_indexer`
9. `code_scanner`
10. `codebase_indexer`
11. `comprehensive_scanner`

---

## 🎯 Next Steps

1. ✅ **Deploy MVP** (you just did!)
2. 📝 **Update AIX schemas** (Day 7 remaining)
3. 🎨 **Plan Phase 2** (UI Architect)
4. 🚀 **Build Mini-Apps**

---

## 💡 Pro Tips

- **Logs:** `docker logs -f amrikyy-mvp`
- **Restart:** `docker restart amrikyy-mvp`
- **Stop:** `docker stop amrikyy-mvp`
- **Remove:** `docker rm -f amrikyy-mvp`

---

## 🚨 Troubleshooting

**Container won't start?**
```bash
docker logs amrikyy-mvp
# Check for missing env vars
```

**Can't connect to Redis?**
```bash
# Check REDIS_URL in .env
# Make sure Redis is accessible
```

**Port 5000 in use?**
```bash
docker run -p 8080:5000 ...
# Use different port
```

---

## 🏆 Success!

**Your MVP is now live!** 🎉

- ✅ Backend running
- ✅ 11 MCP tools available
- ✅ OpenMemory working
- ✅ Production-ready

**Total time:** ~5 minutes  
**Status:** DEPLOYED 🚀

---

For detailed deployment guide, see `MVP_DEPLOYMENT_GUIDE.md`
