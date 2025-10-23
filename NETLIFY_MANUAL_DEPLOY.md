# 🚀 Netlify Manual Deploy - Step by Step

**Current Status**: Build ready, CLI installed  
**Next Step**: Login and deploy

---

## 📋 Prerequisites

✅ Netlify CLI installed  
✅ Build successful (dist/ folder ready)  
✅ Code pushed to GitHub  

---

## 🔐 Step 1: Login to Netlify

### **Option A: Browser Login** (Recommended)

```bash
netlify login
```

This will:
1. Open browser
2. Ask you to authorize
3. Return to terminal
4. Ready to deploy!

### **Option B: Token Login** (If browser doesn't work)

1. Go to: https://app.netlify.com/user/applications
2. Click: **New access token**
3. Name: `Amrikyy Deploy`
4. Copy token
5. Run:
```bash
export NETLIFY_AUTH_TOKEN=your-token-here
```

---

## 🚀 Step 2: Deploy

### **First Time Deploy**

```bash
cd /workspaces/Amrikyy-Agent/frontend
netlify deploy
```

**Follow prompts**:
```
? What would you like to do? 
  ❯ Create & configure a new site

? Team: 
  ❯ Your Team Name

? Site name (optional): 
  ❯ amrikyy-ai-os

? Publish directory: 
  ❯ dist
```

This creates a **draft deploy** for testing.

---

### **Production Deploy**

After testing draft, deploy to production:

```bash
netlify deploy --prod
```

Or do it in one step:

```bash
netlify deploy --prod --dir=dist
```

---

## 📊 What Happens

### **During Deploy**:
```
Deploying to draft URL...
✔ Finished hashing 
✔ CDN requesting 7 files
✔ Finished uploading 7 assets
✔ Deploy is live!

Draft URL: https://[random-id]--amrikyy-ai-os.netlify.app
```

### **After Production Deploy**:
```
Deploying to production...
✔ Deploy is live!

Production URL: https://amrikyy-ai-os.netlify.app
```

---

## 🎯 Alternative: Use Dashboard

If CLI doesn't work, use dashboard method:

### **Step 1: Go to Netlify**
https://app.netlify.com/

### **Step 2: New Site from Git**
1. Click: **Add new site** → **Import an existing project**
2. Choose: **GitHub**
3. Select: **Amrikyy-Agent**
4. Branch: **main**

### **Step 3: Build Settings**
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### **Step 4: Deploy**
Click **Deploy site** - Done! ✅

---

## 📁 Files Ready for Deploy

```
frontend/dist/
├── assets/
│   ├── index-DKDIdL-r.css (96 KB)
│   ├── index-BbTES-mG.js (1.3 MB)
│   ├── purify.es-BLKhEpFv.js (23 KB)
│   ├── index.es-DOCyu9PK.js (157 KB)
│   └── html2canvas.esm-BTH0Ap93.js (200 KB)
└── index.html (0.59 KB)

Total: ~1.8 MB
```

---

## ✅ Verification

After deploy, test:

1. **Homepage**: https://your-site.netlify.app/
2. **OS Page**: https://your-site.netlify.app/os
3. **AI Dashboard**: https://your-site.netlify.app/ai-ui
4. **Landing**: https://your-site.netlify.app/landing

---

## 🔧 Troubleshooting

### **Issue: netlify login doesn't open browser**

**Solution**: Use token method
```bash
# Get token from: https://app.netlify.com/user/applications
export NETLIFY_AUTH_TOKEN=your-token
netlify deploy --prod --dir=dist
```

### **Issue: Command not found**

**Solution**: Reinstall CLI
```bash
npm install -g netlify-cli
```

### **Issue: Build not found**

**Solution**: Build first
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## 🎯 Quick Commands

```bash
# Login
netlify login

# Deploy draft (test first)
cd /workspaces/Amrikyy-Agent/frontend
netlify deploy

# Deploy production
netlify deploy --prod

# Check status
netlify status

# Open site
netlify open:site
```

---

## 📊 Expected Output

```
Deploy path:        /workspaces/Amrikyy-Agent/frontend/dist
Configuration path: /workspaces/Amrikyy-Agent/netlify.toml
Deploying to main site URL...
✔ Finished hashing 7 files
✔ CDN requesting 7 files
✔ Finished uploading 7 assets
✔ Deploy is live!

Logs:              https://app.netlify.com/sites/amrikyy-ai-os/deploys/...
Unique Deploy URL: https://[id]--amrikyy-ai-os.netlify.app
Website URL:       https://amrikyy-ai-os.netlify.app
```

---

## 🎉 Success!

Once deployed:
- ✅ Your site is live
- ✅ HTTPS enabled
- ✅ CDN active
- ✅ Auto-deploy on git push
- ✅ All 9 pages working

---

**Ready to deploy?** Run:

```bash
netlify login
cd /workspaces/Amrikyy-Agent/frontend
netlify deploy --prod
```

---

**Last Updated**: October 23, 2025  
**Status**: Ready to deploy  
**Time**: 2 minutes
