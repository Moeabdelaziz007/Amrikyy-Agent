# ✅ Verify GitHub Secrets

Quick checklist to verify all secrets are configured correctly.

---

## 🔍 Check Your Secrets

Go to: **https://github.com/Moeabdelaziz007/Amrikyy-Agent/settings/secrets/actions**

---

## 📋 Required Secrets (8 total)

### **✅ Monitoring & Metrics**
```
Name: METRICS_API_KEY
Value: 107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e
Status: ✅ Already generated for you!
```

### **🆕 Render Deployment (3 secrets)**

**1. RENDER_API_KEY**
```
Where: https://dashboard.render.com/u/settings#api-keys
How: Click "Create API Key" → Name it "GitHub Actions"
Format: rnd_xxxxxxxxxxxxxxxxxxxxx
```

**2. RENDER_SERVICE_ID**
```
Where: Your service dashboard URL
Example: https://dashboard.render.com/web/srv-xxxxx
Copy: srv-xxxxx part
Format: srv-xxxxxxxxxxxxxxxxxxxxx
```

**3. RENDER_SERVICE_URL**
```
Where: Your service dashboard
Example: amrikyy-backend.onrender.com
Format: your-service-name.onrender.com (without https://)
```

### **🎨 Vercel Frontend (3 secrets)**

**4. VERCEL_TOKEN**
```
Where: https://vercel.com/account/tokens
How: Click "Create" → Name it "GitHub Actions"
Format: Long alphanumeric string
```

**5. VERCEL_ORG_ID**
```
How to get:
1. cd frontend/
2. npm install -g vercel
3. vercel link
4. cat .vercel/project.json
Copy: "orgId" value (team_xxxxx)
```

**6. VERCEL_PROJECT_ID**
```
Same file as above (.vercel/project.json)
Copy: "projectId" value (prj_xxxxx)
```

### **📊 Monitoring (Optional but Recommended)**

**7. SENTRY_DSN**
```
Where: https://sentry.io
How: Create account → New Node.js project → Copy DSN
Format: https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx
Optional: Can skip for now, add later
```

---

## 🚀 Quick Setup Commands

### **Get Vercel IDs**
```bash
cd frontend/
npm install -g vercel
vercel link
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxx",      ← VERCEL_ORG_ID
  "projectId": "prj_xxxxx"    ← VERCEL_PROJECT_ID
}
```

---

## ✅ Verification Checklist

Check each secret exists:

```
Monitoring:
[ ] METRICS_API_KEY ✅ (already have it!)

Render (Backend):
[ ] RENDER_API_KEY
[ ] RENDER_SERVICE_ID
[ ] RENDER_SERVICE_URL

Vercel (Frontend):
[ ] VERCEL_TOKEN
[ ] VERCEL_ORG_ID
[ ] VERCEL_PROJECT_ID

Optional:
[ ] SENTRY_DSN (recommended)
```

---

## 🧪 Test Secrets

After adding all secrets, test with a small commit:

```bash
# Make a test change
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: verify CI/CD with Render"
git push

# Watch the action
# https://github.com/Moeabdelaziz007/Amrikyy-Agent/actions
```

If successful, you'll see:
- ✅ Tests pass
- ✅ Backend deploys to Render
- ✅ Frontend deploys to Vercel
- ✅ Health checks pass

---

## 🔄 Update Existing Secrets

If you had Railway secrets before:

### **Remove (if exists):**
```
❌ RAILWAY_TOKEN (not needed anymore)
```

### **Add:**
```
✅ RENDER_API_KEY
✅ RENDER_SERVICE_ID
✅ RENDER_SERVICE_URL
```

---

## 🆘 Troubleshooting

### **"Secret not found" error**
- Check secret name is EXACTLY as shown (case-sensitive)
- No extra spaces in name or value
- Secret is in "Actions" section, not "Dependabot"

### **Render deployment fails**
- Verify RENDER_API_KEY is valid
- Check RENDER_SERVICE_ID matches your service
- Ensure service exists and is active

### **Vercel deployment fails**
- Verify VERCEL_TOKEN is valid
- Check ORG_ID and PROJECT_ID are correct
- Run `vercel link` again if needed

### **Can't find service ID**
- Go to Render dashboard
- Click on your service
- Look at URL: `dashboard.render.com/web/srv-xxxxx`
- Copy the `srv-xxxxx` part

---

## 📚 Related Guides

- [RENDER_SETUP.md](./RENDER_SETUP.md) - Complete Render setup
- [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md) - Detailed secrets guide
- [QUICK_START_SECRETS.md](./QUICK_START_SECRETS.md) - Quick reference

---

## 🎯 Next Steps

After all secrets are added:

1. **Test deployment** (small commit)
2. **Merge to main** (full deployment)
3. **Verify production** (health checks)
4. **Configure webhooks** (Stripe, PayPal)
5. **Add custom domain** (optional)

---

**Need help?** Check the full guides or create an issue!

**Last Updated**: October 22, 2025
