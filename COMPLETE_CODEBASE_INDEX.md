# 📚 Amrikyy AI OS - Complete Codebase Index

**Generated**: 2025-01-23  
**Purpose**: Comprehensive index for AI Studio prompt creation  
**Project**: First AI-native Operating System for Travel Intelligence

---

## 🎯 Executive Summary

**Amrikyy** is a revolutionary AI Operating System combining:
- **Desktop OS Experience**: Full window management, taskbar, file manager, terminal
- **Travel Intelligence**: Maya AI assistant, booking, trip planning
- **Multi-Agent System**: 15+ specialized AI agents with MCP integration
- **Real-time Streaming**: SSE-based AI responses with cancelation support
- **Production-Ready**: Metrics, monitoring, caching, rate limiting

**Tech Stack**:
- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + Framer Motion
- **Backend**: Node.js + Express + Gemini Pro + Supabase + Redis
- **AI**: Google Gemini 2.0 Flash + 2.5 Pro (Student Pack)
- **Infrastructure**: LangSmith tracing, Prometheus metrics, Redis caching

---

## 📁 Project Structure

```
Amrikyy-Agent/
├── backend/                    # Node.js Express Backend
│   ├── src/
│   │   ├── agents/            # AI Agents (15+ specialized)
│   │   ├── services/          # Business logic services
│   │   ├── routes/            # API endpoints (70+ routes)
│   │   ├── middleware/        # Auth, rate limiting, validation
│   │   ├── cache/             # Redis + Memory cache
│   │   ├── mcp/               # MCP servers integration
│   │   ├── os/                # AI Operating System core
│   │   ├── memory/            # Knowledge graph, vector memory
│   │   ├── monitoring/        # Performance, health monitoring
│   │   └── utils/             # Helpers, logger, clients
│   ├── routes/                # Legacy routes (being migrated)
│   ├── server.js              # Main Express server
│   └── package.json           # Dependencies
│
├── frontend/                   # React TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── os/           # OS-level components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── desktop/      # Desktop components
│   │   │   ├── mobile/       # Mobile-optimized components
│   │   │   └── tablet/       # Tablet-optimized components
│   │   ├── apps/             # OS applications
│   │   ├── mini-apps/        # Mini applications
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API clients
│   │   ├── lib/              # Utilities
│   │   └── types/            # TypeScript types
│   └── package.json          # Dependencies
│
└── docs/                      # Documentation
    ├── AMRIKYY_AI_OS_PLAN.md # 10-phase implementation plan
    ├── GEMINI_STUDENT_PACK.md # Gemini configuration
    └── AI_AGENTS_FORMAT.md    # Agent architecture
```

---

## 🧠 Backend Architecture

### **Core Server** (`backend/server.js`)
```javascript
// Main Express server with:
- Security: Helmet, CORS
- Metrics: Prometheus integration
- Rate Limiting: 7-tier system
- Authentication: JWT tokens
- Health Checks: Liveness/readiness probes
- Error Handling: Centralized middleware
```

**Key Features**:
- ✅ Automatic metrics collection for all HTTP requests
- ✅ Multi-tier rate limiting (general, auth, AI, streaming)
- ✅ JWT authentication with Supabase integration
- ✅ Comprehensive error handling and logging

---

### **AI Agents** (`backend/src/agents/`)

#### **1. Multi-Agent Coordinator** (`MultiAgentCoordinator.js`)
```javascript
// Routes requests to specialized agents
- Uses Gemini Pro for intelligent routing
- Supports: travel, content, health, finance, general
- Fallback to general agent on errors
```

#### **2. Specialized Agents**
| Agent | File | Purpose |
|-------|------|---------|
| **Travel** | `TravelAgent.js` | Travel planning, bookings, recommendations |
| **Content** | `ContentAgent.js` | Content creation, writing, marketing |
| **Health** | `HealthAgent.js` | Health advice, wellness tips |
| **Finance** | `FinanceAgent.js` | Financial guidance, budgeting |
| **General** | `GeneralAgent.js` | General queries, casual conversation |

