# 🚀 Amrikyy Agent - AI-Powered Travel Assistant

> Enterprise-grade AI travel agent with multi-model architecture, real-time booking, and intelligent recommendations.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Moeabdelaziz007/Amrikyy-Agent)

**[English](README.md)** | [العربية](README.ar.md)

---

## ✨ Key Features

### 🤖 Advanced AI Capabilities
- **Multi-Model Architecture**: OpenAI, Gemini, OpenRouter, and custom models
- **Intelligent Context Management**: Maintains conversation history and user preferences
- **Natural Language Processing**: Understands complex travel queries
- **Real-time Recommendations**: Personalized suggestions based on user behavior

### 🌍 Travel Services
- **Flight Search & Booking**: Integration with Amadeus, Kiwi APIs
- **Hotel Reservations**: Booking.com and direct hotel APIs
- **Destination Intelligence**: Weather, attractions, local insights
- **Itinerary Planning**: AI-generated travel plans

### 💬 Multi-Channel Communication
- **Telegram Bot**: Full-featured bot with inline keyboards
- **WhatsApp Business**: Enterprise messaging integration
- **Web Interface**: Modern React-based dashboard
- **Voice Interface**: Voice note processing (coming soon)

### 🔒 Enterprise Security
- **JWT Authentication**: Secure user sessions
- **End-to-end Encryption**: Protected user data
- **Rate Limiting**: DDoS protection and abuse prevention
- **GDPR Compliant**: Privacy-first architecture

### 📊 Analytics & Monitoring
- **LangSmith Integration**: AI performance tracking
- **Real-time Analytics**: User behavior insights
- **Error Tracking**: Sentry integration
- **Performance Metrics**: Response time monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Desktop  │  │   Chat   │  │ Booking  │  │ Profile  │   │
│  │   OS     │  │Interface │  │  System  │  │ Manager  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js + Express)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   AI     │  │  Travel  │  │   Auth   │  │ Payment  │   │
│  │ Engine   │  │   APIs   │  │  System  │  │ Gateway  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              External Services & Databases                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Supabase │  │  Redis   │  │ OpenAI   │  │ Telegram │   │
│  │   (DB)   │  │ (Cache)  │  │   API    │  │   Bot    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (or alternative AI provider)

### 1. Clone Repository
```bash
git clone https://github.com/Moeabdelaziz007/Amrikyy-Agent.git
cd Amrikyy-Agent
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials (see DEPLOYMENT_KEYS.md)

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

### 4. Access Application

**Local Development:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

**Production:**
- Frontend: [https://frontend-beta-sandy.vercel.app](https://frontend-beta-sandy.vercel.app)
- Backend API: [https://amrikyy-agent.onrender.com](https://amrikyy-agent.onrender.com)
- Health Check: [https://amrikyy-agent.onrender.com/api/health](https://amrikyy-agent.onrender.com/api/health)

---

## 📦 Deployment

### Current Production Setup

**Backend**: Deployed on [Render.com](https://render.com)
- URL: [https://amrikyy-agent.onrender.com](https://amrikyy-agent.onrender.com)
- Runtime: Node.js 20.x
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment: 14 variables configured (see DEPLOYMENT_KEYS.md)

**Frontend**: Deployed on [Vercel](https://vercel.com)
- URL: [https://frontend-beta-sandy.vercel.app](https://frontend-beta-sandy.vercel.app)
- Framework: Vite (React)
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment: `VITE_API_URL=https://amrikyy-agent.onrender.com`

### Deploy Your Own Instance

#### Backend (Render.com)

1. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` directory as root
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

2. **Environment Variables**
   - See `DEPLOYMENT_KEYS.md` for complete list
   - Minimum required: 14 variables (see ENV_KEYS_MASTER.md)

3. **Deploy**
   - Render auto-deploys on push to main branch
   - Manual deploy via Render dashboard

#### Frontend (Vercel)

1. **Import Project**
   - Connect GitHub repository
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend.onrender.com
   ```

3. **Deploy**
   ```bash
   # Vercel auto-deploys on push
   # Or use Vercel CLI
   vercel --prod
   ```

