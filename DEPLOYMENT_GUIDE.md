# 🚀 Deployment Guide - Amrikyy Travel Agent

## 📋 Prerequisites

- Railway account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas account (database)
- Redis Cloud account (caching)
- Supabase account (auth + database)
- All API keys ready (Sabre, Stripe, izi.TRAVEL, Z.ai)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Vercel (Frontend)              │
│     React + Vite + Tailwind             │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│        Railway (Backend)                │
│   Node.js + Express + gRPC              │
│   Quantum System + Agent Network        │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐  ┌──────▼────────┐
│  MongoDB   │  │  Redis Cloud  │
│  Atlas     │  │  (Caching)    │
└────────────┘  └───────────────┘
```

---

## 🚀 Step 1: Backend Deployment (Railway)

### 1.1 Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 1.2 Initialize Railway Project

```bash
cd /Users/Shared/maya-travel-agent
railway init
# Select: "Create new project"
# Name: amrikyy-backend
```

### 1.3 Link to Backend

```bash
railway link
# Select your project
```

### 1.4 Set Environment Variables

```bash
# Set all environment variables
railway variables set NODE_ENV=production
railway variables set PORT=5001

# Database
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set SUPABASE_URL="your_supabase_url"
railway variables set SUPABASE_ANON_KEY="your_supabase_key"

# Redis
railway variables set REDIS_URL="your_redis_url"
railway variables set REDIS_PASSWORD="your_redis_password"

# Authentication
railway variables set JWT_SECRET="your_jwt_secret"
railway variables set SESSION_SECRET="your_session_secret"

# Sabre API
railway variables set SABRE_CLIENT_ID="your_sabre_client_id"
railway variables set SABRE_CLIENT_SECRET="your_sabre_client_secret"
railway variables set SABRE_PCC="your_sabre_pcc"
railway variables set SABRE_ENVIRONMENT="CERT"

# izi.TRAVEL
railway variables set IZI_API_KEY="your_izi_api_key"

# Stripe
railway variables set STRIPE_SECRET_KEY="your_stripe_secret"
railway variables set STRIPE_PUBLISHABLE_KEY="your_stripe_publishable"
railway variables set STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# AI Services
railway variables set Z_AI_API_KEY="your_z_ai_key"
railway variables set OPENAI_API_KEY="your_openai_key"

# Telegram
railway variables set TELEGRAM_BOT_TOKEN="your_telegram_token"

# Monitoring
railway variables set SENTRY_DSN="your_sentry_dsn"

# gRPC
railway variables set GRPC_PORT=50051
railway variables set ENABLE_GRPC=true
```

### 1.5 Deploy Backend

```bash
railway up
```

### 1.6 Get Backend URL

```bash
railway status
# Copy the URL (e.g., https://amrikyy-backend.up.railway.app)
```

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2.2 Deploy Frontend

```bash
cd /Users/Shared/maya-travel-agent
vercel
```

Follow prompts:

- Project name: `amrikyy-frontend`
- Framework: `Vite`
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`

### 2.3 Set Environment Variables

```bash
# Set frontend environment variables
vercel env add VITE_API_URL production
# Enter: https://your-railway-backend-url.railway.app

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: your_stripe_publishable_key
```

### 2.4 Redeploy with Environment Variables

```bash
vercel --prod
```

---

## 🗄️ Step 3: Database Setup

### 3.1 MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all for Railway)
5. Get connection string
6. Replace `<password>` and `<dbname>`
7. Add to Railway variables

### 3.2 Redis Cloud

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create new database
3. Get connection details:
   - Endpoint
   - Password
4. Add to Railway variables

### 3.3 Supabase

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Get credentials from Settings > API:
   - URL
   - Anon key
4. Add to Railway variables

---

## 🔑 Step 4: API Keys Setup

### 4.1 Sabre Dev Studio

Follow `SABRE_SETUP_GUIDE.md`:

1. Create account at [Sabre Dev Studio](https://developer.sabre.com)
2. Create application
3. Get Client ID, Client Secret, PCC
4. Start with CERT environment
5. Request PROD access later

### 4.2 Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from Developers > API keys
3. Set up webhook endpoint:
   - URL: `https://your-railway-url.railway.app/api/payment/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
4. Get webhook secret

### 4.3 izi.TRAVEL

1. Go to [izi.TRAVEL API](https://api.izi.travel)
2. Request API key
3. Add to Railway variables

### 4.4 Z.ai / OpenAI

1. Get Z.ai API key from [Z.ai](https://z.ai)
2. OR get OpenAI API key from [OpenAI](https://platform.openai.com)
3. Add to Railway variables

### 4.5 Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create new bot: `/newbot`
3. Get token
4. Add to Railway variables

---

## ✅ Step 5: Verify Deployment

### 5.1 Check Backend Health

```bash
curl https://your-railway-url.railway.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-11T...",
  "services": {
    "database": "connected",
    "redis": "connected",
    "gRPC": "ready"
  }
}
```

### 5.2 Check Frontend

Visit: `https://your-vercel-url.vercel.app`

Should see: Amrikyy landing page