#### **3. Advanced Agents**
| Agent | File | Purpose |
|-------|------|---------|
| **Quantum Gemini Core** | `QuantumGeminiCore.js` | Main AI with quantum reasoning |
| **Karim (MCP)** | `KarimWithMCP.js` | MCP-enabled agent |
| **Luna (MCP)** | `LunaWithMCP.js` | MCP-enabled agent |
| **Scout (MCP)** | `ScoutWithMCP.js` | MCP-enabled agent |
| **Gemini Quantopo** | `GeminiQuantopoCodex.js` | Advanced Gemini agent |
| **Emotional Memory** | `EmotionalMemorySystem.js` | Memory & emotion tracking |

#### **4. Streaming Agents**
- **AgentStreaming.js**: Real-time SSE streaming with metrics
- **AgentLangSmith.js**: LangSmith tracing integration

---

### **Services** (`backend/src/services/`)

#### **1. Stream Service** (`streamService.js`)
```javascript
// Enhanced streaming with cancelation support
Features:
- Client disconnect detection
- Immediate LLM cancelation
- Cost tracking (saved API calls)
- LangSmith tracing
- Prometheus metrics
- Automatic cleanup

Statistics:
- Total streams
- Canceled streams
- Completed streams
- Cost saved
- Cancelation rate
```

#### **2. Metrics Service** (`metricsService.js`)
```javascript
// Comprehensive Prometheus metrics (40+ metrics)
Categories:
- HTTP: Request duration, total requests, active connections
- Agents: Request total, duration by agent
- Streaming: Total streams, chunks, duration, active streams
- LLM: Tokens used, estimated cost
- Cache: Hits, misses, hit rate
- Errors: Total errors by type
- Rate Limits: Hits by limiter type
- Database: Query duration, connection pool

Dashboard: /api/metrics/dashboard (HTML)
Prometheus: /api/metrics (text/plain)
JSON: /api/metrics/json
Snapshot: /api/metrics/snapshot
```

#### **3. MCP Server Manager** (`MCPServerManager.js`)
```javascript
// Manages Model Context Protocol servers
Available Servers:
- filesystem: File operations
- memory: Persistent memory
- sequential-thinking: Step-by-step reasoning
- puppeteer: Web automation
- github: GitHub integration
- context7: Context management
- n8n: Workflow automation
- code-assist: Code assistance
```

#### **4. Other Services**
| Service | File | Purpose |
|---------|------|---------|
| **Booking.com** | `BookingComService.js` | Hotel search integration |
| **Kiwi Tequila** | `KiwiTequilaService.js` | Flight search integration |
| **Sabre** | `SabreService.js` | GDS integration |
| **Google Maps** | `GoogleMapsService.js` | Location services |
| **Google Vision** | `GoogleVisionService.js` | Image analysis |
| **NotebookLM** | `NotebookLMService.js` | AI notebook integration |
| **YouTube** | `YouTubeAutomationService.js` | YouTube automation |
| **Stripe** | `stripeService.js` | Payment processing |
| **Encryption** | `EncryptionService.js` | Data encryption |
| **Secure Vault** | `SecureVaultService.js` | Secret management |

---

### **Caching System** (`backend/src/cache/`)

#### **Redis Cache** (`RedisCache.js`)
```javascript
// Hybrid Redis + Memory cache with automatic fallback
Features:
- Transparent fallback to memory if Redis unavailable
- Automatic cleanup of expired entries
- TTL support
- Statistics tracking

Cache TTLs:
- Flight searches: 5 minutes
- Hotel searches: 1 hour
- AI responses: 30 minutes
- Location data: 24 hours
- User preferences: 1 hour

Methods:
- get(key): Get cached value
- set(key, value, ttl): Set with TTL
- delete(key): Remove entry
- clear(): Clear all cache
- getStats(): Get cache statistics
```

