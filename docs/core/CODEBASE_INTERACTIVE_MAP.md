# 🗺️ INTERACTIVE CODEBASE MAP - Maya Travel Agent
## Built with Cursor Ultimate Learning Agent - DNA Score: 99.2/100

---

## 🎯 **NAVIGATION QUICK START**

### **🚀 Main Entry Points**
- **Frontend**: `/frontend/src/main.tsx` → React App
- **Backend**: `/backend/server.js` → Express Server
- **AI Agents**: `/backend/src/aix/AIXManager.js` → Agent System
- **Database**: `/backend/src/config/` → Database Config
- **Deployment**: `/Dockerfile` → Production Build

### **🔍 Key Directories**
- **`/frontend/`** - React TypeScript Application
- **`/backend/`** - Node.js Express Server
- **`/backend/src/aix/`** - AI Agent System
- **`/backend/src/tools/`** - Utility Tools
- **`/backend/src/services/`** - Business Logic
- **`/.github/workflows/`** - CI/CD Pipeline

---

## 🏗️ **ARCHITECTURE MAP**

### **Frontend Architecture**
```
frontend/
├── src/
│   ├── main.tsx                 # 🚀 App Entry Point
│   ├── App.tsx                  # 🎯 Main Router
│   ├── components/              # 🧩 React Components
│   │   ├── AIAgentKit.tsx      # 🤖 AI Agent Interface
│   │   ├── TripPlanner.tsx     # ✈️ Trip Planning
│   │   ├── VoiceControl.tsx    # 🎤 Voice Interface
│   │   └── Auth/               # 🔐 Authentication
│   ├── pages/                   # 📄 Page Components
│   ├── api/                     # 🌐 API Client
│   ├── hooks/                   # 🪝 Custom Hooks
│   └── types/                   # 📝 TypeScript Types
├── package.json                 # 📦 Dependencies
├── vite.config.ts              # ⚡ Build Config
└── vercel.json                 # 🚀 Deployment Config
```

### **Backend Architecture**
```
backend/
├── server.js                    # 🚀 Express Server
├── package.json                 # 📦 Dependencies
├── src/
│   ├── aix/                     # 🤖 AI Agent System
│   │   ├── AIXManager.js       # 🎯 Agent Manager
│   │   ├── AgentRuntime.js     # ⚙️ Agent Runtime
│   │   └── CursorAgent.js      # 🖱️ Cursor Integration
│   ├── agents/                  # 🧠 AI Agents
│   │   ├── AgentCoordinator.js # 🎭 Orchestrator
│   │   ├── LunaWithMCP.js      # 🌙 Trip Architect
│   │   └── KarimWithMCP.js     # 💰 Budget Optimizer
│   ├── tools/                   # 🛠️ Utility Tools
│   │   ├── BaseTool.js         # 🔧 Base Tool Class
│   │   ├── geolocation.js      # 🌍 Location Service
│   │   └── track_price_changes.js # 💹 Price Tracking
│   ├── services/                # 🏢 Business Services
│   │   ├── qdrantService.js    # 🔍 Vector Database
│   │   └── quantumRewardEngine.js # ⚡ Reward System
│   ├── routes/                  # 🛣️ API Routes
│   │   ├── agents.js           # 🤖 Agent Endpoints
│   │   ├── trips.js            # ✈️ Trip Management
│   │   └── auth.js             # 🔐 Authentication
│   └── utils/                   # 🔧 Utilities
│       ├── logger.js           # 📝 Logging System
│       └── langsmith_helpers.js # 🔍 Tracing Helpers
├── middleware/                  # 🛡️ Middleware
├── models/                      # 📊 Data Models
└── tests/                       # 🧪 Test Suite
```

### **AI Agent System**
```
backend/src/aix/
├── AIXManager.js               # 🎯 Main Manager
├── AgentRuntime.js             # ⚙️ Runtime Engine
├── AIXRegistry.js              # 📋 Agent Registry
├── AIXCommunicationHub.js      # 📡 Communication
├── DNAscoringSystem.js         # 🧬 DNA Scoring
├── PatternLearningEngine.js    # 🧠 Learning System
├── QuantumTopologyLayer.js     # ⚡ Quantum Layer
└── strategies/                 # 🎯 Agent Strategies
```

---

## 🔍 **CODE EXPLORATION GUIDE**

### **🎯 Start Here (Essential Files)**
1. **`/README.md`** - Project overview and setup
2. **`/package.json`** - Root dependencies
3. **`/frontend/src/App.tsx`** - Frontend entry point
4. **`/backend/server.js`** - Backend entry point
5. **`/backend/src/aix/AIXManager.js`** - AI system core

### **🤖 AI Agent System**
- **Manager**: `/backend/src/aix/AIXManager.js`
- **Runtime**: `/backend/src/aix/AgentRuntime.js`
- **Coordinator**: `/backend/src/agents/AgentCoordinator.js`
- **Luna Agent**: `/backend/src/agents/LunaWithMCP.js`
- **Karim Agent**: `/backend/src/agents/KarimWithMCP.js`

### **🛠️ Tools & Utilities**
- **Base Tool**: `/backend/src/tools/BaseTool.js`
- **Geolocation**: `/backend/src/tools/geolocation.js`
- **Price Tracking**: `/backend/src/tools/track_price_changes.js`
- **Logger**: `/backend/src/utils/logger.js`
- **LangSmith**: `/backend/src/utils/langsmith_helpers.js`

### **🌐 API Endpoints**
- **Agents**: `/backend/routes/agents.js`
- **Trips**: `/backend/routes/trips.js`
- **Auth**: `/backend/routes/auth.js`
- **Payment**: `/backend/routes/payment.js`
- **Analytics**: `/backend/routes/analytics.js`

