# 🔐 GitHub Secrets - Quick Reference

**Generated**: October 22, 2025

---

## ✅ GENERATED FOR YOU

### METRICS_API_KEY
```
107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e
```

**⚠️ SAVE THIS KEY!** You'll need it to access `/health/metrics` endpoint.

---

## 📋 SECRETS TO ADD MANUALLY

Go to: **https://github.com/Moeabdelaziz007/Amrikyy-Agent/settings/secrets/actions**

Click **"New repository secret"** for each:

---

### 1. METRICS_API_KEY ✅ (Already generated above)
**Name**: `METRICS_API_KEY`  
**Value**: `107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e`

---

### 2. RAILWAY_TOKEN (Required for backend deployment)
**Name**: `RAILWAY_TOKEN`  
**Where to get**: https://railway.app/account/tokens

**Steps**:
1. Go to Railway dashboard
2. Click on your profile → Account Settings
3. Click "Tokens" in sidebar
4. Click "Create New Token"
5. Name it: `GitHub Actions`
6. Copy the token (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
7. Paste as secret value

---

### 3. VERCEL_TOKEN (Required for frontend deployment)
**Name**: `VERCEL_TOKEN`  
**Where to get**: https://vercel.com/account/tokens

**Steps**:
1. Go to Vercel dashboard
2. Click Settings → Tokens
3. Click "Create"
4. Scope: Full Account
5. Name: `GitHub Actions`
6. Click "Create Token"
7. Copy the token
8. Paste as secret value

---

### 4. VERCEL_ORG_ID (Required for frontend deployment)
**Name**: `VERCEL_ORG_ID`  
**Where to get**: Run `vercel link` in frontend directory

**Steps**:
```bash
# Install Vercel CLI if needed
npm install -g vercel

# Go to frontend directory
cd frontend/

# Link to Vercel project
vercel link

# View the generated file
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxx"
}
```

Copy the **orgId** value and paste as secret.

---

### 5. VERCEL_PROJECT_ID (Required for frontend deployment)
**Name**: `VERCEL_PROJECT_ID`  
**Where to get**: Same `.vercel/project.json` file from above

Copy the **projectId** value and paste as secret.

---

### 6. SENTRY_DSN (Required for error tracking)
**Name**: `SENTRY_DSN`  
**Where to get**: https://sentry.io

**Steps**:
1. Go to https://sentry.io
2. Sign up or log in
3. Create new project:
   - Platform: **Node.js**
   - Project name: `amrikyy-backend`
4. After creation, copy the DSN
5. Or: Settings → Projects → Your Project → Client Keys (DSN)
6. Format: `https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx`
7. Paste as secret value

---

## 🎯 OPTIONAL SECRETS (for enhanced features)

### 7. SONAR_TOKEN (Code quality analysis)
**Name**: `SONAR_TOKEN`  
**Where to get**: https://sonarcloud.io/account/security

**Steps**:
1. Sign up with GitHub
2. Go to My Account → Security
3. Generate new token: `GitHub Actions`
4. Copy and paste as secret

---

### 8. SLACK_WEBHOOK (Deployment notifications)
**Name**: `SLACK_WEBHOOK`  
**Where to get**: Slack → Apps → Incoming Webhooks

**Steps**:
1. Go to https://api.slack.com/apps
2. Create new app or use existing
3. Enable Incoming Webhooks
4. Add webhook to workspace
5. Choose channel (e.g., #deployments)
6. Copy webhook URL
7. Format: `https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXX`
8. Paste as secret

---

## ✅ CHECKLIST

After adding secrets, verify you have:

**Required** (6 secrets):
- [ ] METRICS_API_KEY
- [ ] RAILWAY_TOKEN
- [ ] VERCEL_TOKEN
- [ ] VERCEL_ORG_ID
- [ ] VERCEL_PROJECT_ID
- [ ] SENTRY_DSN

**Optional** (2 secrets):
- [ ] SONAR_TOKEN
- [ ] SLACK_WEBHOOK

---

## 🚀 VERIFICATION

After adding all secrets:

1. **View secrets**:
   - Go to: https://github.com/Moeabdelaziz007/Amrikyy-Agent/settings/secrets/actions
   - You should see all 6-8 secrets listed

2. **Update local .env**:
```bash
# Add to backend/.env
echo "SENTRY_DSN=your-sentry-dsn-here" >> backend/.env
echo "METRICS_API_KEY=107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e" >> backend/.env
```

3. **Test CI/CD**:
```bash
# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI/CD with secrets"
git push

# Watch the workflow run
# Go to: https://github.com/Moeabdelaziz007/Amrikyy-Agent/actions
```

4. **Deploy to production**:
```bash
git checkout main
git merge cursor/enhance-backend-codebase-after-audit-c742
git push origin main

# This will trigger:
# - All tests
# - Security scan
# - Backend deployment to Railway
# - Frontend deployment to Vercel
# - Health checks
```

---

## 📞 NEED HELP?

**Can't create Railway token?**
- Make sure you have a Railway account
- Go to https://railway.app/new to create a project first

**Can't create Vercel token?**
- Make sure you have a Vercel account
- Import your project from GitHub first

**Can't find Vercel org/project IDs?**
- Run `vercel link` in frontend directory
- Follow the prompts to link your project
- Check `.vercel/project.json` for IDs

**Sentry DSN not working?**
- Make sure you created a Node.js project
- Format should start with `https://`
- Includes `@oxxxxxx.ingest.sentry.io/`

---

## 🔗 QUICK LINKS

- **GitHub Secrets**: https://github.com/Moeabdelaziz007/Amrikyy-Agent/settings/secrets/actions
- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry Projects**: https://sentry.io/organizations/
- **GitHub Actions**: https://github.com/Moeabdelaziz007/Amrikyy-Agent/actions

---

**📝 Remember**: Save your METRICS_API_KEY somewhere safe!

`107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e`
