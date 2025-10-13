# Environment Variables Setup Guide

Complete guide to configuring environment variables for the Amrikyy AI Automation Platform.

## 📋 Quick Start

```bash
# Backend
cd backend
cp env.example .env
nano .env  # Edit with your values

# Frontend
cd frontend
cp .env.example .env
nano .env  # Edit with your values
```

---

## 🔐 Required Variables (Must Configure)

### Server Configuration

```bash
# Port for backend server
PORT=5001

# Environment: development | production | test
NODE_ENV=development

# API base URL
API_URL=http://localhost:5001
```

### Database (Supabase)

**Get your keys**: https://supabase.com/dashboard

```bash
# Supabase project URL
SUPABASE_URL=https://xxxxx.supabase.co

# Public anonymous key (safe for frontend)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (backend only, NEVER expose!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Setup Steps**:
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy URL and keys
5. Run database migrations (see `backend/database/SCHEMA_MIGRATION_GUIDE.md`)

### AI Services (Z.ai)

**Get your key**: https://z.ai

```bash
# Z.ai API key for GLM-4.6 model
ZAI_API_KEY=your_zai_api_key_here

# API endpoint (default)
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4

# Model configuration
ZAI_MODEL=glm-4.6
ZAI_MAX_TOKENS=2000
ZAI_TEMPERATURE=0.7
```

**Setup Steps**:
1. Sign up at https://z.ai
2. Navigate to API Keys section
3. Create new API key
4. Copy key to `.env`

### Payment Processing (Stripe)

**Get your keys**: https://dashboard.stripe.com/apikeys

```bash
# Stripe secret key (backend only)
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe publishable key (safe for frontend)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Webhook secret (for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Setup Steps**:
1. Create Stripe account
2. Get API keys from Dashboard → Developers → API keys
3. For webhooks:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.failed`
   - Copy webhook secret

### Security

```bash
# JWT secret for token signing (generate random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Encryption key for sensitive data (32 characters)
ENCRYPTION_KEY=your_32_character_encryption_key
```

**Generate secure keys**:
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 Optional Variables (Recommended)

### Travel APIs

#### Amadeus (Flight/Hotel Search)

**Get your keys**: https://developers.amadeus.com

```bash
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
```

**Setup Steps**:
1. Create account at https://developers.amadeus.com
2. Create new app
3. Copy API Key and API Secret
4. Start with Test environment, upgrade to Production when ready

#### Sabre GDS (Alternative Travel API)

```bash
SABRE_CLIENT_ID=your_sabre_client_id
SABRE_CLIENT_SECRET=your_sabre_client_secret
SABRE_ENVIRONMENT=test  # or 'production'
```

#### IZI Travel (Travel Content)

```bash
IZI_TRAVEL_API_KEY=your_izi_api_key
```

### Telegram Bot

**Get your token**: https://t.me/BotFather

```bash
# Bot token from @BotFather
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Your web app URL
WEB_APP_URL=https://yourdomain.com

# Mini app URL
TELEGRAM_MINI_APP_URL=https://yourdomain.com

# Frontend URL for redirects
FRONTEND_URL=http://localhost:8080
```

**Setup Steps**:
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions
4. Copy token
5. Set webhook: `/setwebhook` → `https://yourdomain.com/api/miniapp/webhook`

### Error Tracking (Sentry)

**Get your DSN**: https://sentry.io

```bash
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

**Setup Steps**:
1. Create Sentry account
2. Create new project (Node.js)
3. Copy DSN from Settings → Client Keys
4. Paste into `.env`

### Redis (Caching & Sessions)

```bash
# Redis connection URL
REDIS_URL=redis://localhost:6379

# Or individual settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_TLS=false
```

**Setup Options**:
- **Local**: Install Redis locally
- **Cloud**: Use Upstash (https://upstash.com) or Redis Cloud
- **Skip**: Redis is optional, app works without it

### MongoDB (Legacy Support)

```bash
MONGODB_URI=mongodb://localhost:27017/amrikyy
```

**Note**: Most features use Supabase. MongoDB is only needed for legacy features.

---

## 🌐 Frontend Variables

Create `frontend/.env`:

```bash
# Supabase (same as backend)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API endpoint
VITE_API_URL=http://localhost:5001

# Stripe publishable key (safe for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Google Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (optional)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

## 🚀 Advanced Configuration

### CORS Configuration

```bash
# Allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:8080,https://yourdomain.com
```

### Rate Limiting

```bash
# Rate limit window (milliseconds)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Max requests per window
RATE_LIMIT_MAX_REQUESTS=100
```

### Kafka Event Streaming (Optional)

```bash
CONFLUENT_BOOTSTRAP_SERVERS=pkc-xxxxx.us-east-1.aws.confluent.cloud:9092
CONFLUENT_SASL_USERNAME=your_api_key
CONFLUENT_SASL_PASSWORD=your_api_secret
CONFLUENT_GROUP_ID=amrikyy-service-bus
```

### Data Pipeline (Optional)

#### Fivetran

```bash
FIVETRAN_API_KEY=your_fivetran_api_key
FIVETRAN_API_SECRET=your_fivetran_api_secret
FIVETRAN_ACCOUNT_ID=your_account_id
```

#### Dataiku

```bash
DATAIKU_BASE_URL=https://your-dataiku-instance.com
DATAIKU_API_KEY=your_dataiku_api_key
DATAIKU_PROJECT_KEY=AMRIKYY_TRAVEL_AGENT
```

### Blockchain & Crypto (Optional)

```bash
# Crypto payment gateway
CRYPTO_PAYMENT_API_KEY=your_crypto_api_key

# Blockchain RPC endpoints
ETH_RPC_URL=https://mainnet.infura.io/v3/your_key
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-rpc.com
```

### Email Notifications (Optional)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@amrikyy.ai
```

**Gmail Setup**:
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASS`

---

## 📝 Environment-Specific Configurations

### Development

```bash
NODE_ENV=development
PORT=5001
API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
DEBUG_MODE=true
LOG_LEVEL=debug
```

### Production

```bash
NODE_ENV=production
PORT=5001
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
DEBUG_MODE=false
LOG_LEVEL=info
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Testing

```bash
NODE_ENV=test
PORT=5002
SUPABASE_URL=https://test-project.supabase.co
MONGODB_URI=mongodb://localhost:27017/amrikyy-test
MOCK_AI_RESPONSES=true
MOCK_PAYMENT_PROCESSING=true
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use `.env` files (never commit to git)
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Use environment variables in CI/CD
- ✅ Restrict API key permissions
- ✅ Use HTTPS in production
- ✅ Enable rate limiting
- ✅ Monitor API usage

### ❌ DON'T:
- ❌ Commit `.env` files to git
- ❌ Share API keys publicly
- ❌ Use production keys in development
- ❌ Hardcode secrets in code
- ❌ Use weak JWT secrets
- ❌ Expose service role keys to frontend
- ❌ Disable CORS in production
- ❌ Use default passwords

---

## 🧪 Testing Your Configuration

### Backend Health Check

```bash
# Start backend
cd backend && npm run dev

# Test health endpoint
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "amrikyy-backend",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### Database Connection

```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
  https://YOUR_PROJECT.supabase.co/rest/v1/
```

### AI Service

```bash
# Test Z.ai connection
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test"}'
```

### Payment Service

```bash
# Test Stripe connection
curl http://localhost:5001/api/payments/test
```

---

## 🐛 Troubleshooting

### "Missing environment variable" Error

**Problem**: Required variable not set

**Solution**:
```bash
# Check if .env exists
ls -la backend/.env

# Verify variable is set
grep VARIABLE_NAME backend/.env

# Restart server after adding variables
```

### "Database connection failed"

**Problem**: Invalid Supabase credentials

**Solution**:
1. Verify URL and keys in Supabase dashboard
2. Check for extra spaces in `.env`
3. Ensure keys are not expired
4. Test connection with curl

### "AI API rate limit exceeded"

**Problem**: Too many AI requests

**Solution**:
1. Check Z.ai dashboard for usage
2. Implement caching for repeated queries
3. Upgrade Z.ai plan if needed
4. Add rate limiting to your endpoints

### "Stripe webhook verification failed"

**Problem**: Invalid webhook secret

**Solution**:
1. Get webhook secret from Stripe dashboard
2. Ensure webhook URL is correct
3. Check webhook is receiving events
4. Verify signature validation code

### "CORS error in browser"

**Problem**: Frontend can't access backend

**Solution**:
```bash
# In backend/.env
CORS_ORIGIN=http://localhost:8080

# Or allow multiple origins
CORS_ORIGIN=http://localhost:8080,https://yourdomain.com
```

---

## 📚 Additional Resources

### Getting API Keys

- **Supabase**: https://supabase.com/dashboard
- **Z.ai**: https://z.ai
- **Stripe**: https://dashboard.stripe.com/apikeys
- **Amadeus**: https://developers.amadeus.com
- **Telegram**: https://t.me/BotFather
- **Sentry**: https://sentry.io

### Documentation

- [Backend README](backend/README.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Database Migration Guide](backend/database/SCHEMA_MIGRATION_GUIDE.md)

### Support

- **Email**: support@amrikyy.ai
- **GitHub Issues**: https://github.com/Moeabdelaziz007/amrikyy-agent/issues
- **Documentation**: https://docs.amrikyy.ai

---

## 📋 Environment Variables Checklist

Use this checklist to ensure all required variables are configured:

### Backend (Required)
- [ ] `PORT`
- [ ] `NODE_ENV`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ZAI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`
- [ ] `CORS_ORIGIN`

### Frontend (Required)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_API_URL`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`

### Optional (Recommended)
- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `AMADEUS_API_KEY`
- [ ] `SENTRY_DSN`
- [ ] `REDIS_URL`

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0