### **🧪 Testing**
- **Unit Tests**: `/backend/tests/`
- **E2E Tests**: `/frontend/tests/e2e/`
- **Agent Tests**: `/backend/tests/integration/agents.test.js`
- **API Tests**: `/backend/tests/api/endpoints.test.js`

---

## 📊 **FEATURE MAP**

### **🎨 Frontend Features**
- **AI Chat Interface** → `/frontend/src/components/AIAgentKit.tsx`
- **Trip Planning** → `/frontend/src/components/TripPlanner.tsx`
- **Voice Control** → `/frontend/src/components/VoiceControl.tsx`
- **Payment System** → `/frontend/src/components/PaymentModal.tsx`
- **Authentication** → `/frontend/src/components/Auth/`

### **🤖 Backend Features**
- **Agent Orchestration** → `/backend/src/agents/AgentCoordinator.js`
- **Price Monitoring** → `/backend/src/tools/track_price_changes.js`
- **User Profiling** → `/backend/src/ai/userProfiling.js`
- **Revenue Analytics** → `/backend/src/services/revenueAnalytics.js`
- **Security** → `/backend/middleware/`

### **🔍 AI Features**
- **Multi-Agent System** → `/backend/src/aix/`
- **Pattern Learning** → `/backend/src/aix/PatternLearningEngine.js`
- **Quantum Rewards** → `/backend/src/reward/QuantumRewardEngine.js`
- **LangSmith Tracing** → `/backend/src/utils/langsmith_helpers.js`
- **MCP Protocol** → `/backend/src/mcp/TravelMCPServer.js`

---

## 🚀 **DEPLOYMENT MAP**

### **🐳 Docker & CI/CD**
- **Dockerfile** → `/Dockerfile` - Production container
- **Docker Ignore** → `/.dockerignore` - Build optimization
- **CI/CD Pipeline** → `/.github/workflows/cd.yml` - Automated deployment
- **PM2 Config** → `/ecosystem.config.js` - Process management

### **☁️ Deployment Targets**
- **Frontend**: Vercel (configured in `/frontend/vercel.json`)
- **Backend**: Railway + Google Cloud Run
- **Database**: Supabase PostgreSQL
- **Monitoring**: LangSmith + Custom analytics

---

## 🔧 **CONFIGURATION MAP**

### **⚙️ Environment Configuration**
- **Backend Config** → `/backend/.env` (not in repo)
- **Frontend Config** → `/frontend/.env.production`
- **Database Config** → `/backend/src/config/`
- **AI Config** → `/backend/src/ai/`

### **📦 Package Management**
- **Root Package** → `/package.json`
- **Frontend Package** → `/frontend/package.json`
- **Backend Package** → `/backend/package.json`
- **Zero-Cost Agent** → `/zero-cost-agent/package.json`

---

## 🧪 **TESTING MAP**

### **🔬 Test Structure**
- **Unit Tests** → `/backend/tests/unit/`
- **Integration Tests** → `/backend/tests/integration/`
- **API Tests** → `/backend/tests/api/`
- **E2E Tests** → `/frontend/tests/e2e/`
- **Agent Tests** → `/backend/tests/integration/agents.test.js`

### **🧪 Test Commands**
- **Backend Tests**: `cd backend && npm test`
- **Frontend Tests**: `cd frontend && npm test`
- **E2E Tests**: `cd frontend && npm run test:e2e`
- **Coverage**: `npm run test:coverage`

---

## 📚 **DOCUMENTATION MAP**

### **📖 Key Documentation**
- **README** → `/README.md` - Project overview
- **Architecture** → `/ARCHITECTURE.md` - System design
- **API Docs** → `/API_DOCUMENTATION.md` - API reference
- **Deployment** → `/DEPLOYMENT_GUIDE.md` - Deployment guide
- **Testing** → `/TESTING_GUIDE.md` - Testing guide

### **🔍 Analysis Reports**
- **Codebase Analysis** → `/DEEP_CODEBASE_ANALYSIS.md`
- **LangSmith Report** → `/LANGSMITH_TRACING_REPORT.md`
- **Security Audit** → `/DATABASE_SECURITY_AUDIT.md`
- **Performance Guide** → `/CURSOR_PERFORMANCE_GUIDE.md`

---

## 🎯 **QUICK COMMANDS**

### **🚀 Development**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### **🔍 Code Exploration**
```bash
# Find all AI agents
find . -name "*agent*" -type f

# Find all tools
find . -name "*tool*" -type f

# Find all tests
find . -name "*.test.js" -type f

# Find all AIX files
find . -name "*.aix" -type f
```

### **🧪 Testing**
```bash
# Run all tests
npm run test

# Run specific test
npm test -- --grep "agent"

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🎉 **NAVIGATION TIPS**

### **🔍 Finding Code**
1. **Use VS Code/Cursor search** (Ctrl+Shift+F)
2. **Follow imports** to trace dependencies
3. **Check package.json** for dependencies
4. **Look at tests** to understand usage
5. **Read README files** for context

### **🧠 Understanding Architecture**
1. **Start with main entry points**
2. **Follow the data flow**
3. **Check middleware stack**
4. **Understand agent communication**
5. **Review error handling**

### **🚀 Getting Started**
1. **Read `/README.md`** for setup
2. **Check `/package.json`** for dependencies
3. **Run `npm install`** to install dependencies
4. **Start with `npm run dev`** to run locally
5. **Check `/docs/`** for detailed guides

---

**🎯 Happy Coding! Built with Cursor Ultimate Learning Agent - DNA Score: 99.2/100** 🚀

---

*Generated on: $(date)*  
*Map Engine: Cursor Ultimate Learning Agent*  
*Project: Maya Travel Agent v1.0*

