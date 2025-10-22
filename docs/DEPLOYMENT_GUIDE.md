# 🚀 Amrikyy Travel Agent - Deployment Guide

## 📋 Overview

Complete guide for deploying Amrikyy Travel Agent to production on Vercel.

**Status:** Production Ready ✅  
**Platform:** Vercel  
**Build Time:** ~2-3 minutes  
**Deploy Time:** ~30 seconds

---

## 🎯 Pre-Deployment Checklist

### ✅ Code Ready
- [x] All routes organized and tested
- [x] Components built and optimized
- [x] Environment variables documented
- [x] Build succeeds locally
- [x] No console errors
- [x] TypeScript compiles without errors

### ✅ Configuration Files
- [x] `vercel.json` created
- [x] `vite.config.ts` optimized
- [x] `.env.example` documented
- [x] `package.json` dependencies updated

### ✅ Documentation
- [x] Routes documented
- [x] UI features documented
- [x] API endpoints documented
- [x] README updated

---

## 🔧 Step 1: Environment Setup

### Required Environment Variables

Create `.env` file in `frontend/` directory:

```bash
# Vercel Analytics
VITE_VERCEL_ANALYTICS_ID=your_analytics_id

# API Configuration
VITE_API_URL=https://your-backend-url.com
VITE_API_TIMEOUT=30000

# Google Services (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_SEARCH_CONSOLE_API_KEY=your_gsc_api_key

# Feature Flags
VITE_ENABLE_SEO_DASHBOARD=true
VITE_ENABLE_CODEBASE_EXPLORER=true
VITE_ENABLE_AUTONOMOUS_DASHBOARD=false

# Environment
VITE_NODE_ENV=production
```

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# External APIs
KIWI_API_KEY=your_kiwi_api_key
BOOKING_API_KEY=your_booking_api_key
MAPBOX_API_KEY=your_mapbox_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server
PORT=5000
NODE_ENV=production
```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd frontend
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? amrikyy-travel-agent
# - Directory? ./
# - Override settings? No
```

### Option B: Deploy via GitHub Integration

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import `Moeabdelaziz007/Amrikyy-Agent`
   - Select `frontend` as root directory

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Save changes

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get deployment URL

---

## 🔗 Step 3: Configure Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain: `amrikyy.com`
3. Configure DNS records:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (5-30 minutes)
5. Verify SSL certificate is active

---

## 📊 Step 4: Verify Deployment

### Test All Routes

```bash
# Public routes
✅ https://amrikyy.vercel.app/
✅ https://amrikyy.vercel.app/landing

# OS routes
✅ https://amrikyy.vercel.app/os
✅ https://amrikyy.vercel.app/os-demo
✅ https://amrikyy.vercel.app/mobile-demo

# Dashboard routes
✅ https://amrikyy.vercel.app/dashboard
✅ https://amrikyy.vercel.app/seo
✅ https://amrikyy.vercel.app/codebase

# Coming soon routes
✅ https://amrikyy.vercel.app/search
✅ https://amrikyy.vercel.app/bookings
✅ https://amrikyy.vercel.app/auth
✅ https://amrikyy.vercel.app/autonomous

# Error routes
✅ https://amrikyy.vercel.app/invalid-route (404)
```

### Check Performance

```bash
# Run Lighthouse audit
npx lighthouse https://amrikyy.vercel.app/ --view

# Target scores:
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 95+
```

### Verify Analytics

1. Go to Vercel Dashboard → Analytics
2. Check real-time visitors
3. Verify page views tracking
4. Check Web Vitals metrics

---

## 🔐 Step 5: Security Configuration

### Enable Security Headers

Already configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Enable HTTPS

- ✅ Automatic with Vercel
- ✅ SSL certificate auto-renewed
- ✅ HTTP → HTTPS redirect enabled

### Configure CORS

Add to backend `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://amrikyy.vercel.app',
    'https://www.amrikyy.com',
    'http://localhost:5173' // Development
  ],
  credentials: true
}));
```

---

## 📈 Step 6: Monitoring Setup

### Vercel Analytics

Already integrated via `<Analytics />` component.

**Metrics Tracked:**
- Page views
- Unique visitors
- Top pages
- Referrers
- Devices
- Countries

### Error Tracking

Add Sentry (optional):

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

Use Vercel's built-in monitoring or add:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **StatusPage**: Public status page

---

## 🔄 Step 7: CI/CD Setup

### Automatic Deployments

