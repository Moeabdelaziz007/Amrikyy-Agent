# 🚀 Deploy Amrikyy Agent - Quick Guide

**Status**: Ready for deployment  
**Date**: October 22, 2025

This guide provides step-by-step instructions to deploy your frontend to Vercel and backend to Render using GitHub integration (no local build required).

---

## ⚠️ Prerequisites

- GitHub repository pushed and up-to-date ✅ (commit: 1e6b219)
- Vercel account ([vercel.com](https://vercel.com))
- Render account ([render.com](https://render.com))
- Environment variables ready (see below)

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository: `Moeabdelaziz007/Amrikyy-Agent`
4. Click "Import"

### Step 2: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```bash
VITE_API_URL=https://amrikyy-agent.onrender.com
```

_(Update this with your actual Render backend URL after backend deployment)_

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Copy your deployment URL (e.g., `https://your-app.vercel.app`)

### Step 5: Add Custom Domain (Optional)

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## ⚙️ Backend Deployment (Render)

### Step 1: Create New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Moeabdelaziz007/Amrikyy-Agent`
4. Click "Connect"

### Step 2: Configure Service

Use these exact settings:

```
Name: amrikyy-backend (or your preferred name)
Region: Choose closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

### Step 3: Choose Plan

- **Free Plan**: Good for testing (sleeps after 15 min inactivity)
- **Starter ($7/mo)**: Recommended for production (always on)

### Step 4: Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

#### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database (Supabase)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars

# AI Models (Gemini)
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_AI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-2.5-pro

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

#### Optional Variables (for full features)

```bash
# Redis (optional - falls back to memory cache)
REDIS_URL=redis://your-redis-instance

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Travel APIs
AMADEUS_API_KEY=your-amadeus-key
AMADEUS_API_SECRET=your-amadeus-secret
KIWI_API_KEY=your-kiwi-key

# Google Services
GOOGLE_MAPS_API_KEY=your-maps-key
```

**💡 Tip**: See `DEPLOYMENT_KEYS.md` and `ENV_KEYS_MASTER.md` for detailed variable descriptions.

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Copy your backend URL (e.g., `https://amrikyy-backend.onrender.com`)

### Step 6: Verify Deployment

Test your backend health endpoint:

```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:

```json
{
  "status": "UP",
  "timestamp": "2025-10-22T...",
  "version": "2.0.0"
}
```

---

## 🔗 Connect Frontend to Backend

### Update Frontend Environment Variable

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `VITE_API_URL` with your Render backend URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
4. Click "Save"
5. Go to "Deployments" → Click "..." on latest deployment → "Redeploy"

### Update Backend CORS

1. Go to your Render service settings
2. Update `FRONTEND_URL` environment variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Render will auto-redeploy

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check returns `{"status": "UP"}`
- [ ] Frontend can connect to backend API
- [ ] Authentication works (register/login)
- [ ] AI chat functionality works
- [ ] Database connections successful (Supabase)
- [ ] No console errors in browser
- [ ] Mobile responsive
- [ ] SSL/HTTPS enabled (automatic on both platforms)

---

## 🧪 Testing Your Deployment

### Test Frontend

```bash
# Open in browser
open https://your-app.vercel.app

# Check console for errors (F12)
```

### Test Backend API

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Test AI endpoint (requires auth)
curl -X POST https://your-backend.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello Maya"}'
```

---

## 🚨 Troubleshooting

### Frontend Build Fails

**Issue**: `@vercel/analytics` import error

**Solution**: The package is in `package.json` dependencies. Vercel will install it automatically. If build still fails:

1. Check Vercel build logs
2. Ensure `@vercel/analytics` version is `^1.5.0` in `package.json`
3. Try clearing Vercel cache: Settings → Clear Cache → Redeploy

### Backend Won't Start

**Issue**: Missing environment variables

**Solution**:

1. Check Render logs for specific error
2. Verify all required env vars are set
3. Ensure `JWT_SECRET` is at least 32 characters
4. Check Supabase credentials are correct

### CORS Errors

**Issue**: Frontend can't connect to backend

**Solution**:

1. Verify `FRONTEND_URL` in backend env vars matches your Vercel URL
2. Check backend logs for CORS errors
3. Ensure no trailing slash in URLs

### Render Free Tier Sleep

**Issue**: First request takes 30+ seconds

**Solution**: This is normal on free tier. Backend "wakes up" after first request. Consider upgrading to Starter plan for production.

---

## 🔄 Auto-Deploy Setup

Both platforms support auto-deploy from GitHub:

### Vercel

- ✅ Enabled by default
- Pushes to `main` branch auto-deploy production
- PRs create preview deployments

### Render

- ✅ Enable in service settings
- Settings → Auto-Deploy: Yes
- Pushes to `main` branch trigger deployment

---

## 📊 Monitoring

### Vercel Analytics

- Built-in: Dashboard → Analytics
- Real-time visitor stats
- Core Web Vitals
- Edge function metrics

### Render Metrics

- Built-in: Service → Metrics
- CPU/Memory usage
- Request count
- Response times
- Logs: Service → Logs (real-time)

---

## 💰 Cost Estimate

### Free Tier (Testing)

- Vercel: Free (Hobby plan)
- Render: Free (with sleep after inactivity)
- **Total**: $0/month

### Production (Recommended)

- Vercel: Free (Hobby) or $20/month (Pro)
- Render: $7/month (Starter)
- **Total**: $7-27/month

---

## 🎯 Next Steps After Deployment

1. **Custom Domains**: Add your own domain to both services
2. **Monitoring**: Set up error tracking (Sentry, LogRocket)
3. **Analytics**: Configure Google Analytics or Mixpanel
4. **Performance**: Enable Vercel Edge Functions if needed
5. **Scaling**: Monitor usage and upgrade plans as needed
6. **CI/CD**: Add GitHub Actions for automated testing
7. **Documentation**: Update README.md with live URLs

---

## 📚 Additional Resources

- [DEPLOYMENT_KEYS.md](./DEPLOYMENT_KEYS.md) - Complete environment variable guide
- [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md) - Detailed Vercel instructions
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - General deployment guide
- [AGENTS.md](./AGENTS.md) - AI agents and MCP configuration

---

## 🆘 Need Help?

1. Check deployment platform logs first
2. Review environment variables
3. Test backend health endpoint
4. Check browser console for frontend errors
5. Review `DEPLOYMENT_KEYS.md` for env var details

**Contact**: Amrikyy@gmail.com

---

**Built with ❤️ by Mohamed Hossameldin Abdelaziz**

Last Updated: October 22, 2025
