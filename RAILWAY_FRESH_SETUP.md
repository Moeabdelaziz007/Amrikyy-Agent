# 🚂 Railway Fresh Account Setup

**Date**: January 21, 2025  
**Project**: Amrikyy Agent  
**Author**: Mohamed Hossameldin Abdelaziz

---

## 🎯 **Create New Railway Account**

### Option 1: Use Different Email (Recommended)

**Use your academic email:**
```
Email: mabdela1@students.kennesaw.edu
```

**Benefits:**
- ✅ Fresh start
- ✅ New $5 credit
- ✅ Clean dashboard
- ✅ Academic credibility

### Option 2: Use Gmail Alias

If you want to use same email:
```
Original: Amrikyy@gmail.com
Alias: Amrikyy+railway@gmail.com
```

Gmail treats these as different but delivers to same inbox!

---

## 📋 **Step-by-Step Fresh Setup**

### Step 1: Sign Up
1. Go to: https://railway.app
2. Click **"Start a New Project"** or **"Sign Up"**
3. Choose sign-up method:
   - **GitHub** (Recommended - easiest)
   - **Email** (mabdela1@students.kennesaw.edu)
   - **Google**

### Step 2: Verify Email
- Check your email
- Click verification link
- Return to Railway

### Step 3: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Select **"Moeabdelaziz007/Amrikyy-Agent"**
5. Click **"Install & Authorize"**

### Step 4: Configure Deployment
1. Select **"Amrikyy-Agent"** repository
2. When asked for root directory, type: **`backend`**
3. Click **"Deploy"**

### Step 5: Add Variables
1. Wait for initial deployment (will fail - that's OK)
2. Click **"Variables"** tab
3. Click **"Raw Editor"**
4. Paste all variables (below)
5. Click **"Update Variables"**
6. Railway will auto-redeploy

---

## 🔑 **Variables to Paste**

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

---

## ⏱️ **Timeline**

- Create account: **1 minute**
- Connect GitHub: **1 minute**
- Initial deploy: **2 minutes** (will fail)
- Add variables: **30 seconds**
- Redeploy: **2 minutes**
- **Total: ~7 minutes**

---

## 💡 **Pro Tips**

### Use Academic Email
- Shows professionalism
- Easier to get student benefits
- Better for portfolio

### GitHub Sign-Up
- Fastest method
- Auto-connects repository
- One-click authorization

### Don't Worry About Failed Deploy
- First deploy will fail (no env vars)
- That's normal!
- Add variables → auto-redeploys → success!

---

## ✅ **Success Checklist**

After setup, you should have:
- [ ] New Railway account created
- [ ] GitHub connected
- [ ] Amrikyy-Agent repository selected
- [ ] Root directory set to `backend`
- [ ] 13 environment variables added
- [ ] Deployment successful
- [ ] Railway URL obtained
- [ ] Health endpoint working

---

## 🎯 **After Railway Success**

### You'll Get:
```
https://amrikyy-agent-production.up.railway.app
```

### Test It:
```bash
curl https://your-url.railway.app/api/health
```

### Expected Response:
```json
{
  "status": "UP",
  "timestamp": "2025-01-21T...",
  "service": "Amrikyy Travel Agent MVP",
  "version": "1.0.0"
}
```

---

## 🚀 **Next: Deploy Frontend to Vercel**

Once Railway is working:
1. Create Vercel account
2. Deploy frontend
3. Update FRONTEND_URL in Railway
4. Test full stack!

---

## 📞 **Need Help?**

**Mohamed Hossameldin Abdelaziz**
- 📧 Amrikyy@gmail.com
- 🎓 mabdela1@students.kennesaw.edu
- 💬 WhatsApp: +17706160211

---

**Ready to create new Railway account?**
- ✅ Yes, creating now with academic email
- ✅ Yes, creating now with Gmail alias
- ✅ Yes, creating now with GitHub
- ❓ Need more help

**Tell me when you're ready!** 🚀
