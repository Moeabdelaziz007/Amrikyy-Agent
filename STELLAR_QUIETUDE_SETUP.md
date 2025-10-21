# 🚂 Railway Project: stellar-quietude

**Project Name**: stellar-quietude  
**Repository**: Amrikyy-Agent  
**Status**: Ready to configure  

---

## 🎯 **Quick Setup Instructions**

### Step 1: Open Project
1. Go to: https://railway.app/dashboard
2. Click on: **"stellar-quietude"**

### Step 2: Configure Root Directory
1. Click **"Settings"** tab
2. Find **"Root Directory"**
3. Set to: **`backend`**
4. Click **"Save"**

### Step 3: Add Environment Variables
1. Click **"Variables"** tab
2. Click **"Raw Editor"** button
3. **Delete any existing variables**
4. **Paste ALL these variables:**

```bash
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://driujancggfxgdsuyaih.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTc3MDgsImV4cCI6MjA3NjM5MzcwOH0.4CZCB1D2pPcxELpS5edmRW6lJ7y3_N0aRubjJGl2bhY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgxNzcwOCwiZXhwIjoyMDc2MzkzNzA4fQ.u-jExSAb_ZhM2fwH82D9p_EdJ0ths4OfrE1BSNSEWMc
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXVqYW5jZ2dmeGdkc3V5YWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTc3MDgsImV4cCI6MjA3NjM5MzcwOH0.4CZCB1D2pPcxELpS5edmRW6lJ7y3_N0aRubjJGl2bhY
JWT_SECRET=f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624
ENCRYPTION_KEY=f8bb6957caa6dbc287832253c85b1f8cbb539af21fb2e5a7157783a0dc9b8624
GEMINI_API_KEY=AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0
GOOGLE_AI_API_KEY=AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-2.5-pro
FRONTEND_URL=https://amrikyy-agent.vercel.app
CORS_ORIGIN=https://amrikyy-agent.vercel.app
```

5. Click **"Update Variables"** or **"Save"**

### Step 4: Redeploy
- Railway will automatically redeploy
- Or click **"Deployments"** → **"Redeploy"**

### Step 5: Get Your URL
1. Click **"Settings"** tab
2. Scroll to **"Domains"**
3. Copy your URL (e.g., `stellar-quietude.up.railway.app`)

### Step 6: Test
```bash
curl https://stellar-quietude.up.railway.app/api/health
```

Expected:
```json
{
  "status": "UP",
  "timestamp": "2025-01-21T...",
  "service": "Amrikyy Travel Agent MVP",
  "version": "1.0.0"
}
```

---

## ✅ **Success Checklist**

- [ ] Opened stellar-quietude project
- [ ] Set root directory to `backend`
- [ ] Added all 13 environment variables
- [ ] Saved and triggered redeploy
- [ ] Got Railway URL
- [ ] Tested /api/health endpoint
- [ ] Health check returns "UP"

---

## 🎯 **After Railway Success**

### Update Vercel with Railway URL:

Once you have Railway URL (e.g., `https://stellar-quietude.up.railway.app`):

1. Go to Vercel project
2. Settings → Environment Variables
3. Update `VITE_API_URL` to your Railway URL
4. Redeploy frontend

---

## 📞 **Need Help?**

Tell me:
- ✅ Variables added successfully
- ⏳ Deployment in progress
- ❌ Got an error (share it)
- 📸 Need screenshot help

---

**Ready to configure stellar-quietude?** 🚀