---

### **Middleware** (`backend/src/middleware/`)

#### **1. Rate Limiter** (`rateLimiter.js`)
```javascript
// 7-Tier Rate Limiting System
1. General API: 100 req/15min
2. Authentication: 5 req/15min
3. AI Agents: 20 req/15min
4. Streaming: 10 req/15min
5. File Upload: 5 req/15min
6. Search: 30 req/15min
7. Admin: 50 req/15min

Features:
- Automatic metrics recording
- Custom error messages
- Retry-After headers
```

#### **2. Authentication** (`auth.js`)
```javascript
// JWT Authentication
- Bearer token validation
- Token generation (24h expiry)
- User info extraction
- Supabase integration
```

#### **3. Validation** (`validation.js`)
```javascript
// Express-validator middleware
Validators:
- Stream requests
- Agent requests
- Auth (register/login)
- Object IDs
- Pagination
- Search queries
- Date ranges
```

---

### **Routes** (`backend/src/routes/`)

#### **Core Routes**
| Route | File | Purpose | Auth |
|-------|------|---------|------|
| `/api/health` | `health.js` | Health checks | ❌ |
| `/api/metrics` | `metrics.js` | Prometheus metrics | ❌ |
| `/api/auth` | `auth.js` | Authentication | ❌ |
| `/api/agents` | `agents.js` | AI agents | ✅ |
| `/api/stream` | `streamRoutes.js` | SSE streaming | ✅ |

#### **Health Endpoints**
```javascript
GET /api/health              // Basic health check
GET /api/health/live         // Liveness probe (K8s)
GET /api/health/ready        // Readiness probe (checks deps)
GET /api/status              // Detailed status
```

#### **Metrics Endpoints**
```javascript
GET /api/metrics             // Prometheus format
GET /api/metrics/json        // JSON format
GET /api/metrics/snapshot    // Current snapshot
GET /api/metrics/dashboard   // HTML dashboard
```

#### **Streaming Endpoints**
```javascript
POST /api/stream/:agent      // Stream AI responses (SSE)
  Params: agent (travel|content|health|finance|general)
  Query: prompt, userId
  
GET /api/stream/stats        // Streaming statistics
```

---

### **AI Operating System** (`backend/src/os/`)

#### **AIOperatingSystem.js**
```javascript
// Core OS module (to be implemented)
Features:
- Process management
- Window management
- File system
- Application lifecycle
- System services
- Inter-app communication
```

---

### **Memory Systems** (`backend/src/memory/`)

| System | File | Purpose |
|--------|------|---------|
| **Knowledge Graph** | `KnowledgeGraph.js` | Entity relationships |
| **Vector Memory** | `VectorMemorySystem.js` | Semantic search |
| **Smart Memory** | `SmartMemoryManager.js` | Intelligent caching |
| **Semantic Search** | `SemanticSearchEngine.js` | Context-aware search |

---

### **Monitoring** (`backend/src/monitoring/`)

| Monitor | File | Purpose |
|---------|------|---------|
| **LangSmith** | `LangSmithMonitor.js` | AI tracing |
| **Performance** | `PerformanceMonitor.js` | Performance tracking |
| **Health** | `SmartHealthMonitor.js` | System health |
| **Consolidated** | `ConsolidatedMonitor.js` | Unified monitoring |

---

## 🎨 Frontend Architecture

### **Core App** (`frontend/src/App.tsx`)
```typescript
// Main React application
- React Router setup
- Global state management
- Theme provider
- Error boundaries
```

### **Components** (`frontend/src/components/`)

#### **OS Components** (`components/os/`)
| Component | File | Purpose |
|-----------|------|---------|
| **Desktop OS** | `DesktopOS.tsx` | Main desktop interface |
| **App Launcher** | `AppLauncher.tsx` | Application launcher |
| **System Tray** | `SystemTray.tsx` | System tray |
| **Quick Search** | `QuickSearch.tsx` | Quick search bar |

