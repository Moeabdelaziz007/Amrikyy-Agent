# 🚀 Render + Vercel Deployment Guide

> **Step-by-step guide to deploy Amrikyy Agent backend to Render and frontend to Vercel**

## 🎯 **Quick Deployment Steps**

### **🔧 Backend to Render (5 minutes)**

1. **Go to Render**: [https://dashboard.render.com](https://dashboard.render.com)
2. **New Web Service** → Connect GitHub → `Moeabdelaziz007/Amrikyy-Agent`
3. **Configure:**
   ```yaml
   Name: amrikyy-agent-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables** (Add these in Render):
   ```bash
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy** → Wait 5-10 minutes → Note URL: `https://your-backend.onrender.com`

### **🌐 Frontend to Vercel (3 minutes)**

#### Option A: Vercel CLI (Recommended)
```bash
npm i -g vercel
cd frontend
vercel login
vercel --prod
```

#### Option B: Vercel Dashboard
1. **Go to Vercel**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Add New Project** → Import `Moeabdelaziz007/Amrikyy-Agent`
3. **Configure:**
   ```yaml
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Environment Variables:**
   ```bash
   VITE_API_URL=https://your-backend.onrender.com
   ```

5. **Deploy** → Note URL: `https://your-frontend.vercel.app`

---

## ✅ **Test Deployment**

### Backend Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

### Frontend Test
Visit: `https://your-frontend.vercel.app`

---

## 🔗 **Update Production URLs**

Update your README.md with the actual URLs:
```markdown
- Frontend: https://your-actual-frontend.vercel.app
- Backend: https://your-actual-backend.onrender.com
```

---

## 📱 **Expected URLs Format**

- **Backend**: `https://amrikyy-agent-backend-xyz.onrender.com`
- **Frontend**: `https://amrikyy-agent-frontend-xyz.vercel.app`

**🎉 Done! Your application is now live in production!**
