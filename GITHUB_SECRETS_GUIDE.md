# 🔐 GitHub Secrets Setup Guide

Complete guide for adding GitHub secrets required for CI/CD and monitoring.

---

## 🎯 Overview

You need to add secrets to GitHub for:
- **CI/CD Pipeline** (automated deployments)
- **Error Tracking** (Sentry)
- **Monitoring** (metrics API)
- **Code Quality** (SonarCloud - optional)
- **Notifications** (Slack - optional)

---

## 📋 Required Secrets (6)

### 1. RAILWAY_TOKEN
**Purpose**: Deploy backend to Railway automatically

**How to get**:
1. Go to https://railway.app/account/tokens
2. Click **"Create New Token"**
3. Name it: `GitHub Actions`
4. Copy the token
5. **Important**: Save it - you won't see it again!

**Format**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

### 2. VERCEL_TOKEN
**Purpose**: Deploy frontend to Vercel automatically

**How to get**:
1. Go to https://vercel.com/account/tokens
2. Click **"Create"**
3. Scope: Full Account
4. Expiration: No Expiration (or 1 year)
5. Name it: `GitHub Actions`
6. Click **"Create Token"**
7. Copy the token

**Format**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 3. VERCEL_ORG_ID
**Purpose**: Identify your Vercel organization

**How to get**:

**Option A - Using Vercel CLI** (Recommended):
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Navigate to frontend directory
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

Copy the `orgId` value.

**Option B - From Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Click on your team/account name
3. Go to Settings → General
4. Copy the "Team ID" or "Organization ID"

**Format**: `team_xxxxxxxxxxxxxxxxx` or `xxxxxxxxxxxxxxxxx`

---

### 4. VERCEL_PROJECT_ID
**Purpose**: Identify your Vercel project

**How to get**:

**Option A - Using Vercel CLI** (Recommended):
```bash
# From the .vercel/project.json file created above
cat frontend/.vercel/project.json
```

Copy the `projectId` value.

**Option B - From Vercel Dashboard**:
1. Go to your project in Vercel
2. Go to Settings
3. Copy the "Project ID" under General

**Format**: `prj_xxxxxxxxxxxxxxxxx`

---

### 5. SENTRY_DSN
**Purpose**: Send errors to Sentry for tracking

**How to get**:
1. Go to https://sentry.io
2. Sign up or log in
3. Create a new project:
   - Platform: **Node.js**
   - Project name: `amrikyy-backend`
4. After creation, you'll see the DSN
5. Or go to: **Settings → Projects → Your Project → Client Keys (DSN)**
6. Copy the DSN

**Format**: `https://xxxxxxxxxxxxx@oxxxxxx.ingest.sentry.io/xxxxxx`

**Example**: `https://a1b2c3d4e5f6@o123456.ingest.sentry.io/7890123`

---

### 6. METRICS_API_KEY
**Purpose**: Secure access to metrics endpoint

**How to get** (Generate it):
```bash
# Generate a secure random key
openssl rand -hex 32
```

**Example output**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

**Save this key** - you'll need it to access `/health/metrics`

---

## 📋 Optional Secrets (2)

### 7. SONAR_TOKEN (Optional - Code Quality)
**Purpose**: Automated code quality analysis

**How to get**:
1. Go to https://sonarcloud.io
2. Sign up with GitHub
3. Click on your avatar → My Account → Security
4. Generate new token:
   - Name: `GitHub Actions`
   - Type: User Token
5. Copy the token

**Format**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 8. SLACK_WEBHOOK (Optional - Notifications)
**Purpose**: Send deployment notifications to Slack