#### **UI Components** (`components/ui/`)
- **shadcn/ui**: button, card, dialog, input, select, tabs, etc.
- **Custom**: AnimatedIcon, VoiceInterface, RippleEffect, Loading
- **AI-Enhanced**: AIEnhancedComponents.tsx

#### **Layout Components** (`components/layout/`)
| Component | File | Purpose |
|-----------|------|---------|
| **App Layout** | `AppLayout.tsx` | Main layout wrapper |
| **Header** | `Header.tsx` | Top navigation |
| **Footer** | `Footer.tsx` | Footer |
| **Window** | `Window.tsx` | Window component |

#### **Desktop Components** (`components/desktop/`)
- **DesktopTaskbar.tsx**: Desktop taskbar

#### **Mobile Components** (`components/mobile/`)
- **MobileDock.tsx**: Mobile dock
- **AppDrawer.tsx**: App drawer
- **BottomSheet.tsx**: Bottom sheet
- **FloatingActionButton.tsx**: FAB
- **TouchButton.tsx**: Touch-optimized button

#### **Tablet Components** (`components/tablet/`)
- **TabletTaskbar.tsx**: Tablet taskbar
- **SplitView.tsx**: Split view

---

### **Applications** (`frontend/src/apps/`)

| App | File | Purpose |
|-----|------|---------|
| **Maya Travel** | `MayaTravelApp.tsx` | Main travel app |
| **Trip Planner** | `TripPlannerApp.tsx` | Trip planning |
| **Settings** | `SettingsApp.tsx` | System settings |

---

### **Mini Apps** (`frontend/src/mini-apps/`)

| Mini App | File | Purpose |
|----------|------|---------|
| **Dashboard** | `DashboardMiniApp.tsx` | Dashboard widget |
| **Karim** | `KarimMiniApp.tsx` | Karim agent widget |
| **Luna** | `LunaMiniApp.tsx` | Luna agent widget |
| **Kody** | `KodyMiniApp.tsx` | Kody agent widget |

---

### **Pages** (`frontend/src/pages/`)

| Page | File | Purpose |
|------|------|---------|
| **Home** | `Home.tsx` | Landing page |
| **OS Demo** | `OSDemo.tsx` | OS demonstration |
| **Desktop** | `DemoDesktop.tsx` | Desktop demo |
| **Mobile Demo** | `MobileOSDemo.tsx` | Mobile OS demo |
| **AI Dashboard** | `AIUIDashboard.tsx` | AI dashboard |
| **SEO Dashboard** | `SEODashboard.tsx` | SEO analytics |
| **Codebase Explorer** | `CodebaseExplorer.tsx` | Code explorer |

---

### **Hooks** (`frontend/src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| **useDeviceType** | `useDeviceType.ts` | Device detection |
| **useVoice** | `useVoice.ts` | Voice control |
| **useKeyboardShortcuts** | `useKeyboardShortcuts.ts` | Keyboard shortcuts |
| **useTouchGestures** | `useTouchGestures.ts` | Touch gestures |
| **useAccessibility** | `useAccessibility.ts` | Accessibility |
| **useMicroInteractions** | `useMicroInteractions.ts` | Micro-interactions |
| **useSound** | `use-sound.ts` | Sound effects |
| **useRealTimeData** | `use-real-time-data.ts` | Real-time data |

---

### **Services** (`frontend/src/services/`)

#### **API Client** (`api.ts`)
```typescript
// Axios-based API client
Features:
- Automatic token injection
- Error handling
- Request/response interceptors
- Base URL configuration
```

#### **Streaming Client** (`lib/StreamingClient.js`)
```javascript
// SSE streaming client
Features:
- Event-based streaming
- Automatic reconnection
- Error handling
- Cancelation support
```

---

### **Types** (`frontend/src/types/`)

