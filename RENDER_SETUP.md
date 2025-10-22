# 🚀 Render Deployment Setup Guide

Complete guide for deploying Amrikyy backend to Render.

---

## 📋 Prerequisites

- Render account (free tier available)
- GitHub repository connected
- Backend code ready

---

## 🎯 STEP 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

---

## 🚀 STEP 2: Create Web Service

### A. From Render Dashboard:

1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `Amrikyy-Agent`
3. Configure the service:

**Basic Settings:**
- **Name**: `amrikyy-backend`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Free** (for testing)
- **Starter** ($7/month - recommended for production)
- **Standard** ($25/month - for high traffic)

4. Click **"Create Web Service"**

---

## 🔧 STEP 3: Configure Environment Variables

In your Render dashboard, go to **Environment** tab and add:

### Required Variables:

```bash
# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Authentication
JWT_SECRET=your-jwt-secret-here

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Monitoring
SENTRY_DSN=https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx
METRICS_API_KEY=107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e

# Node Environment
NODE_ENV=production
PORT=10000

# Frontend URL (for CORS)
FRONTEND_URL=https://amrikyy.vercel.app
```

### Optional Variables:

```bash
# Redis (if using external Redis)
REDIS_URL=redis://...

# Telegram Bot (if using)
TELEGRAM_BOT_TOKEN=your-telegram-token

# Google Maps (if using)
GOOGLE_MAPS_API_KEY=your-maps-key

# Gemini AI
GEMINI_API_KEY=your-gemini-key
```

---

## 🔐 STEP 4: Get Render Deployment Keys

For GitHub Actions automated deployment, you need:

### A. Get Render API Key:

1. Go to **Account Settings** (click your avatar)
2. Click **API Keys** in sidebar
3. Click **"Create API Key"**
4. Name it: `GitHub Actions`
5. Copy the key (starts with `rnd_...`)

**Save this as**: `RENDER_API_KEY`

### B. Get Service ID:

1. Go to your service dashboard
2. Look at the URL: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`
3. Copy the part after `/web/`: `srv-xxxxxxxxxxxxx`

**Save this as**: `RENDER_SERVICE_ID`

### C. Get Service URL:

1. In your service dashboard, find the URL (e.g., `amrikyy-backend.onrender.com`)
2. Copy it (without https://)

**Save this as**: `RENDER_SERVICE_URL`

---

## 🔑 STEP 5: Add GitHub Secrets

Go to: **https://github.com/YOUR_USERNAME/Amrikyy-Agent/settings/secrets/actions**

Add these secrets:

### 1. RENDER_API_KEY
- **Name**: `RENDER_API_KEY`
- **Value**: `rnd_xxxxxxxxxxxxxxxxxxxxxxxx` (from Step 4A)

### 2. RENDER_SERVICE_ID
- **Name**: `RENDER_SERVICE_ID`
- **Value**: `srv-xxxxxxxxxxxxx` (from Step 4B)

### 3. RENDER_SERVICE_URL
- **Name**: `RENDER_SERVICE_URL`
- **Value**: `amrikyy-backend.onrender.com` (from Step 4C)

---

## 📝 STEP 6: Configure Auto-Deploy

In Render dashboard:

1. Go to **Settings** tab
2. Scroll to **Build & Deploy**
3. Enable **"Auto-Deploy"**: `Yes`
4. **Branch**: `main`

Now every push to `main` will trigger deployment!

---

## 🧪 STEP 7: Test Deployment

### Manual Deploy (First Time):

1. In Render dashboard, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the build logs
3. Wait for deployment to complete (~2-3 minutes)

### Verify Health:

```bash
# Test health endpoint
curl https://amrikyy-backend.onrender.com/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "uptime": 123,
  "environment": "production"
}
```

### Test Detailed Health:

```bash
curl https://amrikyy-backend.onrender.com/health/detailed
```

---

## 🚀 STEP 8: Enable GitHub Actions Deployment

Once secrets are added, GitHub Actions will automatically deploy on push to main:

```bash
git checkout main
git merge your-branch
git push origin main
```

**Deployment flow:**
1. ✅ GitHub Actions runs tests
2. ✅ Security scan
3. ✅ Triggers Render deployment
4. ✅ Render builds and deploys
5. ✅ Health checks verify deployment
6. ✅ Done!

---

## 📊 Monitoring Your Deployment

### Render Dashboard:

- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Request count
- **Events**: Deploy history
- **Shell**: Access to web service shell

### Health Endpoints:

```bash
# Basic health
https://amrikyy-backend.onrender.com/health

