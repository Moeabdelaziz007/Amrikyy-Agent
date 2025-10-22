# 🚀 Quick Start: Add GitHub Secrets

**Time Required**: ~15-20 minutes  
**Difficulty**: Easy

---

## ✅ STEP 1: Generated for You

### METRICS_API_KEY
```
107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e
```

**✅ This is already generated!** Just add it to GitHub secrets.

---

## 📝 STEP 2: Add Secrets to GitHub

### Quick Link:
👉 **https://github.com/Moeabdelaziz007/Amrikyy-Agent/settings/secrets/actions**

Click **"New repository secret"** and add each secret below:

---

### Secret 1: METRICS_API_KEY ✅
- **Name**: `METRICS_API_KEY`
- **Value**: `107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e`

---

### Secret 2: RENDER_API_KEY
- **Name**: `RENDER_API_KEY`
- **Get from**: https://dashboard.render.com/u/settings#api-keys
- **Steps**: 
  1. Click "Create API Key"
  2. Name it "GitHub Actions"
  3. Copy the key (starts with `rnd_...`)

### Secret 3: RENDER_SERVICE_ID
- **Name**: `RENDER_SERVICE_ID`
- **Get from**: Your Render service dashboard URL
- **Steps**:
  1. Go to your service in Render
  2. URL looks like: `dashboard.render.com/web/srv-xxxxx`
  3. Copy the `srv-xxxxx` part

### Secret 4: RENDER_SERVICE_URL
- **Name**: `RENDER_SERVICE_URL`
- **Get from**: Your Render service dashboard
- **Example**: `amrikyy-backend.onrender.com`

---

### Secret 3: VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Get from**: https://vercel.com/account/tokens
- **Steps**:
  1. Click "Create"
  2. Name it "GitHub Actions"
  3. Copy and paste

---

### Secret 4 & 5: Vercel IDs

**Run this in terminal**:
```bash
# Install Vercel CLI
npm install -g vercel

# Go to frontend
cd frontend/

# Link to Vercel
vercel link

# View IDs
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_abc123...",
  "projectId": "prj_xyz789..."
}
```

**Add to GitHub**:
- **Secret Name**: `VERCEL_ORG_ID`
- **Value**: Copy the `orgId` value

- **Secret Name**: `VERCEL_PROJECT_ID`  
- **Value**: Copy the `projectId` value

---

### Secret 8: SENTRY_DSN
- **Name**: `SENTRY_DSN`
- **Get from**: https://sentry.io
- **Steps**:
  1. Sign up / Log in
  2. Create project → Platform: Node.js
  3. Copy the DSN (looks like: `https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx`)
  4. Paste as secret

---

## ✅ STEP 3: Verify

After adding all 8 secrets, you should see:

```
✅ METRICS_API_KEY
✅ RENDER_API_KEY
✅ RENDER_SERVICE_ID
✅ RENDER_SERVICE_URL
✅ VERCEL_TOKEN
✅ VERCEL_ORG_ID
✅ VERCEL_PROJECT_ID
✅ SENTRY_DSN
```

---

## 🚀 STEP 4: Update Local Environment

```bash
cd backend/

# Add to .env file
echo "" >> .env
echo "# Monitoring" >> .env
echo "SENTRY_DSN=your-sentry-dsn-here" >> .env
echo "METRICS_API_KEY=107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e" >> .env
```

Replace `your-sentry-dsn-here` with your actual Sentry DSN.

---

## ✅ STEP 5: Test It!

```bash
# Test locally first
cd backend/
npm run dev

# In another terminal, test health check
curl http://localhost:5000/health/detailed

# Test metrics endpoint
curl -H "x-api-key: 107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e" \
  http://localhost:5000/health/metrics
```

---

## 🚀 STEP 6: Deploy!

```bash
# Merge to main
git checkout main
git merge cursor/enhance-backend-codebase-after-audit-c742
git push origin main

# GitHub Actions will automatically:
# ✅ Run 520+ tests
# ✅ Scan for security issues
# ✅ Deploy backend to Render
# ✅ Deploy frontend to Vercel
# ✅ Verify health checks
```

**Watch progress**:  
👉 https://github.com/Moeabdelaziz007/Amrikyy-Agent/actions

---

## 📚 Full Documentation

- **Complete Guide**: `GITHUB_SECRETS_GUIDE.md`
- **All Secrets Reference**: `SECRETS_TO_ADD.md`
- **Monitoring Setup**: `MONITORING_SETUP.md`
- **Status Report**: `MONITORING_CI_CD_COMPLETE.md`

---

## 🆘 Common Issues

**"Can't create Render API key"**
- Make sure you have a Render account
- Create a web service first at https://dashboard.render.com

**"Can't create Vercel token"**
- Make sure you have a Vercel account  
- Import project from GitHub first

**"vercel link fails"**
- Make sure Vercel CLI is installed: `npm install -g vercel`
- Log in first: `vercel login`

---

## ✅ YOU'RE DONE WHEN:

- [x] All 6 secrets added to GitHub
- [x] Local `.env` updated with Sentry DSN
- [x] Health endpoint works locally
- [x] Metrics endpoint works locally
- [x] Ready to merge and deploy!

---

**Time to deploy**: ~2 minutes after merging to main! 🚀