### 5.3 Test Quantum System

```bash
curl -X POST https://your-railway-url.railway.app/api/quantum/network/init
```

### 5.4 Test Agent Query

```bash
curl -X POST https://your-railway-url.railway.app/api/quantum/network/query \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "EG",
    "query": "Show me pyramids tours"
  }'
```

---

## 🔧 Step 6: Post-Deployment Configuration

### 6.1 Custom Domain (Vercel)

```bash
vercel domains add your-domain.com
```

Follow DNS configuration instructions.

### 6.2 Custom Domain (Railway)

1. Go to Railway dashboard
2. Select your project
3. Settings > Domains
4. Add custom domain
5. Update DNS records

### 6.3 SSL Certificates

Both Vercel and Railway provide automatic SSL certificates.

### 6.4 Configure CORS

Update `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    'https://your-frontend-domain.vercel.app',
    'https://your-custom-domain.com',
  ],
  credentials: true,
};
```

Redeploy:

```bash
git add .
git commit -m "Update CORS for production"
git push
railway up
```

---

## 📊 Step 7: Monitoring Setup

### 7.1 Sentry (Error Tracking)

1. Go to [Sentry](https://sentry.io)
2. Create new project
3. Get DSN
4. Add to Railway variables
5. Already integrated in code!

### 7.2 Railway Logs

```bash
railway logs
```

Or view in Railway dashboard.

### 7.3 Vercel Analytics

Automatically enabled in Vercel dashboard.

---

## 🚨 Troubleshooting

### Backend won't start

**Check logs:**

```bash
railway logs
```

**Common issues:**

- Missing environment variables
- Database connection failed
- Port conflict
- Dependencies not installed

**Solution:**

```bash
railway run npm install
railway restart
```

### Frontend API calls failing

**Check:**

1. VITE_API_URL is correct
2. CORS is configured
3. Backend is running

**Fix:**

```bash
vercel env ls
# Verify VITE_API_URL
vercel --prod  # Redeploy
```

### Database connection errors

**Check:**

1. MongoDB Atlas IP whitelist: `0.0.0.0/0`
2. Connection string is correct
3. User has permissions

### Redis connection errors

**Check:**

1. Redis Cloud endpoint is correct
2. Password is correct
3. SSL/TLS is enabled

### Sabre API errors

**Check:**

1. Client ID/Secret are correct
2. PCC is correct
3. Environment is CERT (for testing)
4. Not rate limited

---

## 🔒 Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] JWT_SECRET is strong and unique
- [ ] SESSION_SECRET is strong and unique
- [ ] MongoDB has authentication enabled
- [ ] Redis has password protection
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Helmet.js is active
- [ ] HTTPS is enforced
- [ ] Sentry is configured

---

## 📈 Performance Optimization

### Enable Redis Caching

Already implemented! Verify:

```bash
curl https://your-railway-url.railway.app/api/redis/status
```

### Enable gRPC

Already configured! gRPC runs on port 50051.

### Database Indexing

Run in MongoDB Atlas:

```javascript
// Index for agents
db.agents.createIndex({ countryCode: 1 });
db.agents.createIndex({ dnaScore: -1 });

// Index for bookings
db.bookings.createIndex({ userId: 1, createdAt: -1 });
```

---

## 🔄 Continuous Deployment

### Auto-deploy on Git Push

**Railway:**
Already configured! Every push to `main` auto-deploys.

**Vercel:**
Already configured! Every push to `main` auto-deploys.

### Branch Previews

**Railway:**
Create preview environments:

```bash
railway environment
```

**Vercel:**
Automatic preview for every PR!

---

## 📊 Scaling

### Railway Scaling

1. Go to Railway dashboard
2. Select project
3. Settings > Resources
4. Increase:
   - RAM
   - CPU
   - Instances

### Vercel Scaling

Automatic! Vercel scales based on traffic.

### Database Scaling

**MongoDB Atlas:**

- Upgrade cluster tier
- Enable autoscaling

**Redis Cloud:**

- Upgrade plan
- Add more memory

---

## 🎉 Launch Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set
- [ ] Database configured
- [ ] Redis configured
- [ ] All API keys working
- [ ] Health checks passing
- [ ] Quantum system initialized
- [ ] Test queries working
- [ ] Monitoring enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] CORS configured
- [ ] Security hardened

---

## 🚀 Quick Deploy Commands

```bash
# Backend (Railway)
cd /Users/Shared/maya-travel-agent
railway up

# Frontend (Vercel)
vercel --prod

# Check status
railway logs
vercel logs
```

---

## 📞 Support

If you encounter issues:

1. Check logs:

   ```bash
   railway logs
   vercel logs
   ```

2. Check environment variables:

   ```bash
   railway variables
   vercel env ls
   ```

3. Restart services:

   ```bash
   railway restart
   ```

4. Check health endpoints:
   ```bash
   curl https://your-railway-url.railway.app/api/health
   ```

---

**Your Quantum Unbreakable System is ready to deploy!** 🌌🚀

Remember: The system self-heals, so even if something goes wrong, it will auto-recover!
