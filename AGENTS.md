# Amrikyy AI OS - Agent Configuration

**Project**: Amrikyy Travel Agent Platform with AI Operating System  
**Stack**: React + TypeScript + Node.js + Express + Gemini Pro + Supabase + Redis  
**Purpose**: First AI-native Operating System for travel intelligence

---

## 🎯 Project Overview

Amrikyy is building the world's first AI Operating System powered by Google Gemini Pro, combining:
- Complete desktop OS experience (windows, taskbar, file manager, terminal)
- Travel intelligence (Maya AI assistant, booking, trip planning)
- Knowledge graph with 3D visualization
- Multi-platform bots (Telegram, WhatsApp)
- Workflow automation (N8N, MCP servers)
- Voice control and premium animations

---

## 📁 Project Structure

### **Frontend** (`frontend/`)
- **Framework**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **Key Directories**:
  - `src/components/` - Reusable UI components
  - `src/apps/` - OS applications (to be created)
  - `src/components/os/` - OS-level components (to be created)
  - `src/pages/` - Route pages
  - `src/lib/` - Utilities and helpers

### **Backend** (`backend/`)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI**: Google Gemini Pro (`@google/generative-ai`)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis (with memory fallback)
- **Key Directories**:
  - `src/agents/` - AI agents (QuantumGeminiCore, etc.)
  - `src/mcp/` - MCP servers (TravelMCPServer, EducationMCPServer)
  - `src/services/` - Business logic services
  - `src/cache/` - Redis cache implementation
  - `routes/` - API endpoints
  - `middleware/` - Express middleware

---

## 🚀 Common Commands

### Development
```bash
# Frontend
cd frontend
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
cd backend
npm run dev              # Start with nodemon
npm start                # Start production server
npm run quantum-agent    # Run Quantum Gemini Core agent
```

### Testing
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Code Quality
```bash
cd backend
npm run typecheck        # TypeScript type checking
npm run validate-apis    # Validate API endpoints
npm run health-check     # Check system health
```

---

## 🧠 AI & MCP Integration

### **Gemini Models (Student Pack)**
See `GEMINI_STUDENT_PACK.md` for complete configuration.

**Available Models**:
- **gemini-2.0-flash-exp** - Fast model for simple tasks (chat, quick queries)
- **gemini-2.5-pro** - Pro model for complex tasks (planning, analysis) - Student Pack

**Smart Model Selection**:
```javascript
// Use Flash for speed
const fastModel = process.env.GEMINI_MODEL; // gemini-2.0-flash-exp

// Use Pro for quality (Student Pack)
const proModel = process.env.GEMINI_PRO_MODEL; // gemini-2.5-pro
```

**Benefits**:
- ✅ Higher rate limits
- ✅ 2M token context window
- ✅ Free access (Student Pack)
- ✅ Production-ready quality

### **MCP Servers Available**
- **Essential**: filesystem, memory, sequential-thinking
- **Optional**: puppeteer, github, context7, n8n, code-assist

### **AI Agents**
- `QuantumGeminiCore.js` - Main AI agent with quantum reasoning (uses Gemini 2.0 Flash)
- `KarimWithMCP.js` - MCP-enabled agent
- `LunaWithMCP.js` - MCP-enabled agent
- `ScoutWithMCP.js` - MCP-enabled agent
- `GeminiQuantopoCodex.js` - Advanced Gemini agent
- `EmotionalMemorySystem.js` - Memory and emotion tracking

### **MCP Usage**
```javascript
// Access MCP servers
const MCPServerManager = require('./src/services/MCPServerManager');
const manager = new MCPServerManager();
await manager.initialize();
```

---

## 💾 Redis Memory System

### **Cache Configuration**
- **Flight searches**: 5 minutes TTL
- **Hotel searches**: 1 hour TTL
- **AI responses**: 30 minutes TTL
- **Location data**: 24 hours TTL
- **User preferences**: 1 hour TTL

### **Redis Usage**
```javascript
const redisCache = require('./src/cache/RedisCache');

// Cache AI responses
await redisCache.cacheAIResponse(prompt, response);
const cached = await redisCache.getAIResponse(prompt);

// Cache user data
await redisCache.cacheUserPreferences(userId, preferences);
```

### **Fallback Behavior**
- Automatically falls back to in-memory cache if Redis unavailable
- No code changes needed - transparent fallback

---

## 🔑 Environment Variables

