 dern# 🔑 Deployment Environment Variables

## 🎯 CRITICAL - Required for Basic Functionality

### Backend Core
```bash
# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-backend.vercel.app

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Security
ENCRYPTION_KEY=32-char-encryption-key-here
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend Core
```bash
VITE_API_URL=https://your-backend.vercel.app
```

---

## 🤖 AI Services (Choose at least one)

### OpenAI (Recommended)
```bash
OPENAI_API_KEY=sk-xxx
```

### Gemini (Alternative)
```bash
GEMINI_API_KEY=AIzaSyxxx
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### OpenRouter (Multi-model)
```bash
OPENROUTER_API_KEY=sk-or-xxx
OPENROUTER_MAX_TOKENS=4096
OPENROUTER_TEMPERATURE=0.7
```

### Custom Models
```bash
# Kelo
KELO_API_KEY=xxx
KELO_BASE_URL=https://api.kelo.ai
KELO_MODEL=kelo-v1

# Moonshot
MOONSHOT_API_KEY=xxx
MOONSHOT_BASE_URL=https://api.moonshot.cn
MOONSHOT_MODEL=moonshot-v1

# Zai
ZAI_API_KEY=xxx
ZAI_API_BASE_URL=https://api.zai.com
ZAI_MODEL=zai-v1
```

---

## 📧 Communication (Optional but Recommended)

### Telegram Bot
```bash
TELEGRAM_BOT_TOKEN=123456:ABCxxx
TELEGRAM_WEBHOOK_URL=https://your-backend.railway.app/api/telegram/webhook
```

### Email (SMTP)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=notifications@yourdomain.com
```

### WhatsApp Business
```bash
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
WHATSAPP_API_VERSION=v18.0
```

---

## 💳 Payment Processing (Optional)

### Stripe
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### PayPal
```bash
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
```

### Crypto (Web3)
```bash
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/xxx
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 🗺️ Travel APIs (Optional - for travel features)

### Flight & Hotel Search
```bash
AMADEUS_API_KEY=xxx
KIWI_API_KEY=xxx
BOOKING_COM_API_KEY=xxx
BOOKING_COM_AFFILIATE_ID=xxx
```

### Maps & Location
```bash
GOOGLE_MAPS_API_KEY=AIzaSyxxx
MAPBOX_API_KEY=pk.xxx
MAPBOX_ACCESS_TOKEN=pk.xxx
OPENWEATHER_API_KEY=xxx
```

---

## 📊 Monitoring & Analytics (Optional)

### LangSmith (AI Tracing)
```bash
LANGCHAIN_API_KEY=ls__xxx
LANGCHAIN_PROJECT=amrikyy-agent
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

### Sentry (Error Tracking)
```bash
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Slack Notifications
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

---

## 🗄️ Caching & Storage (Optional)

### Redis
```bash
REDIS_URL=redis://default:xxx@redis-host:6379
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=xxx
REDIS_DB=0
```

### MongoDB
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Qdrant (Vector DB)
```bash
QDRANT_API_KEY=xxx
```

---

## 🔍 Search & Research (Optional)

```bash
BRAVE_SEARCH_API_KEY=BSAxxx
GOOGLE_SEARCH_API_KEY=AIzaSyxxx
GOOGLE_SEARCH_ENGINE_ID=xxx
RAPIDAPI_KEY=xxx
```

---

## ⚙️ Advanced Configuration (Optional)

### Rate Limiting
```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Logging
```bash
LOG_LEVEL=info
LOG_FORMAT=json
LOG_TO_CONSOLE=true
LOG_TO_FILE=false
```

### AI Budget Control
```bash
AI_BUDGET_TIER=standard
MAX_DAILY_COST=50
```

---

## 📝 Quick Setup Guide

### 1. Backend Deployment (Railway/Render)
```bash
# Copy all CRITICAL variables
# Add at least one AI service (OpenAI recommended)
# Add Telegram if you want bot functionality
```

### 2. Frontend Deployment (Vercel)
```bash
# Only needs VITE_API_URL
VITE_API_URL=https://your-backend.vercel.app
```

### 3. Supabase Setup
1. Create project at supabase.com
2. Copy URL and keys from Settings > API
3. Run database migrations (if any)

### 4. Test Deployment
```bash
# Backend health check
curl https://your-backend.railway.app/health

# Frontend
Visit https://your-frontend.vercel.app
```

---

## 🎯 Minimal Production Setup

**Absolute minimum to get started:**
```bash
# Backend (8 variables)
PORT=3001
NODE_ENV=production
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx
OPENAI_API_KEY=xxx
FRONTEND_URL=xxx

# Frontend (1 variable)
VITE_API_URL=xxx
```

**Total: 9 environment variables for basic functionality**

---

## 🚀 Recommended Production Setup

Add these for better experience:
```bash
# + Telegram bot (2 vars)
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_WEBHOOK_URL=xxx

# + Email notifications (4 vars)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=xxx
EMAIL_PASS=xxx

# + Error tracking (1 var)
SENTRY_DSN=xxx

# + AI tracing (2 vars)
LANGCHAIN_API_KEY=xxx
LANGCHAIN_PROJECT=xxx
```

**Total: 18 environment variables for production-ready setup**

---

## 👨‍💻 Author

**Mohamed Hossameldin Abdelaziz**
- GitHub: [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)
- Email: Amrikyy@gmail.com
- WhatsApp: +17706160211
- Project: Amrikyy Agent
