# 🤖 Ona Agent Setup - Complete Configuration

**Goal**: Configure Ona (Gitpod Agent) with MCP access, Redis memory, and full project context.

**Date**: October 21, 2025  
**Status**: ✅ Ready to Configure

---

## 🎯 What You're Setting Up

Ona Agent will have:
1. **Full Project Context** - Understands Amrikyy AI OS structure via `AGENTS.md`
2. **MCP Server Access** - Can use filesystem, memory, sequential-thinking, and more
3. **Redis Memory** - Persistent memory across sessions
4. **Gemini Pro Integration** - Access to your Student Pack models

---

## ✅ STEP 1: AGENTS.md File (Already Created)

The `AGENTS.md` file has been created in your repository root. This file is **automatically loaded** by Ona Agent at the start of every conversation.

**What it contains**:
- Project structure and key directories
- Common commands for development
- AI & MCP integration details
- Redis memory system configuration
- Environment variables needed
- Code style guidelines
- Important rules and tips

**Ona will automatically read this file** - no additional configuration needed!

---

## ✅ STEP 2: Environment Variables in Gitpod

Go to: `https://app.gitpod.io/settings/variables`

Add these environment variables with scope `Moeabdelaziz007/Amrikyy-Agent`:

### **Required Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | `AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0` | Your Gemini API key |
| `GOOGLE_AI_API_KEY` | `AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0` | Same as GEMINI_API_KEY |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | Fast model |
| `GEMINI_PRO_MODEL` | `gemini-2.5-pro` | Pro model (Student Pack) |
| `SUPABASE_URL` | `https://driujancggfxgdsuyaih.supabase.co` | Supabase URL |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon key |
| `JWT_SECRET` | `f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624` | JWT secret |
| `NODE_ENV` | `development` | Environment |

### **Optional Variables (Redis)**

| Variable | Value | Description |
|----------|-------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

**Note**: If Redis is not configured, the system automatically falls back to in-memory cache.

---

## ✅ STEP 3: MCP Server Configuration

MCP servers are already configured in your project via `MCPServerManager.js`.

**Essential MCP Servers** (automatically initialized):
- `filesystem` - File system operations
- `memory` - Persistent memory storage
- `sequential-thinking` - Step-by-step reasoning

**Optional MCP Servers** (loaded if available):
- `puppeteer` - Browser automation
- `github` - GitHub integration
- `context7` - Context management
- `n8n` - Workflow automation
- `code-assist` - Code assistance

**No additional configuration needed** - Ona Agent will have access to these through your codebase.

---

## ✅ STEP 4: Redis Memory Setup (Optional)

### **Option A: Use In-Memory Cache (Default)**
No setup needed! The system automatically uses in-memory cache if Redis is not available.

**Pros**:
- ✅ No configuration needed
- ✅ Works immediately
- ✅ Good for development

**Cons**:
- ❌ Memory lost on restart
- ❌ Not shared across instances

### **Option B: Use Redis (Recommended for Production)**

