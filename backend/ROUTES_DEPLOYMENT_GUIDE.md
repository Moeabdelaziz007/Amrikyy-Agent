# 🚀 Routes Deployment Guide

## Overview

This guide documents all available API routes in the Amrikyy Travel Agent backend and their deployment readiness.

## Current Status

- **Total Route Modules**: 36
- **Total Endpoints**: 182
- **Server Status**: ✅ All routes registered with graceful error handling

## Route Registry

### ✅ Core Routes (Production Ready)

These routes work without additional configuration:

| Route | Endpoints | Description | Status |
|-------|-----------|-------------|--------|
| `/api/health` | 1 GET | Server health check | ✅ Ready |
| `/api/auth` | 8 (1 GET, 7 POST) | Authentication & user management | ✅ Ready |
| `/api/trips` | 5 (2 GET, 1 POST, 1 PUT, 1 DELETE) | Trip management | ✅ Ready |
| `/api/bookings` | 1 (1 GET) | Booking management | ✅ Ready |
| `/api/dashboard` | 1 (1 GET) | Dashboard data | ✅ Ready |
| `/api/destinations` | 4 (4 GET) | Destination information | ✅ Ready |
| `/api/expenses` | 5 (2 GET, 1 POST, 1 PUT, 1 DELETE) | Expense tracking | ✅ Ready |
| `/api/flights` | 5 (2 GET, 3 POST) | Flight search | ✅ Ready |
| `/api/mcp` | 1 (1 GET) | Model Context Protocol tools | ✅ Ready |
| `/api/payment` | 5 (1 GET, 4 POST) | Payment processing | ✅ Ready |
| `/api/revenue` | 4 (3 GET, 1 POST) | Revenue tracking | ✅ Ready |
| `/api/security` | 7 (4 GET, 3 POST) | Security features | ✅ Ready |
| `/api/stripe-webhook` | 1 (1 POST) | Stripe webhooks | ✅ Ready |
| `/api/youtube` | 1 (1 POST) | YouTube integration | ✅ Ready |

### ⚠️ Routes Requiring Configuration

These routes need environment variables or additional setup:

| Route | Configuration Required | Status |
|-------|----------------------|--------|
| `/api/ai` | `ZAI_API_KEY` | ⚠️ Needs config |
| `/api/enhanced-ai` | AI model configuration | ⚠️ Needs config |
| `/api/agents` | AI agent configuration | ⚠️ Needs config |
| `/api/automation` | `node-cron` package | ⚠️ Needs dependency |
| `/api/crypto-payments` | `web3` package, crypto config | ⚠️ Needs dependency |
| `/api/discord` | Discord bot token | ⚠️ Needs config |
| `/api/email` | Email service config (SMTP) | ⚠️ Needs config |
| `/api/hotels` | Hotel API keys | ⚠️ Needs config |
| `/api/ivr` | IVR service config | ⚠️ Needs config |
| `/api/kelo` | Kelo AI configuration | ⚠️ Needs config |
| `/api/messenger` | Facebook Messenger config | ⚠️ Needs config |
| `/api/miniapp` | Telegram Mini App config | ⚠️ Needs config |
| `/api/notifications` | Notification service config | ⚠️ Needs config |
| `/api/profile` | User profile service | ⚠️ Needs config |
| `/api/qdrant` | Qdrant vector DB config | ⚠️ Needs config |
| `/api/smart-documentation` | Documentation AI config | ⚠️ Needs config |
| `/api/telegram-integration` | Telegram bot token | ⚠️ Needs config |
| `/api/travel-agents` | Travel agent service config | ⚠️ Needs config |
| `/api/voice-note-taker` | Voice processing config | ⚠️ Needs config |
| `/api/web-explorer` | Web scraping config | ⚠️ Needs config |
| `/api/whatsapp` | WhatsApp Business API | ⚠️ Needs config |
| `/api/analytics` | Analytics database | ⚠️ Needs config |
| `/api/cache` | Redis or cache service | ⚠️ Needs config |

## Deployment Configuration

### Server Features

