# 🚀 Render Deployment Setup

Complete guide to deploy Amrikyy Travel Agent backend to Render.

---

## 📋 Quick Start (5 minutes)

### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### **Step 2: Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `Amrikyy-Agent`
3. Configure:
   ```
   Name: amrikyy-backend
   Region: Frankfurt (EU Central) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
4. Click **"Create Web Service"**

### **Step 3: Add Environment Variables**
In Render dashboard → Environment:

```bash
# Required
NODE_ENV=production
PORT=5000

# Security
JWT_SECRET=your-jwt-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-key
GOOGLE_AI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-2.5-pro

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# PayPal
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_MODE=live

# Telegram
TELEGRAM_BOT_TOKEN=your-token

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app

# Monitoring
METRICS_API_KEY=your-metrics-key
SENTRY_DSN=your-sentry-dsn
```

### **Step 4: Get Render Secrets for GitHub**

**A. RENDER_API_KEY**
1. Go to [Account Settings](https://dashboard.render.com/u/settings#api-keys)
2. Click **"Create API Key"**
3. Name it: "GitHub Actions"
4. Copy the key

**B. RENDER_SERVICE_ID**
1. Go to your service dashboard
2. Look at the URL: `https://dashboard.render.com/web/srv-xxxxx`
3. Copy the `srv-xxxxx` part

**C. RENDER_SERVICE_URL**
1. In your service dashboard
2. Copy the URL shown (e.g., `amrikyy-backend.onrender.com`)
3. Or: `https://your-service-name.onrender.com`

---

## 🔑 Add Secrets to GitHub

Go to: https://github.com/Moeabdelaziz007/Amrikyy-Agent/settings/secrets/actions

Add these 3 new secrets:

```
Name: RENDER_API_KEY
Value: rnd_xxxxxxxxxxxxxxxxxxxxx

Name: RENDER_SERVICE_ID  
Value: srv-xxxxxxxxxxxxxxxxxxxxx

Name: RENDER_SERVICE_URL
Value: amrikyy-backend.onrender.com
```

---

## 📁 Render Configuration File

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: amrikyy-backend
    runtime: node
    region: frankfurt
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      # Add other env vars from Render dashboard
```

---

## 🚀 Deploy

### **Manual Deploy**
1. Push to main branch
2. Render auto-deploys
3. Check logs in Render dashboard

### **Automatic Deploy (CI/CD)**
```bash
# Merge your branch
git checkout main
git merge cursor/enhance-backend-codebase-after-audit-c742
git push origin main

# GitHub Actions will:
# ✅ Run tests
# ✅ Deploy to Render
# ✅ Deploy to Vercel
# ✅ Verify health
```

---

## ✅ Verify Deployment

### **1. Check Render Dashboard**
- Status should be "Live"
- No errors in logs

### **2. Test Health Endpoint**
```bash
curl https://your-service.onrender.com/api/health
```

Expected response:
```json
{
  "status": "UP",
  "timestamp": "2025-10-22T...",
  "service": "Amrikyy Travel Agent MVP",
  "version": "1.0.0"
}
```

### **3. Test PayPal**
```bash
curl https://your-service.onrender.com/api/paypal/health
```

### **4. Test Metrics**
```bash
curl -H "x-api-key: YOUR_METRICS_KEY" \
  https://your-service.onrender.com/health/metrics
```

---

## 🔧 Troubleshooting

### **Build Fails**
```bash
# Check build logs in Render dashboard
# Common issues:
- Missing dependencies → Check package.json
- Wrong Node version → Add .node-version file
- Build timeout → Upgrade plan or optimize build
```

### **Service Won't Start**
```bash
# Check:
1. Start command is correct: npm start
2. PORT env var is set to 5000
3. All required env vars are present
4. Check application logs
```

### **Environment Variables Not Working**
```bash
# In Render dashboard:
1. Go to Environment tab
2. Click "Add Environment Variable"
3. Make sure to click "Save Changes"
4. Redeploy if needed
```

### **CORS Errors**
```bash
# Update CORS_ORIGIN in Render:
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-domain.com
```

---

## 💰 Pricing

### **Free Tier**
- ✅ 750 hours/month
- ✅ Auto-sleep after 15 min inactivity
- ✅ Spins up on request (cold start ~30s)
- ✅ Perfect for development/testing

### **Starter ($7/month)**
- ✅ Always on (no sleep)
- ✅ Faster cold starts
- ✅ More resources
- ✅ Recommended for production

---

## 🔄 Update Deployment

### **Update Code**
```bash
git push origin main
# Render auto-deploys
```

### **Update Environment Variables**
1. Go to Render dashboard
2. Environment tab
3. Update variables
4. Click "Save Changes"
5. Service auto-restarts

### **Manual Redeploy**
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

---

## 📊 Monitoring

### **Render Dashboard**
- View logs in real-time
- Monitor CPU/Memory usage
- Check deployment history
- View metrics

### **Sentry Integration**
- Errors automatically sent to Sentry
- Performance monitoring
- User impact analysis

### **Health Checks**
Render automatically monitors:
- `/api/health` endpoint
- Service restarts if unhealthy

---

## 🔐 Security

### **HTTPS**
- ✅ Automatic SSL certificates
- ✅ Free Let's Encrypt
- ✅ Auto-renewal

### **Environment Variables**
- ✅ Encrypted at rest
- ✅ Not visible in logs
- ✅ Separate per environment

### **DDoS Protection**
- ✅ Built-in protection
- ✅ Rate limiting
- ✅ IP filtering available

---

## 🌐 Custom Domain

### **Add Custom Domain**
1. Go to Settings → Custom Domains
2. Add your domain: `api.yourdomain.com`
3. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```
4. Wait for DNS propagation (5-30 min)
5. SSL auto-configured

---

## 📚 Related Documentation

- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment variables
- [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md) - GitHub secrets
- [MONITORING_SETUP.md](./MONITORING_SETUP.md) - Monitoring setup

---

## 🆘 Support

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Community**: https://community.render.com

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All environment variables added
- [ ] Database migrations run
- [ ] Sentry configured
- [ ] Frontend URL updated
- [ ] CORS configured
- [ ] Webhooks configured (Stripe, PayPal)
- [ ] Health checks passing
- [ ] Tests passing
- [ ] GitHub secrets added
- [ ] Custom domain configured (optional)

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0