**How to get**:
1. Go to your Slack workspace
2. Go to https://api.slack.com/apps
3. Create a new app or use existing
4. Go to **Incoming Webhooks**
5. Activate Incoming Webhooks
6. Click **"Add New Webhook to Workspace"**
7. Choose channel (e.g., #deployments)
8. Copy the Webhook URL

**Format**: URL starts with `https://hooks.slack.com/services/` followed by your unique webhook path

---

## 🚀 Method 1: Using the Automated Script

### Quick Setup (Recommended):
```bash
# Make script executable
chmod +x setup-github-secrets.sh

# Run the script
./setup-github-secrets.sh
```

The script will:
1. ✅ Check if GitHub CLI is installed
2. ✅ Authenticate you with GitHub
3. ✅ Prompt for each secret
4. ✅ Add secrets to GitHub automatically
5. ✅ Generate METRICS_API_KEY automatically
6. ✅ Show summary of added secrets

---

## 🚀 Method 2: Using GitHub CLI Manually

### Prerequisites:
```bash
# Install GitHub CLI (if not installed)
# Ubuntu/Debian:
sudo apt install gh

# Mac:
brew install gh

# Authenticate
gh auth login
```

### Add Secrets:
```bash
# 1. RAILWAY_TOKEN
gh secret set RAILWAY_TOKEN
# Paste token when prompted

# 2. VERCEL_TOKEN
gh secret set VERCEL_TOKEN
# Paste token when prompted

# 3. VERCEL_ORG_ID
gh secret set VERCEL_ORG_ID
# Paste org ID when prompted

# 4. VERCEL_PROJECT_ID
gh secret set VERCEL_PROJECT_ID
# Paste project ID when prompted

# 5. SENTRY_DSN
gh secret set SENTRY_DSN
# Paste DSN when prompted

# 6. METRICS_API_KEY (auto-generate)
gh secret set METRICS_API_KEY --body "$(openssl rand -hex 32)"

# Optional: SONAR_TOKEN
gh secret set SONAR_TOKEN
# Paste token when prompted

# Optional: SLACK_WEBHOOK
gh secret set SLACK_WEBHOOK
# Paste webhook URL when prompted
```

### Verify:
```bash
# List all secrets
gh secret list
```

---

## 🚀 Method 3: Using GitHub Web Interface

### Steps:
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **"New repository secret"**
5. Add each secret:
   - Name: `RAILWAY_TOKEN`
   - Secret: Paste the token
   - Click **"Add secret"**
6. Repeat for all secrets

### Direct Link:
```
https://github.com/YOUR_USERNAME/Amrikyy-Agent/settings/secrets/actions
```

---

## 📝 Checklist

After setup, verify you have:

### Required Secrets:
- [ ] RAILWAY_TOKEN
- [ ] VERCEL_TOKEN
- [ ] VERCEL_ORG_ID
- [ ] VERCEL_PROJECT_ID
- [ ] SENTRY_DSN
- [ ] METRICS_API_KEY

### Optional Secrets:
- [ ] SONAR_TOKEN (code quality)
- [ ] SLACK_WEBHOOK (notifications)

---

## 🔍 Verification

### Check Secrets are Added:
```bash
# Using GitHub CLI
gh secret list

# Should show:
# METRICS_API_KEY    Updated 2024-10-22
# RAILWAY_TOKEN      Updated 2024-10-22
# SENTRY_DSN         Updated 2024-10-22
# SLACK_WEBHOOK      Updated 2024-10-22
# SONAR_TOKEN        Updated 2024-10-22
# VERCEL_ORG_ID      Updated 2024-10-22
# VERCEL_PROJECT_ID  Updated 2024-10-22
# VERCEL_TOKEN       Updated 2024-10-22
```

### Test CI/CD Pipeline:
```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push

# Watch GitHub Actions run
gh run watch
```

---

## 🔐 Security Best Practices

### DO:
- ✅ Use different tokens for different environments
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use the minimum required permissions
- ✅ Monitor secret usage in GitHub Actions logs
- ✅ Delete unused secrets

### DON'T:
- ❌ Commit secrets to your repository
- ❌ Share secrets in chat or email
- ❌ Use the same token for multiple purposes
- ❌ Give tokens unlimited expiration (if avoidable)
- ❌ Store secrets in .env files in repo

---

## 🆘 Troubleshooting

### "Secret not found" in GitHub Actions

**Solution**: 
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is added to repository (not organization)
3. Re-add the secret

### "Invalid token" errors

**Solution**:
1. Generate a new token
2. Make sure you copied the entire token
3. Check token hasn't expired
4. Verify token has correct permissions

### Vercel deployment fails

**Solution**:
1. Run `vercel link` in frontend/ directory
2. Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID match .vercel/project.json
3. Check VERCEL_TOKEN has correct scope

### Railway deployment fails

**Solution**:
1. Verify RAILWAY_TOKEN is valid
2. Check Railway project is linked to repository
3. Verify environment variables are set in Railway dashboard

---

## 📊 After Adding Secrets

### Update Local Environment:
```bash
# Add to backend/.env
echo "SENTRY_DSN=your-sentry-dsn-here" >> backend/.env
echo "METRICS_API_KEY=your-generated-key-here" >> backend/.env
```

### Test Locally:
```bash
# Start backend
cd backend
npm run dev

# Test health endpoint
curl http://localhost:5000/health/detailed

# Test metrics endpoint
curl -H "x-api-key: YOUR_METRICS_KEY" http://localhost:5000/health/metrics
```

### Trigger Deployment:
```bash
# Merge to main
git checkout main
git merge cursor/enhance-backend-codebase-after-audit-c742
git push origin main

# Watch deployment
gh run watch
```

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ GitHub Actions workflow runs without errors
- ✅ Tests pass in CI
- ✅ Backend deploys to Railway
- ✅ Frontend deploys to Vercel
- ✅ Health checks pass after deployment
- ✅ You receive Slack notification (if configured)
- ✅ Sentry dashboard shows zero errors (initially)

---

## 📞 Need Help?

If you get stuck:
1. Check the specific service's documentation
2. Verify secret format matches examples
3. Try re-generating the token
4. Check GitHub Actions logs for specific error messages

---

## 🔗 Quick Links

- **Railway Tokens**: https://railway.app/account/tokens
- **Vercel Tokens**: https://vercel.com/account/tokens
- **Sentry DSN**: https://sentry.io → Settings → Projects
- **SonarCloud**: https://sonarcloud.io/account/security
- **GitHub Secrets**: https://github.com/YOUR_REPO/settings/secrets/actions
- **GitHub CLI Docs**: https://cli.github.com/manual/

---

**Last Updated**: October 22, 2025  
**Next Step**: Run `./setup-github-secrets.sh` or follow manual steps above!
