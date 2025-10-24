# Deploy Amrikyy to Netlify - Quick Guide

**Status**: ✅ Build Successful  
**Build Output**: `frontend/dist/`  
**Ready to Deploy**: YES

---

## 🚀 Option 1: Deploy via Netlify CLI (Recommended)

### **Step 1: Login to Netlify**
```bash
netlify login
```
This will open a browser window to authenticate.

### **Step 2: Deploy**
```bash
cd /workspaces/Amrikyy-Agent
netlify deploy --prod --dir=frontend/dist
```

**OR** if you want to create a new site:
```bash
netlify deploy --prod --dir=frontend/dist --site-name=amrikyy-ai-os
```

---

## 🌐 Option 2: Deploy via Netlify Dashboard (Easiest)

### **Step 1: Go to Netlify**
Visit: [https://app.netlify.com/](https://app.netlify.com/)

### **Step 2: Drag & Drop**
1. Click "Add new site" → "Deploy manually"
2. Drag the `frontend/dist` folder to the upload area
3. Wait for deployment (30-60 seconds)
4. Get your live URL!

---

## 🔗 Option 3: Connect GitHub Repository

### **Step 1: Push to GitHub**
```bash
cd /workspaces/Amrikyy-Agent
git add .
git commit -m "feat: ready for Netlify deployment"
git push origin main
```

### **Step 2: Connect on Netlify**
1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub
4. Select `Amrikyy-Agent` repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Click "Deploy site"

### **Step 3: Add Environment Variables**
In Netlify dashboard → Site settings → Environment variables:
```
VITE_API_URL=https://amrikyy-agent.onrender.com
VITE_GEMINI_API_KEY=AIzaSyDbNxJcOnP3PCHPZVtBdA3v3Oep4Owhpg0
```

---

## ✅ Build Verification

**Build completed successfully:**
```
✓ 2951 modules transformed
✓ built in 23.37s

Output files:
- dist/index.html (0.59 kB)
- dist/assets/index-BtSxgpzg.css (92.08 kB)
- dist/assets/index-CGixQg1B.js (1,318.93 kB)
```

**Total size**: ~1.6 MB (gzipped: ~460 KB)

---

## 🔧 Netlify Configuration

**File**: `netlify.toml` (already configured)
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 🎯 Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Agent UIs working
- [ ] Theme switching works
- [ ] i18n (Arabic/English) works
- [ ] API calls to backend work
- [ ] No console errors

---

## 🔗 Expected URLs

**Netlify will provide:**
- Production: `https://amrikyy-ai-os.netlify.app` (or custom domain)
- Preview: `https://deploy-preview-XX--amrikyy-ai-os.netlify.app`

---

## 🐛 Troubleshooting

### **Issue: Build fails on Netlify**
```bash
# Test build locally first
cd frontend
npm run build
```

### **Issue: API calls fail**
Check environment variables in Netlify dashboard:
- `VITE_API_URL` should point to your backend
- `VITE_GEMINI_API_KEY` should be set

### **Issue: 404 on routes**
The `netlify.toml` redirects are configured correctly.
If still failing, add this to `frontend/public/_redirects`:
```
/*    /index.html   200
```

---

## 📊 Deployment Stats

| Metric | Value |
|--------|-------|
| Build Time | ~23 seconds |
| Bundle Size | 1.3 MB (393 KB gzipped) |
| Modules | 2,951 |
| Node Version | 18 |
| Status | ✅ Ready |

---

## 🎉 Quick Deploy Command

**If you're already logged in to Netlify CLI:**
```bash
cd /workspaces/Amrikyy-Agent && netlify deploy --prod --dir=frontend/dist
```

**First time setup:**
```bash
# 1. Login
netlify login

# 2. Initialize site
netlify init

# 3. Deploy
netlify deploy --prod
```

---

## 🔐 Security Notes

**Environment Variables to Set on Netlify:**
```
VITE_API_URL=https://your-backend-url.com
VITE_GEMINI_API_KEY=your-key-here
```

**DO NOT commit** `.env` files with real API keys!

---

## 📞 Need Help?

**Netlify Docs**: [https://docs.netlify.com/](https://docs.netlify.com/)  
**Support**: [https://answers.netlify.com/](https://answers.netlify.com/)

---

**Status**: ✅ Build Complete - Ready to Deploy!  
**Next Step**: Choose deployment option above  
**Estimated Time**: 2-5 minutes