**Install Redis locally**:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG
```

**Or use Redis Cloud** (free tier):
1. Go to: https://redis.com/try-free/
2. Create free account
3. Create database
4. Copy connection URL
5. Add to Gitpod environment variables

---

## ✅ STEP 5: Verify Setup

### **Check AGENTS.md is loaded**
1. Open a new Gitpod workspace
2. Start Ona Agent
3. Ask: "What is this project about?"
4. Ona should reference information from AGENTS.md

### **Check Environment Variables**
```bash
# In Gitpod terminal
echo $GEMINI_API_KEY
echo $SUPABASE_URL
echo $REDIS_URL
```

### **Check MCP Servers**
```bash
cd backend
npm install
node -e "const MCPServerManager = require('./src/services/MCPServerManager'); const m = new MCPServerManager(); m.initialize().then(() => console.log('MCP OK'));"
```

### **Check Redis Connection**
```bash
cd backend
node -e "const redis = require('./src/cache/RedisCache'); console.log('Redis enabled:', redis.isEnabled());"
```

---

## 🎯 How Ona Agent Will Use This Setup

### **1. Project Understanding**
Ona automatically reads `AGENTS.md` and understands:
- Your project structure
- Available commands
- Code conventions
- Key files and directories

### **2. MCP Server Access**
Ona can use MCP servers through your codebase:
```javascript
// Ona can help you write code like this:
const MCPServerManager = require('./src/services/MCPServerManager');
const manager = new MCPServerManager();
await manager.initialize();
```

### **3. Redis Memory**
Ona can help you implement caching:
```javascript
// Ona understands your Redis setup:
const redisCache = require('./src/cache/RedisCache');
await redisCache.cacheAIResponse(prompt, response);
```

### **4. Gemini Integration**
Ona knows about your Gemini Student Pack:
- Fast model: `gemini-2.0-flash-exp`
- Pro model: `gemini-2.5-pro`
- Can help optimize model selection

---

## 💡 Using Ona Agent Effectively

### **Ask About Project Structure**
```
"Show me the backend directory structure"
"Where are the AI agents located?"
"What MCP servers are available?"
```

### **Request Code Generation**
```
"Create a new OS window component"
"Add Redis caching to this function"
"Implement MCP filesystem access"
```

### **Get Implementation Help**
```
"How do I use the QuantumGeminiCore agent?"
"Show me how to cache AI responses"
"What's the best way to integrate MCP servers?"
```

### **Follow the Implementation Plan**
```
"Let's start Phase 1 of the AI OS plan"
"Create the desktop manager component"
"Implement window management system"
```

---

## 🔥 Advanced: Custom Ona Commands

You can create custom slash commands for your organization (Enterprise feature), but for now, Ona will work with the `AGENTS.md` file automatically.

---

## 📊 What Ona Agent Can Do Now

### **✅ Understands Your Project**
- Knows about Amrikyy AI OS
- Understands the 10-phase implementation plan
- Familiar with your tech stack
- Knows your code conventions

### **✅ Has Context About**
- MCP servers and how to use them
- Redis caching system
- Gemini Pro Student Pack
- Project structure and key files
- Environment variables needed

### **✅ Can Help With**
- Writing new code following your conventions
- Implementing features from the AI OS plan
- Debugging issues with MCP or Redis
- Optimizing Gemini API usage
- Creating new components and services

### **✅ Follows Your Rules**
- Uses TypeScript for frontend
- Caches AI responses
- Tests before committing
- Documents complex logic
- Never commits secrets

---

## 🎯 Quick Start Checklist

- [ ] `AGENTS.md` file created in repository root ✅ (Done)
- [ ] Environment variables added to Gitpod settings
- [ ] Redis installed (optional) or using in-memory cache
- [ ] MCP servers configured (already done in code)
- [ ] Tested Ona Agent can read AGENTS.md
- [ ] Verified environment variables are loaded
- [ ] Ready to start development!

---

## 🚀 Next Steps

### **1. Test Ona Agent**
Open a new Gitpod workspace and ask Ona:
```
"What is the Amrikyy AI OS project?"
"Show me the implementation plan"
"What MCP servers are available?"
```

### **2. Start Development**
Follow the implementation plan:
```
"Let's start Phase 1: Foundation Setup"
"Create the AI OS core module"
"Build the desktop manager component"
```

### **3. Use MCP Servers**
```
"Help me use the filesystem MCP server"
"Show me how to implement memory persistence"
"Create a sequential-thinking workflow"
```

---

## 🐛 Troubleshooting

### **Ona doesn't seem to know about the project**
- Verify `AGENTS.md` is in repository root
- Start a new conversation (Ona loads AGENTS.md at start)
- Check file is committed to git

### **Environment variables not working**
- Verify variables are set in Gitpod settings
- Check scope is set to your repository
- Restart the workspace

### **MCP servers not available**
- Check `backend/src/services/MCPServerManager.js` exists
- Run `npm install` in backend directory
- Verify Node.js version is 18+

### **Redis connection fails**
- System automatically falls back to memory cache
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL environment variable

---

## 📚 Additional Resources

- **AGENTS.md** - Project configuration (auto-loaded by Ona)
- **AMRIKYY_AI_OS_PLAN.md** - Complete implementation plan
- **GEMINI_STUDENT_PACK.md** - Gemini configuration
- **ALL_REPOS_ANALYSIS.md** - Repository analysis
- **Ona Documentation**: https://ona.com/docs

---

## ✅ Summary

**What's Configured**:
1. ✅ AGENTS.md file with complete project context
2. ✅ Environment variables guide for Gitpod
3. ✅ MCP server integration (already in code)
4. ✅ Redis memory system (with fallback)
5. ✅ Gemini Pro Student Pack configuration

**What Ona Agent Can Do**:
- Understand your entire project structure
- Access MCP servers through your code
- Help implement the AI OS plan
- Follow your code conventions
- Use Redis for caching
- Optimize Gemini API usage

**Ready to Start**: Yes! Just add environment variables to Gitpod and start coding.

---

**Created by**: Ona AI Assistant  
**Date**: October 21, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready to Use
