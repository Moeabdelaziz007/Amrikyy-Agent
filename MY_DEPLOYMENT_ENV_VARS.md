# 🔑 Environment Variables for Railway Deployment

**COPY THESE TO RAILWAY → VARIABLES**

---

## ✅ Required Variables (Add ALL of these)

```env
# Gemini AI (Creative Agent)
GEMINI_API_KEY=AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0
GEMINI_MODEL=gemini-1.5-flash

# OpenRouter (AI Chat)
OPENROUTER_API_KEY=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

# Redis (Cache & Queue)
REDIS_URL=redis://default:hOgB8zfnI5UcRqfnuAw3ehX5a6Fzs4gr@redis-13608.c84.us-east-1-2.ec2.redns.redis-cloud.com:13608

# ZAI (Coding Assistant) - Use dummy if you don't have
ZAI_API_KEY=dummy_zai_key_not_required_for_mvp

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*

# Security - JWT Secret (GENERATE THIS!)
JWT_SECRET=REPLACE_WITH_RANDOM_32_CHAR_SECRET

# Supabase (YOU NEED TO ADD THESE)
SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
```

---

## ⚠️ ACTION REQUIRED

### 1. Generate JWT Secret

**Run this command on your computer:**
```bash
openssl rand -base64 32
```

**Copy the output and replace `REPLACE_WITH_RANDOM_32_CHAR_SECRET` above**

**Alternative (if openssl not available):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### 2. Get Supabase Credentials

**Steps:**
1. Go to → https://supabase.com
2. Create new project (or use existing)
3. Wait 2-3 minutes for setup
4. Go to: **Settings → API**
5. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`

**Format:**
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 DEPLOYMENT CHECKLIST

### Step 1: Supabase Setup (5 minutes)

- [ ] Go to https://supabase.com
- [ ] Create project (or use existing)
- [ ] Get SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] Open **SQL Editor**
- [ ] Copy all content from `SUPABASE_MIGRATION_SCRIPT.sql`
- [ ] Paste in SQL Editor and click **Run**
- [ ] Verify tables created:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('agent_memory', 'pattern_learning', 'user_preferences');
  ```
  Should return 3 tables!

---

### Step 2: Generate JWT Secret (1 minute)

- [ ] Run: `openssl rand -base64 32`
- [ ] Copy output
- [ ] Replace `JWT_SECRET` value above

---

### Step 3: Deploy to Railway (5 minutes)

- [ ] Go to → https://railway.app
- [ ] Click **Login** → Login with GitHub
- [ ] Click **New Project**
- [ ] Select **Deploy from GitHub repo**
- [ ] Choose: **Moeabdelaziz007/Amrikyy-Agent**
- [ ] Railway will create a service
- [ ] Click on the service → Go to **Settings**
- [ ] Set:
  - **Root Directory:** (leave empty)
  - **Dockerfile Path:** `backend/Dockerfile`
  - **Port:** `5000`
- [ ] Go to **Variables** tab
- [ ] Click **Raw Editor** (easier!)
- [ ] Copy ALL variables from above (after replacing JWT_SECRET and Supabase values)
- [ ] Paste in Raw Editor
- [ ] Click **Deploy** (or it will auto-deploy)

---

### Step 4: Wait for Build (3-5 minutes)

- [ ] Click **Deployments** tab
- [ ] Click on latest deployment
- [ ] Click **View Logs**
- [ ] Watch for:
  ```
  ✅ Building...
  ✅ npm install
  ✅ npm run build
  ✅ Starting server...
  ✅ Server running on port 5000
  ✅ Gemini Creative Agent initialized
  ```

---

### Step 5: Get Your URL (1 minute)

- [ ] Go to **Settings** tab
- [ ] Scroll to **Domains** section
- [ ] Click **Generate Domain**
- [ ] Copy your URL (e.g., `https://amrikyy-production.up.railway.app`)

---

### Step 6: Test Your MVP! (2 minutes)

**Replace `YOUR_URL` with your actual Railway URL:**

```bash
# Test 1: Health Check
curl https://YOUR_URL/health

# Test 2: MCP Tools (should return 11)
curl https://YOUR_URL/api/mcp/tools | jq '.count'

# Test 3: Creative Agent Status
curl https://YOUR_URL/api/creative-agent/status

# Test 4: 🎨 GENERATE IDEAS! (30-60 seconds)
curl -X POST https://YOUR_URL/api/creative-agent/run
```

---

## 🎉 SUCCESS CRITERIA

**You'll know it's working when:**

✅ Health check returns: `{"status": "UP"}`
✅ MCP tools returns: `{"count": 11}`
✅ Creative Agent status returns: `{"isRunning": true}`
✅ Generate ideas returns: 3 ideas + 2 mini-apps with CODE!
✅ No errors in Railway logs

---

## 🚨 Common Issues & Solutions

### Issue: "GEMINI_API_KEY is required"
**Solution:** Make sure you pasted ALL variables in Railway Variables tab

### Issue: "Cannot connect to Supabase"
**Solution:** 
1. Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
2. Make sure Supabase project is active (not paused)

### Issue: "Cannot connect to Redis"
**Solution:** 
1. Check REDIS_URL format is correct
2. Test Redis connection from your computer first:
   ```python
   import redis
   r = redis.Redis(host='redis-13608.c84.us-east-1-2.ec2.redns.redis-cloud.com', 
                   port=13608, username="default", 
                   password="hOgB8zfnI5UcRqfnuAw3ehX5a6Fzs4gr")
   print(r.ping())  # Should return True
   ```

### Issue: "OpenMemory queries fail"
**Solution:** Make sure you ran `SUPABASE_MIGRATION_SCRIPT.sql` in Supabase SQL Editor!

---

## 📞 Need Help?

**Check these guides:**
- `DEPLOY_NOW_RAILWAY_CHECKLIST.md` - Detailed step-by-step
- `SUPABASE_MIGRATION_SCRIPT.sql` - Database setup
- `DEPLOYMENT_SUCCESS_TESTS.sh` - Automated testing

---

**Status:** ✅ READY TO DEPLOY  
**Time:** ⚡ 10-15 minutes  
**Result:** 🚀 MVP LIVE!

---

**GO TO RAILWAY.APP NOW AND START DEPLOYMENT!** 🚀🔥
