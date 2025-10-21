# 🚂 Railway CLI Deployment Guide

**Project**: Amrikyy Agent  
**Method**: Command Line Interface  
**Author**: Mohamed Hossameldin Abdelaziz

---

## ✅ **Railway CLI Already Installed!**

Version: `railway 4.10.0`

---

## 🔑 **Step 1: Get Railway Token**

### Option A: Create Account + Get Token

1. **Sign up on Railway**:
   - Go to: https://railway.app
   - Click "Continue with Google"
   - Use: Amrikyy@gmail.com
   - Complete sign-up

2. **Get API Token**:
   - Go to: https://railway.app/account/tokens
   - Click "Create Token"
   - Name: "Amrikyy-CLI-Deploy"
   - Copy token (starts with `railway_`)

### Option B: Login from Local Machine

If you have a local machine with browser:
```bash
railway login
# Opens browser, authorize, done!
```

---

## 🚀 **Step 2: Deploy with Token**

### Set Token:
```bash
export RAILWAY_TOKEN=your_railway_token_here
```

### Initialize Project:
```bash
cd backend
railway init
```

### Add Environment Variables:
```bash
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=https://driujancggfxgdsuyaih.supabase.co
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTc3MDgsImV4cCI6MjA3NjM5MzcwOH0.4CZCB1D2pPcxELpS5edmRW6lJ7y3_N0aRubjJGl2bhY
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgxNzcwOCwiZXhwIjoyMDc2MzkzNzA4fQ.u-jExSAb_ZhM2fwH82D9p_EdJ0ths4OfrE1BSNSEWMc
railway variables set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTc3MDgsImV4cCI6MjA3NjM5MzcwOH0.4CZCB1D2pPcxELpS5edmRW6lJ7y3_N0aRubjJGl2bhY
railway variables set JWT_SECRET=f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624
railway variables set ENCRYPTION_KEY=f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624
railway variables set GEMINI_API_KEY=AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0
railway variables set GOOGLE_AI_API_KEY=AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0
railway variables set GEMINI_MODEL=gemini-2.0-flash-exp
railway variables set GEMINI_PRO_MODEL=gemini-2.5-pro
railway variables set FRONTEND_URL=https://amrikyy-agent.vercel.app
railway variables set CORS_ORIGIN=https://amrikyy-agent.vercel.app
```

### Deploy:
```bash
railway up
```

---

## 📋 **Step 3: Get Deployment URL**

```bash
railway domain
```

Or:
```bash
railway status
```

---

## 🎯 **Quick Commands Reference**

```bash
# Check if logged in
railway whoami

# Initialize project
railway init

# Link to existing project
railway link [project-id]

# Set variable
railway variables set KEY=value

# Deploy
railway up

# View logs
railway logs

# Get domain
railway domain

# Open in browser
railway open

# Check status
railway status
```

---

## 🔧 **Troubleshooting**

### "Unauthorized" Error
```bash
# Set token
export RAILWAY_TOKEN=your_token_here

# Or login
railway login
```

### "No project linked"
```bash
# Initialize new project
railway init

# Or link existing
railway link [project-id]
```

### "Build failed"
```bash
# Check logs
railway logs

# Verify variables
railway variables
```

---

## 💡 **Alternative: Use Railway Web for Initial Setup**

**Easiest approach:**

1. **Create project on Railway web** (1 minute)
   - Sign up with Google
   - Create project from GitHub
   - Add variables via Raw Editor

2. **Use CLI for updates** (optional)
   - Link to project: `railway link`
   - Deploy updates: `railway up`

---

## 🎯 **Recommended Workflow**

### For First Deployment:
✅ **Use Railway Web** (easier for setup)
- Sign up with Google
- Connect GitHub
- Add variables
- Deploy

### For Future Updates:
✅ **Use Railway CLI** (faster)
- `railway up` to deploy
- `railway logs` to debug
- `railway variables` to update

---

## 📞 **Next Steps**

1. **Get Railway token**: https://railway.app/account/tokens
2. **Paste token here**
3. **I'll deploy for you using CLI**

Or:

1. **Sign up on Railway web**: https://railway.app
2. **Use Google sign-up** (Amrikyy@gmail.com)
3. **Deploy via web interface** (easier)

---

**Which method do you prefer?**
- 🔑 Get token and use CLI
- 🌐 Use web interface (easier)
- 🤔 Need more help deciding

