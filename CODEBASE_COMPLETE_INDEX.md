# 📚 Amrikyy AI OS - Complete Codebase Index
**Generated**: $(date)
**Status**: Active Development

---

## 📊 PROJECT STATISTICS

### File Counts
- **Backend Files**: $(find backend/src -type f \( -name "*.js" -o -name "*.ts" \) | wc -l)
- **Frontend Files**: $(find frontend/src -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" \) | wc -l)
- **Documentation**: $(find . -maxdepth 1 -name "*.md" | wc -l) files
- **Total Lines of Code**: $(find backend/src frontend/src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" \) -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')

---

## 🗂️ DIRECTORY STRUCTURE

### Backend (\`backend/\`)
\`\`\`
backend/
├── src/
│   ├── agents/          # AI Agents (15 files)
│   ├── services/        # Business Logic (40+ files)
│   ├── routes/          # API Endpoints (30+ files)
│   ├── middleware/      # Express Middleware (15 files)
│   ├── cache/           # Redis & Memory Cache
│   ├── mcp/             # MCP Servers
│   ├── os/              # AI Operating System
│   ├── ai/              # AI Clients & Tools
│   ├── memory/          # Knowledge Graph & Vector DB
│   ├── monitoring/      # Performance & Health
│   ├── security/        # Auth & Encryption
│   └── utils/           # Helper Functions
├── routes/              # Legacy Routes
├── middleware/          # Legacy Middleware
├── tests/               # Test Suites
└── scripts/             # Utility Scripts
\`\`\`

### Frontend (\`frontend/\`)
\`\`\`
frontend/
├── src/
│   ├── pages/           # Route Pages (13 files)
│   ├── components/      # React Components (100+ files)
│   ├── apps/            # OS Applications
│   ├── lib/             # Utilities & Helpers
│   ├── hooks/           # Custom React Hooks
│   ├── contexts/        # React Contexts
│   └── styles/          # CSS & Themes
└── public/              # Static Assets
\`\`\`

---

## 🤖 AI AGENTS (15 Total)

### Core Agents
1. **QuantumGeminiCore.js** - Main AI with quantum reasoning
2. **AgentCoordinator.js** - Multi-agent orchestration
3. **AgentManager.ts** - Agent lifecycle management

### Specialized Agents
4. **LunaWithMCP.js** - Trip planning agent
5. **KarimWithMCP.js** - Budget optimization agent
6. **ScoutWithMCP.js** - Deal finder agent
7. **ContentCreatorAgent.js** - Content generation
8. **AIEducationAgent.js** - Educational content
9. **InnovationAgent.js** - Innovation tracking
10. **TravelAgencyAgent.js** - Travel booking
11. **GeminiQuantopoCodex.js** - Advanced Gemini agent
12. **EmotionalMemorySystem.js** - Emotion tracking
13. **StudioAgent.ts** - Studio operations
14. **TravelAgent.ts** - Travel operations
15. **mini-aladdin.js** - Mini agent helper

---

## 🛣️ API ENDPOINTS (70+ Routes)

### Authentication & Users
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`GET /api/profile\` - User profile

### AI & Agents
- \`POST /api/ai/chat\` - AI chat endpoint
- \`POST /api/agents/execute\` - Execute agent task
- \`GET /api/agents/status\` - Agent status
- \`POST /api/coordinator/workflow\` - Workflow execution

### Travel Services
- \`GET /api/flights/search\` - Flight search
- \`GET /api/hotels/search\` - Hotel search
- \`POST /api/bookings/create\` - Create booking
- \`GET /api/destinations\` - Destinations list

### Mini Apps
- \`GET /api/mini-apps\` - List mini apps
- \`POST /api/mini-apps/:id/execute\` - Execute mini app

### OS Features
- \`GET /api/os/apps\` - List OS apps
- \`POST /api/os/window/create\` - Create window
- \`GET /api/os/desktop\` - Desktop state

### Integrations
- \`POST /api/telegram/webhook\` - Telegram webhook
- \`POST /api/whatsapp/webhook\` - WhatsApp webhook
- \`POST /api/youtube/automation\` - YouTube automation
- \`POST /api/notebooklm/generate\` - NotebookLM generation

---

## 🎨 FRONTEND PAGES (13 Pages)

1. **Home.tsx** - Landing page
2. **LandingPage.tsx** - Marketing page
3. **AppLauncher.jsx** - Mini apps hub
4. **AmrikyyOSComplete.jsx** - Full OS interface
5. **DemoDesktop.tsx** - Desktop demo
6. **DesktopWithDashboard.tsx** - Desktop + dashboard
7. **OSDemo.tsx** - OS demonstration
8. **MobileOSDemo.tsx** - Mobile OS
9. **AIUIDashboard.tsx** - AI dashboard
10. **CodebaseExplorer.tsx** - Code explorer
11. **SEODashboard.tsx** - SEO analytics
12. **VoiceTest.tsx** - Voice testing
13. **ResponsiveTest.tsx** - Responsive testing

---

## 🧩 KEY COMPONENTS

### OS Components
- **WindowManager** - Window management system
- **Taskbar** - OS taskbar
- **Desktop** - Desktop environment
- **FileManager** - File browser
- **Terminal** - Command terminal

### AI Components
- **ChatInterface** - AI chat UI
- **AgentCard** - Agent display card
- **WorkflowBuilder** - Visual workflow builder
- **ThinkingProcess** - AI thinking visualization

### Travel Components
- **FlightSearch** - Flight search UI
- **HotelCard** - Hotel display
- **TripPlanner** - Trip planning interface
- **MapViewer** - Interactive maps

---

## 🔧 SERVICES & INTEGRATIONS

### Google Services
- **GoogleMapsService.js** - Maps integration
- **GoogleVisionService.js** - Vision API
- **NotebookLMService.js** - NotebookLM
- **YouTubeService.js** - YouTube Data API

### Payment Services
- **UnifiedPaymentService.js** - Payment processing
- **CryptoPaymentManager.js** - Crypto payments
- **stripeService.js** - Stripe integration

### Travel APIs
- **SabreService.js** - Sabre GDS
- **BookingComService.js** - Booking.com
- **KiwiTequilaService.js** - Kiwi flights

### Communication
- **LLMTelegramBot.js** - Telegram bot
- **whatsappClient.js** - WhatsApp integration
- **emailService.js** - Email service

---

## 📝 DOCUMENTATION (100+ Files)

### Core Docs
- **README.md** - Main documentation
- **AMRIKYY_AI_OS_PLAN.md** - Implementation plan
- **COMPLETE_CODEBASE_INDEX.md** - This file
- **API_DOCUMENTATION.md** - API reference

### Setup Guides
- **GEMINI_STUDENT_PACK.md** - Gemini setup
- **GOOGLE_APIS_SETUP.md** - Google APIs
- **TELEGRAM_BOT_SETUP.md** - Telegram bot
- **DEPLOYMENT_GUIDE.md** - Deployment

### Feature Plans
- **FEATURE_BUILD_PLAN.md** - 12-week roadmap
- **MVP_4_WEEK_PLAN.md** - MVP timeline
- **MISSING_FEATURES_ROADMAP.md** - Roadmap

---

## 🧪 TESTING

### Test Files
- **Unit Tests**: 20+ files
- **Integration Tests**: 10+ files
- **API Tests**: 15+ files
- **Coverage**: ~60%

### Test Suites
- Agent tests
- API endpoint tests
- Database tests
- Security tests
- Performance tests

---

## 🔐 SECURITY & AUTH

### Authentication
- JWT tokens
- Supabase Auth
- Session management
- OAuth integration

### Security Features
- Rate limiting (7-tier system)
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

---

## 💾 DATA & CACHING

### Databases
- **Supabase** (PostgreSQL) - Main database
- **Redis** - Caching layer
- **Qdrant** - Vector database

### Caching Strategy
- Flight searches: 5 min TTL
- Hotel searches: 1 hour TTL
- AI responses: 30 min TTL
- Location data: 24 hours TTL

---

## 🚀 DEPLOYMENT

### Platforms
- **Netlify** - Frontend hosting
- **Railway** - Backend hosting (planned)
- **Vercel** - Alternative frontend

### CI/CD
- GitHub Actions
- Automated testing
- Environment management

---

## 📦 DEPENDENCIES

### Backend (Key Packages)
- \`@google/generative-ai\` - Gemini AI
- \`express\` - Web framework
- \`@supabase/supabase-js\` - Database
- \`redis\` - Caching
- \`langsmith\` - AI monitoring

### Frontend (Key Packages)
- \`react\` - UI framework
- \`typescript\` - Type safety
- \`tailwindcss\` - Styling
- \`framer-motion\` - Animations
- \`@radix-ui\` - UI components

---

## 🎯 CURRENT STATUS

### ✅ Completed
- Backend API (70+ endpoints)
- 15 AI Agents
- Redis caching
- Supabase integration
- Frontend UI (13 pages)
- Mini Apps system
- Documentation

### 🔄 In Progress
- Mini Agent Services (8 agents)
- Theme system (8 themes)
- Automation workflows
- Mobile app

### ⏳ Planned
- Production deployment
- User testing
- Performance optimization
- Additional integrations

---

## 📞 QUICK REFERENCE

### Start Development
\`\`\`bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
\`\`\`

### Run Tests
\`\`\`bash
cd backend && npm test
\`\`\`

### Build Production
\`\`\`bash
cd frontend && npm run build
\`\`\`

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Status**: Active Development
