# 🌍 Amrikyy Travel Agent - AI-Powered Travel Assistant

> Your intelligent companion for seamless travel planning, powered by advanced AI agents, real-time flight/hotel search, and integrated with multiple platforms.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/tests-100%2B%20passing-success)](./TESTING_GUIDE.md)

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Moeabdelaziz007/Amrikyy-Agent.git
cd Amrikyy-Agent

# Install dependencies
npm install

# Configure environment
cp backend/env.example backend/.env
# Edit .env with your API keys

# Run tests
cd backend && ./run-tests.sh

# Start development server
npm run dev
```

**📚 Documentation:**
- [API Endpoints](./API_ENDPOINTS_DOCUMENTATION.md)
- [Travel APIs Setup](./TRAVEL_APIS_SETUP_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

## ✨ Features

### 🤖 AI Agent Squadron
- **Luna (Trip Architect)** - Complete trip planning with real-time flight search
- **Karim (Budget Optimizer)** - Budget analysis and cost-saving recommendations
- **Scout (Deal Finder)** - Proactive deal discovery and price monitoring
- **Agent Coordinator** - Multi-agent orchestration for complex requests

### 🔧 MCP (Model Context Protocol)
- **5 Specialized Tools** - search_flights, compare_prices, analyze_budget, and more
- **Standardized Interface** - Consistent tool calling across all agents
- **Real-time Integration** - Direct connection to external APIs

### ✈️ Travel Services Integration
- **Kiwi Tequila API** - Flight search across 800+ airlines
- **Booking.com Affiliate** - Hotel search and booking worldwide
- **Mapbox API** - Maps, geocoding, and directions
- **Real-time Pricing** - Live availability and pricing data

### 🔐 Enterprise Security
- **Ephemeral Tokens** - Short-lived access tokens with scope-based permissions
- **Rate Limiting** - Per-user limits for external APIs (Kiwi: 5/min, Booking: 5/min, Mapbox: 10/min)
- **Token Management** - Generation, validation, revocation, and statistics
- **Audit Logging** - Complete tracking of all operations

### 💳 Payment Integration
- **Stripe Integration** - Secure payment processing
- **Multiple Methods** - Stripe, PayPal, Telegram payments
- **Webhook Handling** - Real-time payment confirmations
- **Fraud Protection** - Rate-limited payment endpoints

### 📱 Messaging Platforms
- **Telegram Bot** - Full-featured bot with AI responses
- **Telegram Mini App** - WebApp integration
- **WhatsApp Business** - WhatsApp Business API integration
- **Real-time Notifications** - Instant updates

### 🧪 Comprehensive Testing
- **100+ Test Cases** - Unit, integration, and API tests
- **Structure Validation** - Automated code structure checks
- **Coverage Reports** - Detailed coverage analysis
- **CI/CD Ready** - GitHub Actions integration

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Supabase Client** - Database integration

### Backend
- **Node.js + Express** - Server framework
- **Supabase PostgreSQL** - Database
- **Z.ai GLM-4.6** - AI model
- **MCP Protocol** - Tool orchestration
- **Kiwi Tequila API** - Flight search
- **Booking.com API** - Hotel search
- **Mapbox API** - Maps & geocoding
- **Stripe** - Payment processing
- **JWT + Ephemeral Tokens** - Authentication

### AI Agents
- **Luna** - Trip planning agent
- **Karim** - Budget optimization agent
- **Scout** - Deal discovery agent
- **Agent Coordinator** - Multi-agent orchestration

---

## 📚 Documentation

### Core Documentation
- **[API Endpoints](./API_ENDPOINTS_DOCUMENTATION.md)** - Complete API reference with examples
- **[Travel APIs Setup](./TRAVEL_APIS_SETUP_GUIDE.md)** - External APIs configuration
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing suite documentation
- **[Architecture](./ARCHITECTURE.md)** - System architecture
- **[Code Structure](./CODE_STRUCTURE.md)** - Codebase organization

### Additional Guides
- **[Rate Limiting](./RATE_LIMITING_GUIDE.md)** - Rate limiting details
- **[Security](./BACKEND_SECURITY_AUDIT.md)** - Security audit
- **[Deployment](./DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Moeabdelaziz007/amrikyy-travel-agent.git
cd amrikyy-travel-agent
```

#### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

This will install dependencies for:
- Root workspace
- Frontend application
- Backend server

#### 3. Environment Configuration

**Backend Environment Variables**:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Telegram Bot (Required for bot features)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Z.ai API (Required for AI features)
ZAI_API_KEY=your_zai_api_key
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# Supabase (Optional - uses memory storage if not configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Integration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment Variables**:

```bash
cd frontend
cp env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Supabase (Optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 4. Start Development Servers

**Option 1: Start Both Servers** (Recommended)

```bash
# From project root
npm run dev
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5000`

**Option 2: Start Individually**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 5. Verify Installation

Open your browser and navigate to:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **API Docs**: [http://localhost:5000/api/openapi.json](http://localhost:5000/api/openapi.json)

---

## 🤖 Telegram Bot Setup

### Option 1: Bot with AI (Requires Z.ai API Key)

```bash
cd backend
node telegram-bot.js
```

**Features**:
- AI-powered responses
- Smart recommendations
- Budget analysis
- Destination insights

### Option 2: Bot without AI (Works Immediately)

```bash
cd backend
node telegram-bot-no-ai.js
```

**Features**:
- Predefined responses
- Basic commands
- No AI dependency
- Conversation management

### Bot Commands

- `/start` - Start the bot
- `/help` - Get help
- `/trip` - Plan a trip
- `/stats` - View statistics
- `/payment` - Create payment link

---

## 📱 Access the Application

### Web Application
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Features**: Full web interface with all features

### Telegram Bot
- **Search**: `@maya_trips_bot` on Telegram
- **Features**: AI chat, trip planning, payments

### API Endpoints
- **Base URL**: `http://localhost:5000/api`
- **Health Check**: `/api/health`
- **AI Chat**: `/api/ai/chat`
- **Payment**: `/api/payment/create-payment-link`

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage

