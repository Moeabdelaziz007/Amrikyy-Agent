# ▲ Vercel Frontend Deployment Guide

**Project**: Amrikyy Agent Frontend  
**Framework**: React + Vite  
**Time**: 3 minutes  

---

## 🚀 **Quick Deploy (Easiest Method)**

### Step 1: Go to Vercel
Visit: https://vercel.com

### Step 2: Sign Up / Login
- Click **"Sign Up"** or **"Login"**
- Choose: **"Continue with GitHub"** (recommended)
- Or use: **"Continue with Google"** (Amrikyy@gmail.com)

### Step 3: Import Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Find: **"Amrikyy-Agent"**
4. Click **"Import"**

### Step 4: Configure Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 5: Add Environment Variable
Click **"Environment Variables"**

Add:
```
Name: VITE_API_URL
Value: https://your-railway-url.railway.app
```

**For now, use temporary:**
```
Name: VITE_API_URL
Value: http://localhost:3001
```

### Step 6: Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- Get your URL: `https://amrikyy-agent.vercel.app`

---

## 📋 **Detailed Configuration**

### Project Settings:
```yaml
Project Name: amrikyy-agent
Framework: Vite
Root Directory: frontend
Node Version: 18.x
```

### Build Settings:
```bash
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

### Environment Variables:
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

---

## 🎯 **After Deployment**

### You'll Get:
```
Production: https://amrikyy-agent.vercel.app
Preview: https://amrikyy-agent-git-main.vercel.app
```

### Test It:
1. Visit your Vercel URL
2. Should see landing page
3. Click "Launch" or "Get Started"
4. Should load desktop interface

---

## 🔄 **Update Backend with Frontend URL**

Once Vercel is deployed:

### Option 1: Railway Web
1. Go to Railway project
2. Variables tab
3. Update:
   ```
   FRONTEND_URL=https://amrikyy-agent.vercel.app
   CORS_ORIGIN=https://amrikyy-agent.vercel.app
   ```
4. Save (auto-redeploys)

### Option 2: Railway CLI
```bash
railway variables set FRONTEND_URL=https://amrikyy-agent.vercel.app
railway variables set CORS_ORIGIN=https://amrikyy-agent.vercel.app
```

---

## ✅ **Verification Checklist**

After deployment:
- [ ] Frontend loads at Vercel URL
- [ ] No console errors
- [ ] Landing page displays correctly
- [ ] Can navigate to desktop interface
- [ ] Backend URL updated in Railway
- [ ] CORS configured correctly

---

## 🎨 **What You'll See**

### Vercel Dashboard:
```
┌─────────────────────────────────────────┐
│  ▲ Vercel Dashboard                     │
├─────────────────────────────────────────┤
│  Projects:                              │
│  ┌─────────────────────────────────┐   │
│  │ 🚀 amrikyy-agent                │   │
│  │ Status: ✅ Ready                 │   │
│  │ URL: amrikyy-agent.vercel.app   │   │
│  │ Last Deploy: 2 minutes ago      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Deployment Logs:
```
✅ Cloning repository...
✅ Installing dependencies...
✅ Building application...
✅ Uploading build...
✅ Deployment ready!
🌐 https://amrikyy-agent.vercel.app
```

---

## 🔧 **Troubleshooting**

### Build Failed
**Check:**
- Root directory is `frontend`
- Build command is `npm run build`
- Node version is 18.x

### Environment Variable Not Working
**Check:**
- Variable name is `VITE_API_URL` (not `REACT_APP_API_URL`)
- Value starts with `https://`
- Redeploy after adding variable

### 404 on Routes
**Add `vercel.json` in frontend:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📱 **Mobile & Desktop Testing**

After deployment, test on:
- ✅ Desktop Chrome
- ✅ Desktop Firefox
- ✅ Mobile Safari (iOS)
- ✅ Mobile Chrome (Android)
- ✅ Tablet

---

## 🎯 **Production URLs**

After both deployments:

```
Frontend: https://amrikyy-agent.vercel.app
Backend:  https://amrikyy-agent-production.railway.app
Health:   https://amrikyy-agent-production.railway.app/api/health
```

---

## 📞 **Need Help?**

**Mohamed Hossameldin Abdelaziz**
- 📧 Amrikyy@gmail.com
- 💬 WhatsApp: +17706160211

---

## 🚀 **Quick Start Commands**

If you prefer CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Production deploy
vercel --prod
```

---

**Ready to deploy?**

1. Go to: https://vercel.com
2. Sign up with GitHub or Google
3. Import Amrikyy-Agent
4. Configure as above
5. Deploy!

**Takes 3 minutes total!** ⚡
