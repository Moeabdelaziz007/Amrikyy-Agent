# 📚 Codebase Index - Amrikyy Agent

**Version**: 1.0.0  
**Last Updated**: January 21, 2025  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Key Files Reference](#key-files-reference)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Database Schema](#database-schema)
9. [Dependencies](#dependencies)
10. [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

**Amrikyy Agent** is an AI-powered travel assistant with:
- Multi-model AI architecture (OpenAI, Gemini, OpenRouter)
- Real-time flight and hotel search
- Telegram and WhatsApp bot integration
- Modern React frontend with Desktop OS interface
- Secure authentication and payment processing

---

## 📁 Directory Structure

```
Amrikyy-Agent/
│
├── 📄 Documentation (Root Level)
│   ├── README.md                    # Main project documentation
│   ├── README.ar.md                 # Arabic documentation
│   ├── ENV_KEYS_MASTER.md          # All environment variables
│   ├── DEPLOYMENT_KEYS.md          # Deployment guide
│   ├── DEPLOYMENT_SUMMARY.md       # Deployment checklist
│   ├── CODEBASE_INDEX.md           # This file
│   ├── .env.example                # Environment template
│   ├── LICENSE                     # MIT License
│   ├── COPYRIGHT.md                # Copyright notice
│   ├── COPYRIGHT.ar.md             # Arabic copyright
│   ├── CONTACT.md                  # Contact information
│   ├── CONTACT.ar.md               # Arabic contact
│   ├── CHANGELOG.md                # Version history
│   └── FEEDBACK.md                 # User feedback system
│
├── 🔧 Backend (Node.js + Express)
│   ├── server.js                   # Main server entry point
│   ├── package.json                # Backend dependencies
│   ├── .env                        # Environment variables (not in git)
│   │
│   ├── routes/                     # API route handlers
│   │   ├── auth.js                 # Authentication routes
│   │   ├── ai.js                   # AI chat routes
│   │   ├── flights.js              # Flight search routes
│   │   ├── hotels.js               # Hotel search routes
│   │   ├── bookings.js             # Booking management
│   │   ├── destinations.js         # Destination info
│   │   ├── analytics.js            # Analytics routes
│   │   ├── telegram.js             # Telegram bot webhook
│   │   ├── whatsapp.js             # WhatsApp webhook
│   │   ├── stripe-webhook.js       # Stripe payment webhook
│   │   └── ...                     # Other routes
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js                 # JWT authentication
│   │   ├── rateLimiter.js          # Rate limiting
│   │   ├── securityEnhancements.js # Security headers
│   │   ├── analyticsMiddleware.js  # Analytics tracking
│   │   └── ...                     # Other middleware
│   │
│   ├── agents/                     # AI agent implementations
│   │   ├── travel-agent.js         # Travel planning agent
│   │   ├── booking-agent.js        # Booking assistant
│   │   └── ...                     # Other agents
│   │
│   ├── database/                   # Database clients
│   │   ├── supabase.js             # Supabase client
│   │   ├── redis.js                # Redis client
│   │   └── mongodb.js              # MongoDB client (optional)
│   │
│   ├── services/                   # Business logic services
│   │   ├── ai-service.js           # AI model integration
│   │   ├── flight-service.js       # Flight search logic
│   │   ├── hotel-service.js        # Hotel search logic
│   │   ├── payment-service.js      # Payment processing
│   │   └── ...                     # Other services
│   │
│   ├── utils/                      # Utility functions
│   │   ├── logger.js               # Logging utility
│   │   ├── encryption.js           # Encryption helpers
│   │   ├── validation.js           # Input validation
│   │   └── ...                     # Other utilities
│   │
│   ├── tests/                      # Backend tests
│   │   ├── README.md               # Testing documentation
│   │   └── ...                     # Test files
│   │
│   └── docs/                       # Backend documentation
│       ├── ANALYTICS_USAGE_GUIDE.md
│       ├── KELO_API_DOCUMENTATION.md
│       └── LANGSMITH_README.md
│
├── 🎨 Frontend (React + Vite)
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.js          # TailwindCSS config
│   ├── .env                        # Frontend env vars (not in git)
│   │
│   ├── public/                     # Static assets
│   │   ├── favicon.ico
│   │   └── ...
│   │
│   ├── src/                        # Source code
│   │   ├── main.tsx                # App entry point
│   │   ├── App.tsx                 # Main App component
│   │   │
│   │   ├── components/             # React components
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── desktop/            # Desktop OS components
│   │   │   ├── chat/               # Chat interface
│   │   │   ├── booking/            # Booking components
│   │   │   └── ...                 # Other components
│   │   │
│   │   ├── pages/                  # Page components
│   │   │   ├── LandingPage.tsx     # Landing page
│   │   │   ├── DesktopOS.tsx       # Desktop OS interface
│   │   │   ├── ChatPage.tsx        # Chat page
│   │   │   └── ...                 # Other pages
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts          # Authentication hook
│   │   │   ├── useChat.ts          # Chat hook
│   │   │   └── ...                 # Other hooks
│   │   │
│   │   ├── contexts/               # React contexts
│   │   │   ├── AuthContext.tsx     # Auth context
│   │   │   ├── ThemeContext.tsx    # Theme context
│   │   │   └── ...                 # Other contexts
│   │   │
│   │   ├── services/               # API services
│   │   │   ├── api.ts              # API client
│   │   │   ├── auth.ts             # Auth service
│   │   │   └── ...                 # Other services
│   │   │
│   │   ├── types/                  # TypeScript types
│   │   │   ├── index.ts            # Type definitions
│   │   │   └── ...                 # Other types
│   │   │
│   │   ├── utils/                  # Utility functions
│   │   │   ├── cn.ts               # Class name utility
│   │   │   └── ...                 # Other utilities
│   │   │
│   │   └── styles/                 # Global styles
│   │       └── globals.css         # Global CSS
│   │
│   └── src/components/README.md    # Components documentation
│
├── 📚 Documentation
│   ├── README.md                   # Docs overview
│   │
│   ├── core/                       # Core documentation
│   │   ├── README.md
│   │   ├── ARCHITECTURE.md         # System architecture
│   │   ├── API_DOCUMENTATION.md    # API reference
│   │   ├── API_ENDPOINTS_DOCUMENTATION.md
│   │   ├── API_KEYS_SETUP_GUIDE.md
│   │   ├── AUTH_ROUTES_DOCUMENTATION.md
│   │   ├── DEPLOYMENT.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── DOCUMENTATION_INDEX.md
│   │   ├── GITHUB_SETUP.md
│   │   ├── PROJECT_DOCUMENTATION.md
│   │   ├── QUICK_START.md
│   │   ├── TELEGRAM_BOT_SETUP.md
│   │   └── VERCEL_DEPLOYMENT_GUIDE.md
│   │
│   ├── development/                # Development guides
│   │   └── guides/
│   │       └── DEVELOPMENT_GUIDE.md
│   │
│   └── ai-setup/                   # AI configuration
│       ├── README.md
│       ├── ALL_CONFIGURATIONS.md
│       ├── agent-system-messages/
│       ├── apply-models/
│       ├── autocomplete-models/
│       └── free-models/
│
├── ⚙️ Configuration Files
│   ├── .gitignore                  # Git ignore rules
│   ├── .cursorignore               # Cursor ignore rules
│   ├── .cursorrules                # Cursor AI rules
│   ├── .dockerignore               # Docker ignore rules
│   ├── .vercelignore               # Vercel ignore rules
│   ├── Dockerfile                  # Docker configuration
│   ├── vercel.json                 # Vercel configuration
│   └── .devcontainer/              # Dev container config
│
└── 🔐 Environment & Secrets
    ├── .env                        # Local environment (not in git)
    ├── .env.example                # Environment template
    └── ENV_KEYS_MASTER.md          # All env vars reference
```

---

## 🔧 Backend Architecture

### Core Components

#### 1. **Server Entry Point**
- **File**: `backend/server.js`
- **Purpose**: Main Express server
- **Port**: 3001 (configurable)
- **Features**: CORS, JSON parsing, route mounting

#### 2. **Routes** (`backend/routes/`)
| Route | File | Purpose |
|-------|------|---------|
| `/api/auth/*` | `auth.js` | User authentication |
| `/api/ai/*` | `ai.js` | AI chat interface |
| `/api/flights/*` | `flights.js` | Flight search |
| `/api/hotels/*` | `hotels.js` | Hotel search |
| `/api/bookings/*` | `bookings.js` | Booking management |
| `/api/destinations/*` | `destinations.js` | Destination info |
| `/api/telegram/*` | `telegram.js` | Telegram webhook |
| `/api/whatsapp/*` | `whatsapp.js` | WhatsApp webhook |
| `/api/stripe/*` | `stripe-webhook.js` | Payment webhook |

#### 3. **Middleware** (`backend/middleware/`)
- **auth.js**: JWT token verification
- **rateLimiter.js**: Request rate limiting
- **securityEnhancements.js**: Security headers
- **analyticsMiddleware.js**: Request tracking

#### 4. **Services** (`backend/services/`)
- **ai-service.js**: OpenAI, Gemini integration
- **flight-service.js**: Amadeus, Kiwi API
- **hotel-service.js**: Booking.com API
- **payment-service.js**: Stripe integration

#### 5. **Database** (`backend/database/`)
- **supabase.js**: PostgreSQL client
- **redis.js**: Caching layer
- **mongodb.js**: Optional NoSQL

---

## 🎨 Frontend Architecture

### Core Components

#### 1. **Entry Point**
- **File**: `frontend/src/main.tsx`
- **Purpose**: React app initialization
- **Features**: Router setup, providers

#### 2. **Main App**
- **File**: `frontend/src/App.tsx`
- **Purpose**: Root component with routing
- **Routes**: `/`, `/desktop`, `/chat`, etc.

#### 3. **Pages** (`frontend/src/pages/`)
- **LandingPage.tsx**: Home page
- **DesktopOS.tsx**: Desktop interface
- **ChatPage.tsx**: AI chat interface
- **BookingPage.tsx**: Booking management

#### 4. **Components** (`frontend/src/components/`)
- **ui/**: shadcn/ui components
- **desktop/**: Desktop OS components
- **chat/**: Chat interface components
- **booking/**: Booking components

#### 5. **State Management**
- **Contexts**: Auth, Theme, WindowManager
- **Hooks**: useAuth, useChat, useBooking
- **Services**: API client, Auth service

---

## 🔑 Key Files Reference

### Must-Know Files

| File | Purpose | Priority |
|------|---------|----------|
| `README.md` | Project overview | ⭐⭐⭐ |
| `ENV_KEYS_MASTER.md` | All environment variables | ⭐⭐⭐ |
| `DEPLOYMENT_KEYS.md` | Quick deployment guide | ⭐⭐⭐ |
| `backend/server.js` | Backend entry point | ⭐⭐⭐ |
| `frontend/src/main.tsx` | Frontend entry point | ⭐⭐⭐ |
| `backend/routes/auth.js` | Authentication logic | ⭐⭐ |
| `backend/routes/ai.js` | AI chat logic | ⭐⭐ |
| `frontend/src/App.tsx` | Main app component | ⭐⭐ |
| `.env.example` | Environment template | ⭐⭐ |
| `docs/core/API_DOCUMENTATION.md` | API reference | ⭐⭐ |

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/me                # Get current user
POST   /api/auth/refresh           # Refresh token
```

### AI Chat
```
POST   /api/ai/chat                # Send message to AI
GET    /api/ai/history             # Get chat history
DELETE /api/ai/history/:id         # Delete chat
```

### Travel Services
```
GET    /api/flights/search         # Search flights
GET    /api/hotels/search          # Search hotels
GET    /api/destinations/:id       # Get destination info
POST   /api/bookings/create        # Create booking
GET    /api/bookings/:id           # Get booking details
```

### Telegram Bot
```
POST   /api/telegram/webhook       # Telegram webhook
GET    /api/telegram/status        # Bot status
```

### Health Check
```
GET    /api/health                 # Server health check
```

**Full API Documentation**: `docs/core/API_DOCUMENTATION.md`

---

## 🔐 Environment Variables

### Critical Variables (9 minimum)
```bash
PORT=3001
NODE_ENV=production
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
OPENAI_API_KEY=
FRONTEND_URL=
VITE_API_URL=
```

### All Variables
See **ENV_KEYS_MASTER.md** for complete list of 120+ variables organized by:
- Server Configuration
- Database
- Authentication
- AI Services (OpenAI, Gemini, etc.)
- Communication (Telegram, WhatsApp, Email)
- Payment Processing (Stripe, PayPal, Crypto)
- Travel APIs (Amadeus, Kiwi, Booking.com)
- Maps & Location (Google Maps, Mapbox)
- Monitoring (Sentry, LangSmith)
- Caching (Redis)

---

## 🗄️ Database Schema

### Supabase Tables

#### users
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- full_name (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### bookings
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- type (text) -- flight, hotel, etc.
- details (jsonb)
- status (text)
- created_at (timestamp)
```

#### chat_history
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- message (text)
- response (text)
- created_at (timestamp)
```

**Full Schema**: Check Supabase dashboard or migration files

---

## 📦 Dependencies

### Backend (Node.js)
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "axios": "^1.6.0",
  "redis": "^4.6.0",
  "stripe": "^14.0.0"
}
```

### Frontend (React)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "lucide-react": "^0.300.0"
}
```

**Full Dependencies**: Check `package.json` files

---

## 🔄 Development Workflow

### 1. Setup
```bash
# Clone repository
git clone https://github.com/Moeabdelaziz007/Amrikyy-Agent.git
cd Amrikyy-Agent

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

### 2. Development
```bash
# Backend (port 3001)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### 3. Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 4. Building
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### 5. Deployment
See **DEPLOYMENT_SUMMARY.md** for complete guide

---

## 📚 Documentation Index

### Essential Docs
1. **README.md** - Start here
2. **ENV_KEYS_MASTER.md** - Environment variables
3. **DEPLOYMENT_KEYS.md** - Deployment guide
4. **CODEBASE_INDEX.md** - This file
5. **docs/core/API_DOCUMENTATION.md** - API reference

### Additional Docs
- **CHANGELOG.md** - Version history
- **CONTACT.md** - Contact information
- **COPYRIGHT.md** - Legal information
- **FEEDBACK.md** - User feedback system
- **docs/core/ARCHITECTURE.md** - System architecture
- **docs/core/QUICK_START.md** - Quick start guide

---

## 🔍 Finding Things

### Need to find...

**Environment variable?**
→ Check `ENV_KEYS_MASTER.md`

**API endpoint?**
→ Check `docs/core/API_DOCUMENTATION.md` or this file

**Component?**
→ Check `frontend/src/components/`

**Route handler?**
→ Check `backend/routes/`

**Configuration?**
→ Check root config files or `.env.example`

**How to deploy?**
→ Check `DEPLOYMENT_SUMMARY.md`

**Contact info?**
→ Check `CONTACT.md`

---

## 🆘 Common Tasks

### Add new API endpoint
1. Create route handler in `backend/routes/`
2. Add middleware if needed
3. Update `backend/server.js` to mount route
4. Document in `docs/core/API_DOCUMENTATION.md`

### Add new frontend page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Create necessary components in `frontend/src/components/`

### Add new environment variable
1. Add to `ENV_KEYS_MASTER.md` with documentation
2. Add to `.env.example`
3. Update deployment guides if needed

### Add new AI model
1. Add credentials to `ENV_KEYS_MASTER.md`
2. Update `backend/services/ai-service.js`
3. Test integration
4. Document in API docs

---

## 📞 Support

**Mohamed Hossameldin Abdelaziz**
- 📧 Email: Amrikyy@gmail.com
- 💬 WhatsApp: +17706160211
- 💼 LinkedIn: [linkedin.com/in/amrikyy](https://www.linkedin.com/in/amrikyy)
- 🐙 GitHub: [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)

---

**Last Updated**: January 21, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