| Type File | Purpose |
|-----------|---------|
| `os.types.ts` | OS-level types |
| `window.types.ts` | Window management types |
| `desktop.ts` | Desktop types |
| `index.ts` | General types |

---

## 🔑 Environment Variables

### **Backend** (`.env`)
```bash
# AI - Gemini Student Pack
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_AI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp          # Fast model
GEMINI_PRO_MODEL=gemini-2.5-pro            # Pro model (Student Pack)

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

# Redis (optional - falls back to memory)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# LangSmith (optional)
LANGSMITH_API_KEY=your-langsmith-key

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your-bot-token

# APIs (optional)
GOOGLE_MAPS_API_KEY=your-maps-key
```

---

## 📊 Key Metrics

### **Performance Metrics**
- **HTTP Request Duration**: Histogram (0.1s to 10s buckets)
- **Active Connections**: Gauge
- **Request Total**: Counter by method, route, status

### **AI Metrics**
- **Agent Requests**: Counter by agent, status
- **Agent Duration**: Histogram by agent
- **LLM Tokens**: Counter by agent, type (input/output)
- **LLM Cost**: Counter by agent

### **Streaming Metrics**
- **Stream Total**: Counter by agent, status
- **Stream Chunks**: Counter by agent
- **Stream Duration**: Histogram by agent
- **Active Streams**: Gauge by agent

### **Cache Metrics**
- **Cache Hits**: Counter by cache type
- **Cache Misses**: Counter by cache type
- **Hit Rate**: Calculated metric

### **Error Metrics**
- **Errors Total**: Counter by type, agent
- **Rate Limit Hits**: Counter by limiter type

---

## 🚀 API Endpoints Summary

### **Total Endpoints**: 70+

#### **Categories**:
1. **Health & Monitoring** (4 endpoints)
   - `/api/health`, `/api/health/live`, `/api/health/ready`, `/api/status`

2. **Metrics** (4 endpoints)
   - `/api/metrics`, `/api/metrics/json`, `/api/metrics/snapshot`, `/api/metrics/dashboard`

3. **Authentication** (3 endpoints)
   - `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`

4. **AI Agents** (6 endpoints)
   - `/api/agents/chat`, `/api/agents/route`, `/api/agents/:agent`

5. **Streaming** (2 endpoints)
   - `/api/stream/:agent`, `/api/stream/stats`

6. **Travel** (15+ endpoints)
   - Flights, hotels, destinations, bookings, trips

7. **Automation** (10+ endpoints)
   - Workflows, tasks, integrations

8. **Analytics** (5+ endpoints)
   - Dashboard, reports, insights

9. **Payments** (5+ endpoints)
   - Stripe, crypto, webhooks

10. **Communication** (10+ endpoints)
    - Telegram, WhatsApp, Discord, email

---

## 🎯 Implementation Status

### **✅ Completed (Phase 1)**
- [x] Backend server with Express
- [x] Multi-agent system (15+ agents)
- [x] Streaming with SSE
- [x] Metrics & monitoring (Prometheus)
- [x] Caching (Redis + Memory)
- [x] Rate limiting (7-tier)
- [x] Authentication (JWT)
- [x] Health checks
- [x] LangSmith tracing
- [x] MCP integration

### **🚧 In Progress (Phase 2)**
- [ ] AI Operating System core
- [ ] Desktop window management
- [ ] File system integration
- [ ] Application lifecycle
- [ ] Inter-app communication

### **📋 Planned (Phase 3-10)**
- [ ] 3D Knowledge Graph
- [ ] Voice control
- [ ] Multi-platform bots
- [ ] Workflow automation
- [ ] Premium animations
- [ ] Mobile optimization
- [ ] Tablet optimization
- [ ] Production deployment

---

## 🔧 Development Commands

### **Backend**
```bash
cd backend
npm run dev              # Start with nodemon
npm start                # Production server
npm test                 # Run tests
npm run quantum-agent    # Run Quantum Gemini Core
```