1. **Graceful Error Handling**: Routes with missing dependencies return 503 Service Unavailable instead of crashing the server
2. **Health Check**: `/api/health` always available for monitoring
3. **Comprehensive Logging**: Route loading status is logged during startup
4. **Production Ready**: Can deploy with partial configuration

### Environment Variables by Service

#### Core Services
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_min_32_chars
```

#### AI Services
```bash
# Z.ai (for AI chat)
ZAI_API_KEY=your_zai_api_key
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# Gemini (optional)
GEMINI_API_KEY=your_gemini_key
```

#### Payment Services
```bash
# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# PayPal (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

#### Messaging Services
```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token

# Discord (optional)
DISCORD_BOT_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_client_id
```

#### Cache & Storage
```bash
# Redis (optional - falls back to memory cache)
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Qdrant Vector DB (optional)
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
```

## Deployment Scenarios

### Scenario 1: Minimal MVP Deployment

Deploy with just core features:

**Required Environment Variables:**
```bash
NODE_ENV=production
PORT=5000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

**Available Routes:**
- Authentication (`/api/auth`)
- Trips (`/api/trips`)
- Bookings (`/api/bookings`)
- Health check (`/api/health`)

**Result:** Basic travel planning functionality

### Scenario 2: AI-Enhanced Deployment

Add AI capabilities:

**Additional Environment Variables:**
```bash
ZAI_API_KEY=...
GEMINI_API_KEY=...
```

**Additional Routes:**
- AI Chat (`/api/ai`)
- Enhanced AI (`/api/enhanced-ai`)
- Smart Documentation (`/api/smart-documentation`)

**Result:** AI-powered travel recommendations

### Scenario 3: Full-Stack Deployment

Enable all features:

**All Environment Variables Required**

**All Routes Available**

**Result:** Complete travel agent platform

## Deployment Checklist

### Pre-Deployment

- [ ] Review route validation report: `backend/route-deployment-report.json`
- [ ] Run route checker: `node backend/check-routes-deploy.js`
- [ ] Configure environment variables for desired routes
- [ ] Test health endpoint: `curl http://localhost:5000/api/health`

### Deployment Steps

1. **Deploy to Railway/Render/Heroku:**
   ```bash
   # Set environment variables in platform dashboard
   # Deploy from backend directory
   # Set start command: npm start
   # Set health check path: /api/health
   ```

2. **Deploy to Vercel (Serverless):**
   ```bash
   # Frontend only on Vercel
   # Backend on Railway or similar
   ```

3. **Test Deployment:**
   ```bash
   # Check health
   curl https://your-app.railway.app/api/health
   
   # Test auth
   curl -X POST https://your-app.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

### Post-Deployment

- [ ] Monitor logs for route loading warnings
- [ ] Verify critical routes are accessible
- [ ] Check error rates for 503 responses
- [ ] Enable additional services as needed
- [ ] Update frontend API URLs

## Monitoring

### Key Metrics

1. **Route Availability**: Check which routes return 503
2. **Response Times**: Monitor endpoint performance
3. **Error Rates**: Track 4xx and 5xx errors
4. **Health Check**: Monitor `/api/health` uptime

### Useful Commands

```bash
# Check server logs
railway logs

# View route status
curl https://your-app.railway.app/api/health

# Test route availability
./backend/check-routes-deploy.js
```

## Troubleshooting

### Common Issues

**Issue**: Route returns 503 Service Unavailable

**Solution**: Check server logs for missing environment variables or dependencies

**Issue**: Server fails to start

**Solution**: Verify all critical environment variables are set

**Issue**: Some routes work, others don't

**Solution**: This is expected! Server uses graceful degradation. Configure only the routes you need.

## Version History

- **v1.0.0** (2025-10-22): Initial production server with all 36 routes registered
- Added graceful error handling for missing dependencies
- Implemented 503 fallback for unavailable services

## Support

For deployment assistance:
1. Check route validation report: `route-deployment-report.json`
2. Review server logs during startup
3. Verify environment variables match required services
4. Test routes individually before full deployment

---

**Generated by**: Route Deployment Checker  
**Last Updated**: 2025-10-22  
**Status**: Production Ready ✅
