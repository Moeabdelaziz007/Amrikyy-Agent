# 🚀 Quick Start Guide - Amrikyy Agent Phase 1

**Status:** ✅ Phase 1 Complete  
**Ready to:** Test the new unified backend

---

## ⚡ 3-Minute Setup

### Step 1: Install TypeScript Dependencies

```bash
cd backend
npm install
```

This installs the new TypeScript dependencies added to package.json.

### Step 2: Create Environment File

```bash
# Copy the example
cp .env.example .env

# Edit with your actual keys
nano .env
```

**Minimum required variables:**
```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_NEW_KEY_HERE
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_key
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secure_jwt_secret_min_32_chars
PORT=5000
NODE_ENV=development
```

### Step 3: Start Redis (if not running)

```bash
# macOS with Homebrew
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### Step 4: Run Development Server

```bash
# Option A: New TypeScript server (recommended)
npm run dev

# Option B: Old JavaScript server (backward compatibility)
npm run dev:old
```

---

## ✅ Verify Installation

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected:** JSON response with `"status": "UP"`

### Test 2: Agent System
```bash
curl http://localhost:5000/api/agents
```

**Expected:** List of registered agents (may be empty initially)

### Test 3: Security Check
```bash
npm run security-check
```

**Expected:** ✅ All checks pass

---

## 🔧 Common Issues & Fixes

### Issue: "Module not found: typescript"
**Fix:** Run `npm install` in backend directory

### Issue: "OPENROUTER_API_KEY is required"
**Fix:** Create `.env` file from `.env.example` and add your key

### Issue: "Redis Client Error"
**Fix:** Start Redis server (see Step 3 above)

### Issue: Port 5000 already in use
**Fix:** Change `PORT=5001` in `.env` file

---

## 📖 What Got Built

### Security (Priority 1)
- ✅ All API keys now from environment variables
- ✅ Hardcoded secrets removed
- ✅ Automated security scanner
- ✅ Environment validation on startup

### Backend (Priority 2)
- ✅ Unified TypeScript server (`backend/src/server.ts`)
- ✅ Professional middleware (helmet, CORS, rate limiting)
- ✅ Global error handling
- ✅ Request logging with IDs
- ✅ Performance monitoring

### Agent System (Priority 3)
- ✅ Enhanced BaseAgent with stats tracking
- ✅ AgentManager with Redis queuing
- ✅ Priority task system
- ✅ Retry logic
- ✅ LangSmith tracing support
- ✅ REST API for agent control

### Configuration (Priority 4)
- ✅ TypeScript configured
- ✅ Build scripts
- ✅ Docker updated
- ✅ Development workflow

---

## 📁 Key Files to Know

### New Entry Point:
- **`backend/src/server.ts`** - Main server (TypeScript)

### Configuration:
- **`backend/src/config/env.ts`** - Environment validation
- **`backend/tsconfig.json`** - TypeScript config

### Agent System:
- **`backend/src/agents/BaseAgent.ts`** - Base class
- **`backend/src/agents/AgentManager.ts`** - Coordinator
- **`backend/src/routes/agents.ts`** - API endpoints

### Security:
- **`backend/.env.example`** - Template
- **`backend/scripts/security-check.sh`** - Scanner

---

## 🎯 Next Steps (Phase 2)

Now that Phase 1 is complete, you can:

1. **Register your first agents** with AgentManager
2. **Create agent tasks** via the API
3. **Build Phase 2 features** on this solid foundation

### Example: Register an Agent

```typescript
import { AgentManager } from './agents/AgentManager';
import { MyCustomAgent } from './agents/MyCustomAgent';

const manager = new AgentManager();
const myAgent = new MyCustomAgent();

await manager.registerAgent(myAgent);
```

### Example: Execute a Task

```bash
curl -X POST http://localhost:5000/api/agents/my-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "action": "do_something",
      "params": {}
    }
  }'
```

---

## 🆘 Need Help?

### Documentation:
- See `PHASE1_COMPLETION_SUMMARY.md` for full details
- See `openmemory.md` for project overview
- See inline code comments for specifics

### Logs:
```bash
# Watch logs in development
npm run dev

# Check for errors
tail -f backend/logs/err.log
```

### Debugging:
```bash
# Type check without running
npm run typecheck

# Build to check for compilation errors
npm run build
```

---

## ✅ Checklist Before Moving to Phase 2

- [ ] Development server starts without errors
- [ ] Health check returns 200 OK
- [ ] Security check passes
- [ ] Environment variables configured
- [ ] Redis connected
- [ ] TypeScript compilation works

---

**Ready to build amazing AI agents!** 🚀

*Phase 1 Foundation = Solid ✅*  
*Next: Phase 2 Advanced Features 🎯*