# Detailed health
https://amrikyy-backend.onrender.com/health/detailed

# Metrics (requires API key)
curl -H "x-api-key: YOUR_KEY" \
  https://amrikyy-backend.onrender.com/health/metrics
```

---

## 🔧 Render-Specific Configuration

### Create render.yaml (Optional):

```yaml
services:
  - type: web
    name: amrikyy-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    rootDir: backend
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

Save this as `render.yaml` in project root.

---

## ⚡ Performance Tips

### 1. Use Starter Plan or Higher
Free tier sleeps after inactivity. For production:
- **Starter**: $7/month, always on
- No cold starts
- Better performance

### 2. Enable Health Checks
In Render dashboard → Settings:
- **Health Check Path**: `/health`
- **Grace Period**: 60 seconds

### 3. Set Resource Limits
For optimal performance:
- **Memory**: 512MB minimum
- **CPU**: 0.5 minimum

---

## 🆘 Troubleshooting

### Build Fails

**Check:**
1. `package.json` has correct start script
2. Node version compatible (18+)
3. All dependencies in package.json
4. Build command is `npm install`

### Deploy Succeeds But App Crashes

**Check logs in Render dashboard:**
1. Missing environment variables
2. Database connection issues
3. Port configuration (Render uses $PORT)

### Health Check Fails

**Verify:**
1. Health endpoint returns 200 status
2. Path is `/health` (not `/api/health`)
3. Server starts on correct port

### Slow Cold Starts (Free Tier)

**Solution:**
- Upgrade to Starter plan ($7/month)
- Or use uptime monitoring to ping every 10 minutes

---

## 🔄 CI/CD Pipeline with Render

### Automatic Deployment Flow:

```
1. Push to main branch
   ↓
2. GitHub Actions runs
   ↓
3. Tests pass
   ↓
4. Trigger Render deploy via API
   ↓
5. Render builds & deploys
   ↓
6. Health check verification
   ↓
7. ✅ Live!
```

### Manual Rollback:

1. Go to Render dashboard
2. Click **"Events"** tab
3. Find previous successful deploy
4. Click **"Rollback to this version"**

---

## 📋 Environment Variables Checklist

Required for production:

- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] JWT_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] GMAIL_USER
- [ ] GMAIL_APP_PASSWORD
- [ ] SENTRY_DSN
- [ ] METRICS_API_KEY
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL

---

## 🎯 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **API Keys**: https://dashboard.render.com/u/settings#api-keys
- **Documentation**: https://render.com/docs
- **Status Page**: https://status.render.com

---

## 💰 Pricing

### Free Tier:
- ✅ 750 hours/month
- ✅ Auto-sleep after inactivity
- ✅ Good for testing
- ❌ Cold starts (spin up time)

### Starter ($7/month):
- ✅ Always on
- ✅ No cold starts
- ✅ 512MB RAM
- ✅ Good for production

### Standard ($25/month):
- ✅ 2GB RAM
- ✅ Better performance
- ✅ For high-traffic apps

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Health endpoint works
- [ ] Database connected
- [ ] Email sending works
- [ ] Stripe webhooks configured
- [ ] Sentry receiving errors
- [ ] CORS allows frontend domain
- [ ] SSL certificate active (automatic)
- [ ] Custom domain configured (optional)

---

## 🚀 Next Steps

1. **Add secrets to GitHub** (Step 5)
2. **Deploy manually first** (Step 7)
3. **Verify everything works**
4. **Enable auto-deploy** (Step 6)
5. **Monitor with Sentry**

---

**🎉 You're ready to deploy to Render! 🚀**