### **Frontend**
```bash
cd frontend
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### **Testing**
```bash
cd backend
npm test                 # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## 📚 Key Documentation Files

1. **AMRIKYY_AI_OS_PLAN.md** - Complete 10-phase implementation plan
2. **GEMINI_STUDENT_PACK.md** - Gemini 2.5 Pro Student Pack configuration
3. **AI_AGENTS_FORMAT.md** - Agent architecture and AIX format
4. **AGENTS_SUMMARY.md** - Quick agent reference
5. **ALL_REPOS_ANALYSIS.md** - Analysis of 25 repositories
6. **FINAL_ANALYSIS_SUMMARY.md** - Executive summary

---

## 🎨 Code Patterns

### **Agent Pattern**
```javascript
class Agent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async processRequest(userMessage) {
    const prompt = `System prompt...\n\nUser: ${userMessage}`;
    const result = await this.model.generateContent(prompt);
    return { success: true, response: result.response.text() };
  }
}
```

### **Streaming Pattern**
```javascript
async *streamResponse(prompt) {
  const result = await this.model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}
```

### **Caching Pattern**
```javascript
const cached = await cache.get(key);
if (cached) return cached;

const result = await expensiveOperation();
await cache.set(key, result, ttl);
return result;
```

### **Metrics Pattern**
```javascript
const startTime = Date.now();
try {
  const result = await operation();
  metricsService.recordSuccess(duration);
  return result;
} catch (error) {
  metricsService.recordError(error.name);
  throw error;
}
```

---

## 🔐 Security Features

1. **Authentication**: JWT tokens with 24h expiry
2. **Rate Limiting**: 7-tier system with automatic blocking
3. **Input Validation**: Express-validator on all inputs
4. **Encryption**: AES-256 for sensitive data
5. **Secure Vault**: Secret management with encryption
6. **CORS**: Configured for specific origins
7. **Helmet**: Security headers
8. **SQL Injection**: Parameterized queries
9. **XSS Protection**: Input sanitization

---

## 📈 Performance Optimizations

1. **Caching**: Redis + Memory hybrid with automatic fallback
2. **Streaming**: SSE with cancelation to save API costs
3. **Code Splitting**: Lazy loading for frontend
4. **Compression**: Gzip for API responses
5. **Connection Pooling**: Database connection reuse
6. **Metrics**: Low-overhead Prometheus metrics
7. **Rate Limiting**: Prevents abuse and overload

---

## 🌐 Multi-Platform Support

### **Desktop** (Primary)
- Full OS experience
- Window management
- Keyboard shortcuts
- Mouse interactions

### **Mobile** (Optimized)
- Touch gestures
- Bottom sheet
- App drawer
- Floating action button

### **Tablet** (Optimized)
- Split view
- Tablet taskbar
- Touch + keyboard

### **Web** (Universal)
- Responsive design
- Progressive Web App
- Offline support

---

## 🎯 Next Steps (Phase 2)

1. **Create AI OS Core Module**
   - File: `backend/src/os/AIOperatingSystem.js`
   - Features: Process management, window lifecycle, IPC

2. **Build Desktop Manager**
   - File: `frontend/src/components/os/DesktopManager.tsx`
   - Features: Window management, taskbar, system tray

3. **Implement Window System**
   - File: `frontend/src/components/layout/WindowManager.tsx`
   - Features: Drag, resize, minimize, maximize, close

4. **Integrate Travel Intelligence**
   - Convert travel features to OS apps
   - Add to app launcher
   - Implement inter-app communication

---

## 📞 Support & Resources

- **GitHub**: https://github.com/Moeabdelaziz007/Amrikyy-Agent
- **Documentation**: `/docs` directory
- **Metrics Dashboard**: http://localhost:3000/api/metrics/dashboard
- **Health Check**: http://localhost:3000/api/health

---

**Last Updated**: 2025-01-23  
**Version**: 1.0.0  
**Status**: Phase 1 Complete, Phase 2 In Progress
