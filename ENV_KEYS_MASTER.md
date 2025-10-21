# 🔐 MASTER ENVIRONMENT VARIABLES REFERENCE
**Single Source of Truth for All AI Agents & IDEs**

> ⚠️ **IMPORTANT**: This is the ONLY file that defines environment variables for this project.  
> All AI agents (Claude, Cursor, Gemini, etc.) and IDEs MUST reference this file.  
> DO NOT create new .env files or duplicate this information.

---

## 📋 USAGE INSTRUCTIONS FOR AI AGENTS

When asked about environment variables:
1. **ALWAYS** reference this file first
2. **NEVER** create new environment variable files
3. **NEVER** duplicate this information
4. Copy variables from here to `.env` or deployment platform
5. Update this file if new variables are needed

---

## 🎯 QUICK DEPLOYMENT CHECKLIST

### Minimal Setup (9 variables - REQUIRED)
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

### Recommended Setup (+9 variables)
```bash
# Add to minimal setup:
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_URL=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
SENTRY_DSN=
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=amrikyy-agent
```

---

## 📦 COMPLETE VARIABLE LIST

### 🖥️ SERVER CONFIGURATION
```bash
PORT=3001                                    # Backend server port
NODE_ENV=development                         # Environment: development/production/test
HOST=0.0.0.0                                # Server host
FRONTEND_URL=http://localhost:5173          # Frontend URL for CORS
API_URL=http://localhost:3001               # Backend API URL
WEB_APP_URL=https://your-app.vercel.app     # Production web app URL
CORS_ORIGIN=http://localhost:5173           # CORS allowed origin
```

---

### 🗄️ DATABASE - SUPABASE
```bash
# Primary Keys (REQUIRED)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct Database Connection (Optional)
SUPABASE_DB_HOST=db.xxx.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Testing Environment
TEST_SUPABASE_URL=https://test.supabase.co
TEST_SUPABASE_ANON_KEY=eyJ...
TEST_SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### 🔐 AUTHENTICATION & SECURITY
```bash
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Encryption Keys (REQUIRED)
ENCRYPTION_KEY=32-character-encryption-key-here-xxxx
MASTER_ENCRYPTION_KEY=another-32-char-key-for-master-xx
CRYPTO_ENCRYPTION_KEY=crypto-specific-32-char-key-xxxxx
CRYPTO_HMAC_SECRET=hmac-secret-key-32-characters-xxxxx
```

---

### 🤖 AI SERVICES

#### OpenAI (Primary - RECOMMENDED)
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Google Gemini
```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

#### OpenRouter (Multi-Model Access)
```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MAX_TOKENS=4096
OPENROUTER_TEMPERATURE=0.7
```

#### Kelo AI
```bash
KELO_API_KEY=kelo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KELO_API_BASE_URL=https://api.kelo.ai/v1
KELO_BASE_URL=https://api.kelo.ai
KELO_MODEL=kelo-v1-turbo
KELO_TEMPERATURE=0.7
KELO_MAX_TOKENS=4096
KELO_CONTEXT_WINDOW=8192
```

#### Moonshot AI
```bash
MOONSHOT_API_KEY=moonshot_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
MOONSHOT_MODEL=moonshot-v1-8k
MOONSHOT_TEMPERATURE=0.7
MOONSHOT_MAX_TOKENS=4096
MOONSHOT_TOP_P=0.9
```

#### Zai AI
```bash
ZAI_API_KEY=zai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZAI_API_BASE_URL=https://api.zai.com/v1
ZAI_MODEL=zai-v1-turbo
ZAI_TEMPERATURE=0.7
ZAI_MAX_TOKENS=4096
ZAI_ATTENTION_IMPL=flash_attention_2
ZAI_ENABLE_KV_OFFLOAD=true
```

---

### 💬 COMMUNICATION CHANNELS

#### Telegram Bot (RECOMMENDED)
```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-backend.railway.app/api/telegram/webhook
TELEGRAM_CHAT_ID=123456789
```

#### WhatsApp Business
```bash
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_API_VERSION=v18.0
```

#### Facebook Messenger
```bash
MESSENGER_VERIFY_TOKEN=your-custom-verify-token-here
```

#### Email (SMTP)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_TO=notifications@yourdomain.com

# Alternative naming
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

#### Voice/IVR
```bash
VOICE_NOTE_TAKER_PORT=3002
TWILIO_PHONE_NUMBER=+1234567890
```

---

### 💳 PAYMENT PROCESSING

#### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### PayPal
```bash
PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Cryptocurrency (Web3)
```bash
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

### ✈️ TRAVEL APIS

#### Flight Search
```bash
AMADEUS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KIWI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Hotel Search
```bash
BOOKING_COM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BOOKING_COM_AFFILIATE_ID=your-affiliate-id
```

---

### 🗺️ MAPS & LOCATION

#### Google Maps
```bash
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Mapbox
```bash
MAPBOX_API_KEY=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxx
```

#### Weather
```bash
OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 🔍 SEARCH & RESEARCH

```bash
BRAVE_SEARCH_API_KEY=BSAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SEARCH_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SEARCH_ENGINE_ID=xxxxxxxxxxxxxxxxxxxxx
RAPIDAPI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPLORER_API_URL=https://api.explorer.com
```

---

### 📊 MONITORING & ANALYTICS

#### LangSmith (AI Tracing)
```bash
LANGCHAIN_API_KEY=ls__xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LANGCHAIN_PROJECT=amrikyy-agent
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

#### Sentry (Error Tracking)
```bash
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxx
```