Vercel automatically deploys on:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview
- ✅ Pull requests → Preview

### Deployment Workflow

```
git push origin main
    ↓
GitHub webhook triggers Vercel
    ↓
Vercel builds frontend
    ↓
Run tests (if configured)
    ↓
Deploy to production
    ↓
Invalidate CDN cache
    ↓
Send deployment notification
```

### Rollback Strategy

```bash
# View deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or via Vercel Dashboard:
# Deployments → Select deployment → Promote to Production
```

---

## 🧪 Step 8: Post-Deployment Testing

### Automated Tests

```bash
# Run E2E tests against production
npm run test:e2e -- --baseUrl=https://amrikyy.vercel.app

# Run Lighthouse CI
npm run lighthouse:ci
```

### Manual Testing Checklist

```
Navigation:
✅ All links work
✅ Back button works
✅ Breadcrumbs work

Forms:
✅ Search works
✅ Filters work
✅ Validation works

Performance:
✅ Pages load <2s
✅ Images load properly
✅ No console errors

Mobile:
✅ Responsive on all devices
✅ Touch gestures work
✅ Mobile menu works

SEO:
✅ Meta tags present
✅ Sitemap accessible
✅ Robots.txt configured
```

---

## 📱 Step 9: Mobile App (PWA)

### Enable PWA

Add to `vite.config.ts`:

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Amrikyy Travel Agent',
        short_name: 'Amrikyy',
        description: 'AI-Powered Autonomous Travel Agency',
        theme_color: '#00f3ff',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

### Test PWA

1. Open site on mobile
2. Add to Home Screen
3. Test offline functionality
4. Verify push notifications

---

## 🎯 Step 10: SEO Optimization

### Submit to Search Engines

```bash
# Google Search Console
https://search.google.com/search-console

# Bing Webmaster Tools
https://www.bing.com/webmasters

# Submit sitemap
https://amrikyy.vercel.app/sitemap.xml
```

### Generate Sitemap

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://amrikyy.vercel.app/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://amrikyy.vercel.app/landing</loc>
    <priority>0.9</priority>
  </url>
  <!-- Add all routes -->
</urlset>
```

### Robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://amrikyy.vercel.app/sitemap.xml
```

---

## 📊 Step 11: Analytics Dashboard

### View Deployment Analytics

**Vercel Dashboard:**
- Real-time visitors
- Page views
- Top pages
- Referrers
- Devices
- Countries
- Web Vitals

**Custom Analytics:**
- SEO Dashboard: `/seo`
- Autonomous Dashboard: `/autonomous` (coming soon)

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs [deployment-url]

# Common issues:
1. Missing dependencies → npm install
2. TypeScript errors → npm run type-check
3. Environment variables → Check Vercel settings
4. Build timeout → Optimize bundle size
```

### Routes Not Working

```bash
# Verify vercel.json rewrites
# Should have:
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Slow Performance

```bash
# Check bundle size
npm run build
npm run analyze

# Optimize:
1. Code splitting
2. Lazy loading
3. Image optimization
4. Remove unused dependencies
```

### CORS Errors

```bash
# Add backend URL to CORS whitelist
# In backend/server.js:
app.use(cors({
  origin: 'https://amrikyy.vercel.app'
}));
```

---

## 🎉 Deployment Complete!

### ✅ Checklist

- [x] Frontend deployed to Vercel
- [x] All routes working
- [x] Environment variables configured
- [x] Analytics tracking
- [x] Security headers enabled
- [x] HTTPS enabled
- [x] Performance optimized
- [x] SEO configured
- [x] Monitoring setup

### 🔗 Live URLs

- **Main App:** https://amrikyy.vercel.app/
- **SEO Dashboard:** https://amrikyy.vercel.app/seo
- **Amrikyy OS:** https://amrikyy.vercel.app/os
- **Codebase Explorer:** https://amrikyy.vercel.app/codebase

### 📈 Next Steps

1. **Week 1:** Deploy backend to Railway
2. **Week 2:** Implement authentication
3. **Week 3:** Launch autonomous dashboard
4. **Week 4:** Enable flight search
5. **Week 6:** Launch autonomous booking

---

## 📞 Support

### Resources
- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Router:** https://reactrouter.com

### Issues
- **GitHub Issues:** https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues
- **Vercel Support:** https://vercel.com/support

---

**Deployment Status:** ✅ Production Ready  
**Last Updated:** 2025-10-22  
**Platform:** Vercel  
**Build Time:** ~2-3 minutes
