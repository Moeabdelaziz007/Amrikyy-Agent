# Environment Variables Template

Copy this to `.env` in your backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=your_mongodb_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Redis
REDIS_URL=your_redis_url
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# APIs
# Sabre API
SABRE_CLIENT_ID=your_sabre_client_id
SABRE_CLIENT_SECRET=your_sabre_client_secret
SABRE_PCC=your_sabre_pcc
SABRE_ENVIRONMENT=CERT

# izi.TRAVEL API
IZI_API_KEY=your_izi_travel_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AI Services
Z_AI_API_KEY=your_z_ai_api_key
OPENAI_API_KEY=your_openai_api_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Monitoring
SENTRY_DSN=your_sentry_dsn

# gRPC
GRPC_PORT=50051
ENABLE_GRPC=true

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Production Environment (Railway/Vercel)

For production deployment, set these in your deployment platform:

### Railway (Backend):

- NODE_ENV=production
- PORT=5001
- All API keys and secrets from above

### Vercel (Frontend):

- VITE_API_URL=https://your-backend-url.railway.app
- VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