# Accessibility tests
npm run a11y-check
```

### Backend Tests

```bash
cd backend

# Rate limit tests
node test-rate-limits.js

# Bot tests
node test-bot.js

# Z.ai tests
node test-zai.js
```

### Code Quality

```bash
cd frontend

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Formatting
npm run format
npm run format:check
```

### Development Commands

#### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm run test
npm run test:ui
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Type checking
npm run type-check

# Build for production
npm run build

# E2E testing
npm run e2e
npm run e2e:ui

# Accessibility testing
npm run a11y-check
```

#### Backend Development
```bash
cd backend

# Start development server
npm run dev

# Start production server
npm run start
```

### Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Start production servers
npm run start
```

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── docs/             # Documentation
└── README.md         # Project overview
```

## Testing

### Running Tests
```bash
# Unit tests
cd frontend && npm run test

# E2E tests
cd frontend && npm run e2e

# All tests with coverage
cd frontend && npm run test:coverage
```

### Test Coverage
We aim for >80% test coverage for critical components. Run `npm run test:coverage` to see current coverage.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   rm -rf backend/node_modules backend/package-lock.json
   npm run install:all
   ```

3. **TypeScript errors**
   ```bash
   cd frontend && npm run type-check
   ```

4. **Linting errors**
   ```bash
   cd frontend && npm run lint:fix
   ```

5. **Build failures**
   ```bash
   cd frontend && npm run build
   ```

## Performance

### Bundle Analysis
```bash
cd frontend && npm run build
# Check dist/ folder for bundle sizes
```

### Lighthouse Audit
```bash
# Install lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## Security

### Security Audit
```bash
npm audit
cd frontend && npm audit
cd backend && npm audit
```

### Dependency Updates
```bash
npm update
cd frontend && npm update
cd backend && npm update
```

## 🎯 API Usage Examples

### Generate Access Token

```bash
curl -X POST http://localhost:5000/api/security/tokens/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "scope": ["flights:read", "mcp:call", "agents:execute"],
    "expiresIn": "1h"
  }'
```

### Search Flights

```bash
curl -X POST http://localhost:5000/api/flights/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "from": "NYC",
    "to": "LON",
    "departureDate": "01/12/2025",
    "adults": 2
  }'
```

### Plan Trip with AI Agents

```bash
curl -X POST http://localhost:5000/api/travel-agents/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "full_service",
    "destination": "Paris",
    "origin": "New York",
    "departureDate": "01/12/2025",
    "returnDate": "08/12/2025",
    "budget": 3000,
    "travelers": 2
  }'
```

### Analyze Budget with MCP

```bash
curl -X POST http://localhost:5000/api/mcp/analyze-budget \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo",
    "budget": 4000,
    "duration": 7,
    "travelers": 2
  }'
```

---

## 🧪 Testing

### Run All Tests

```bash
cd backend
./run-tests.sh
```

### Run Specific Test Suites

```bash
# Structure validation
node test-agents-simple.js

# Unit tests
npm test -- tests/unit

# Integration tests
npm test -- tests/integration

# API tests
npm test -- tests/api

# With coverage
npm run test:coverage
```

### Test Results

```
✅ Structure Tests: 7/7 passed
✅ Unit Tests: 45+ passed
✅ Integration Tests: 35+ passed
✅ API Tests: 25+ passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Total: 100+ tests passing
```

---

## 📊 Project Statistics

- **31 New Files** created
- **8,040+ Lines** of code added
- **100+ Test Cases** implemented
- **3 AI Agents** with MCP integration
- **5 MCP Tools** for travel operations
- **15+ API Endpoints** documented
- **7 Security Scopes** implemented
- **3 External APIs** integrated

---

## 🚀 Recent Updates

### October 16, 2025

**Travel APIs Integration**
- ✅ Kiwi Tequila API for flight search
- ✅ Booking.com Affiliate API for hotels
- ✅ Mapbox API for maps and geocoding

**MCP & AI Agents**
- ✅ Model Context Protocol server with 5 tools
- ✅ Luna (Trip Architect) agent
- ✅ Karim (Budget Optimizer) agent
- ✅ Scout (Deal Finder) agent
- ✅ Agent Coordinator for multi-agent orchestration

**Security Layer**
- ✅ Ephemeral token management
- ✅ Scope-based access control
- ✅ Per-user rate limiting for external APIs
- ✅ Token generation, validation, and revocation

**Testing Suite**
- ✅ 100+ test cases (unit, integration, API)
- ✅ Structure validation tests
- ✅ Coverage reporting
- ✅ CI/CD ready

---

## Contributing

This project is part of the Amrikyy Trips ecosystem - your intelligent travel companion.

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `./backend/run-tests.sh`
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your branch: `git push origin feature/your-feature`
7. Create a Pull Request

### Code Standards
- Follow TypeScript/JavaScript best practices
- Write tests for new features (aim for 80%+ coverage)
- Ensure accessibility compliance
- Follow the existing code style
- Update documentation as needed
- Add API examples for new endpoints

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- Z.ai for the GLM-4.6 AI model
- Kiwi.com for the Tequila API
- Booking.com for the Affiliate API
- Mapbox for maps and geocoding services
- All contributors and supporters

---

**Built with ❤️ by the Amrikyy Team**