### **Required**
```bash
# AI - Gemini Student Pack (see GEMINI_STUDENT_PACK.md)
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_AI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp          # Fast model for simple tasks
GEMINI_PRO_MODEL=gemini-2.5-pro            # Pro model for complex tasks (Student Pack)

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Server
PORT=3000
NODE_ENV=development
```

### **Optional**
```bash
# Redis (falls back to memory cache if not set)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token

# APIs
GOOGLE_MAPS_API_KEY=your-maps-key
```

---

## 📋 Implementation Plan

### **Current Phase**: Foundation Setup
See `AMRIKYY_AI_OS_PLAN.md` for complete 10-phase implementation plan.

### **Next Steps**
1. Create AI OS core module (`backend/src/os/AIOperatingSystem.js`)
2. Build desktop manager (`frontend/src/components/os/DesktopManager.tsx`)
3. Implement window management system
4. Integrate travel intelligence as OS apps

---

## 🎨 Code Style

### **TypeScript/JavaScript**
- Use ES6+ features
- Async/await for promises
- Descriptive variable names
- JSDoc comments for functions

### **React Components**
- Functional components with hooks
- TypeScript interfaces for props
- Use shadcn/ui components when possible
- Framer Motion for animations

### **File Naming**
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Services: `PascalCase.js`
- Routes: `kebab-case.js`

---

## 🔒 Security

### **Authentication**
- JWT tokens for API authentication
- Supabase Auth for user management
- Session management with Redis

### **API Security**
- Rate limiting enabled
- CORS configured
- Helmet.js for headers
- Input validation on all endpoints

---

## 🐛 Debugging

### **Backend Logs**
```bash
# View logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Enable debug mode
DEBUG=* npm run dev
```

### **Redis Debugging**
```bash
# Check Redis connection
redis-cli ping

# View cache stats
curl http://localhost:3000/api/cache/stats
```

### **MCP Debugging**
```bash
# Check MCP server status
curl http://localhost:3000/api/mcp/status
```

---

## 📚 Key Documentation Files

- `AMRIKYY_AI_OS_PLAN.md` - Complete implementation plan (10 phases)
- `GEMINI_STUDENT_PACK.md` - Gemini 2.5 Pro Student Pack configuration ⭐
- `ALL_REPOS_ANALYSIS.md` - Analysis of 25 repositories
- `AI_AGENTS_FORMAT.md` - Agent architecture and AIX format
- `AGENTS_SUMMARY.md` - Quick agent reference
- `FINAL_ANALYSIS_SUMMARY.md` - Executive summary

---

## ⚡ Performance

### **Optimization Guidelines**
- Use Redis caching for repeated queries
- Lazy load OS applications
- Code split by route
- Optimize Gemini Pro API calls (cache responses)
- Use React.memo for expensive components

### **Monitoring**
- LangSmith for AI performance tracking
- Redis stats for cache hit rates
- Express middleware for request timing

---

## 🤝 Git Workflow

### **Branch Naming**
```bash
feature/window-management
fix/redis-connection
enhancement/voice-control
```

### **Commit Messages**
```bash
feat: add window management system
fix: resolve Redis connection timeout
docs: update AGENTS.md with MCP info
refactor: improve cache performance
```

---

## 🎯 IMPORTANT Rules

**ALWAYS**:
- Check if Redis is available before using advanced features
- Use MCP servers through MCPServerManager
- Cache AI responses to reduce API costs
- Follow the implementation plan in AMRIKYY_AI_OS_PLAN.md
- Test with `npm test` before committing
- Use TypeScript for new frontend code
- Document complex logic with comments

**NEVER**:
- Commit API keys or secrets
- Bypass authentication middleware
- Modify database schema without migration
- Use synchronous file operations
- Ignore TypeScript errors
- Skip error handling

---

## 💡 Quick Tips

1. **Starting Development**: Run `npm run dev` in both frontend and backend directories
2. **Testing AI**: Use `npm run quantum-agent` to test Gemini integration
3. **Cache Issues**: Run `redis-cli FLUSHALL` to clear Redis cache
4. **MCP Servers**: Check `backend/src/services/MCPServerManager.js` for available servers
5. **Environment Setup**: Copy `.env.example` to `.env` and fill in values

---

## 📞 Getting Help

- Check existing documentation in `docs/` directory
- Review implementation plan in `AMRIKYY_AI_OS_PLAN.md`
- Examine similar components in `backend/src/agents/`
- Test with curl or Postman for API issues

---

**Last Updated**: October 21, 2025  
**Version**: 1.0.0  
**Status**: Active Development - Phase 1 (Foundation Setup)