---

## 🔑 Environment Variables

### Minimal Setup (9 variables)
```bash
# Backend
PORT=3001
NODE_ENV=production
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx
OPENAI_API_KEY=xxx
FRONTEND_URL=xxx

# Frontend
VITE_API_URL=xxx
```

**See `DEPLOYMENT_KEYS.md` for complete configuration guide**

---

## 📚 API Documentation

### Core Endpoints

#### Health Check
```bash
GET /api/health
Response: { status: "UP", timestamp: "...", version: "1.0.0" }
```

#### AI Chat
```bash
POST /api/ai/chat
Body: { message: "Find me flights to Paris" }
Response: { message: "...", suggestions: [...] }
```

#### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

#### Travel Services
```bash
GET /api/flights/search?from=NYC&to=PAR&date=2025-06-01
GET /api/hotels/search?city=Paris&checkin=2025-06-01
POST /api/bookings/create
GET /api/destinations/:id
```

**Full API documentation**: `/docs/core/API_DOCUMENTATION.md`

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

### Integration Tests
```bash
npm run test:integration
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript/TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Authentication**: JWT + Passport.js

### AI & ML
- **Primary**: Google Gemini 2.0 Flash (Experimental)
- **Alternatives**: Gemini 2.5 Pro, OpenAI GPT-4, Claude
- **Tracing**: LangSmith (optional)
- **Vector DB**: Qdrant (optional)

### DevOps
- **Hosting**: Render.com (backend), Vercel (frontend)
- **CI/CD**: GitHub Actions + Auto-deploy
- **Monitoring**: Sentry (optional)
- **Analytics**: Custom analytics middleware

---

## 📖 Documentation

- [Quick Start Guide](docs/core/QUICK_START.md)
- [API Documentation](docs/core/API_DOCUMENTATION.md)
- [Architecture Overview](docs/core/ARCHITECTURE.md)
- [Deployment Guide](docs/core/DEPLOYMENT_GUIDE.md)
- [Development Guide](docs/development/guides/DEVELOPMENT_GUIDE.md)
- [Environment Variables](DEPLOYMENT_KEYS.md)

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mohamed Hossameldin Abdelaziz**
- GitHub: [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)
- LinkedIn: [linkedin.com/in/amrikyy](https://www.linkedin.com/in/amrikyy)
- Email: Amrikyy@gmail.com
- Academic: mabdela1@students.kennesaw.edu
- Phone: +201094228044
- WhatsApp: +17706160211

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Supabase for database infrastructure
- Vercel & Railway for hosting
- shadcn/ui for beautiful components
- All open-source contributors

---

## 📊 Project Status

- ✅ Core AI chat functionality
- ✅ Multi-model architecture (Gemini 2.0 Flash)
- ✅ Authentication system
- ✅ Telegram bot integration
- ✅ Travel API integrations
- ✅ Modern UI/UX
- ✅ **Backend deployed on Render.com**
- ✅ **Frontend deployed on Vercel**
- ✅ **Production ready for user testing**
- 🚧 Payment processing (in progress)
- 🚧 Voice interface (coming soon)
- 🚧 Mobile apps (planned)

---

## 🔗 Production Links

- **Live Application**: [https://frontend-beta-sandy.vercel.app](https://frontend-beta-sandy.vercel.app)
- **Backend API**: [https://amrikyy-agent.onrender.com](https://amrikyy-agent.onrender.com)
- **API Health Check**: [https://amrikyy-agent.onrender.com/api/health](https://amrikyy-agent.onrender.com/api/health)
- **Telegram Bot**: [@AmrikyyBot](https://t.me/AmrikyyBot)
- **Support**: [Amrikyy@gmail.com](mailto:Amrikyy@gmail.com)

---

<div align="center">

**Built with ❤️ by Mohamed Hossameldin Abdelaziz**

[⭐ Star us on GitHub](https://github.com/Moeabdelaziz007/Amrikyy-Agent) | [🐛 Report Bug](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues) | [💡 Request Feature](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)

</div>