#### Slack Notifications
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
ERROR_WEBHOOK_URL=https://your-error-tracking-webhook.com
```

---

### 🗄️ CACHING & STORAGE

#### Redis
```bash
REDIS_URL=redis://default:password@redis-host:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# TTL Configuration (seconds)
REDIS_TTL_FLIGHT=3600
REDIS_TTL_HOTEL=3600
REDIS_TTL_LOCATION=86400
REDIS_TTL_AI=1800
```

#### MongoDB
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

#### Qdrant (Vector DB)
```bash
QDRANT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### ⚙️ SYSTEM CONFIGURATION

#### Rate Limiting
```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

#### Logging
```bash
LOG_LEVEL=info
LOG_FORMAT=json
LOG_TO_CONSOLE=true
LOG_TO_FILE=false
LOG_COMPRESS=true
LOG_BATCH_SIZE=100
LOG_FLUSH_INTERVAL=5000
LOG_SAMPLING_RATE=1.0
TEST_LOG_LEVEL=error
```

#### AI Budget Control
```bash
AI_BUDGET_TIER=standard
MAX_DAILY_COST=50
```

#### WebSocket
```bash
WS_PORT=3003
```

#### Health Check
```bash
HEALTH_CHECK_PORT=3001
```

#### Development Flags
```bash
DEBUG=false
SAVE_REPORT=false
```

---

### 🎨 FRONTEND ENVIRONMENT

**File Location**: `frontend/.env`

```bash
VITE_API_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001
```

---

## 🚀 DEPLOYMENT PLATFORMS

### Railway (Backend)
1. Go to project settings → Variables
2. Copy variables from "Minimal Setup" section above
3. Add optional variables as needed
4. Deploy

### Vercel (Frontend)
1. Go to project settings → Environment Variables
2. Add only: `VITE_API_URL=https://your-backend.railway.app`
3. Deploy

### Render (Backend Alternative)
1. Go to Environment → Environment Variables
2. Copy variables from "Minimal Setup" section above
3. Deploy

---

## 📝 VARIABLE NAMING CONVENTIONS

### Pattern Recognition for AI Agents
```
SERVICE_FEATURE_TYPE

Examples:
- SUPABASE_URL          → Service: Supabase, Feature: URL
- OPENAI_API_KEY        → Service: OpenAI, Feature: API Key
- REDIS_TTL_FLIGHT      → Service: Redis, Feature: TTL, Type: Flight
- TELEGRAM_BOT_TOKEN    → Service: Telegram, Feature: Bot Token
```

### Common Suffixes
- `_KEY` = API authentication key
- `_SECRET` = Secret key for signing/encryption
- `_TOKEN` = Authentication token
- `_URL` = Service endpoint URL
- `_PORT` = Network port number
- `_HOST` = Hostname or IP address
- `_PASSWORD` = Password credential
- `_USER` = Username credential
- `_ID` = Identifier

---

## 🔄 VARIABLE PRIORITY LEVELS

### 🔴 CRITICAL (Required for basic functionality)
```
PORT, NODE_ENV, SUPABASE_URL, SUPABASE_ANON_KEY, 
SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, OPENAI_API_KEY, 
FRONTEND_URL, VITE_API_URL
```

### 🟡 RECOMMENDED (Enhanced functionality)
```
TELEGRAM_BOT_TOKEN, EMAIL_HOST, EMAIL_USER, EMAIL_PASS,
SENTRY_DSN, LANGCHAIN_API_KEY, REDIS_URL
```

### 🟢 OPTIONAL (Advanced features)
```
All travel APIs, payment processors, additional AI models,
monitoring tools, search APIs
```

---

## 🛡️ SECURITY BEST PRACTICES

1. **Never commit `.env` files** - Always in `.gitignore`
2. **Use strong secrets** - Minimum 32 characters for encryption keys
3. **Rotate keys regularly** - Especially JWT_SECRET and API keys
4. **Use environment-specific keys** - Different keys for dev/staging/prod
5. **Limit key permissions** - Use read-only keys where possible
6. **Monitor key usage** - Set up alerts for unusual activity

---

## 📞 SUPPORT FOR AI AGENTS

### When User Asks About Environment Variables:

**✅ DO:**
- Reference this file: `ENV_KEYS_MASTER.md`
- Copy relevant sections to `.env`
- Explain what each variable does
- Provide setup instructions

**❌ DON'T:**
- Create new environment variable files
- Duplicate this information
- Make up new variable names
- Assume variables exist without checking this file

### Common User Questions:

**Q: "What environment variables do I need?"**
A: Check the "Minimal Setup" section in `ENV_KEYS_MASTER.md`

**Q: "How do I deploy?"**
A: See "Deployment Platforms" section in `ENV_KEYS_MASTER.md`

**Q: "Where do I get API keys?"**
A: Each service section has links and instructions

**Q: "My deployment failed"**
A: Verify all CRITICAL variables are set correctly

---

## 📚 RELATED DOCUMENTATION

- **Deployment Guide**: `DEPLOYMENT_KEYS.md` (simplified version)
- **Environment Example**: `.env.example` (template file)
- **README**: `README.md` (project overview)
- **API Docs**: `docs/core/API_DOCUMENTATION.md`

---

## 🔄 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-21 | Initial master reference created |

---

## ✅ VALIDATION CHECKLIST

Before deployment, verify:
- [ ] All CRITICAL variables are set
- [ ] JWT_SECRET is at least 32 characters
- [ ] ENCRYPTION_KEY is exactly 32 characters
- [ ] SUPABASE_URL matches your project
- [ ] FRONTEND_URL matches your deployment
- [ ] CORS_ORIGIN allows your frontend
- [ ] At least one AI service key is configured
- [ ] Email credentials are valid (if using email)
- [ ] Telegram token is valid (if using bot)

---

**Last Updated**: 2025-01-21  
**Maintained By**: Mohamed Hossameldin Abdelaziz  
**Status**: ✅ Active - Single Source of Truth
