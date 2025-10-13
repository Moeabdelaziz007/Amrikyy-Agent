# Quick Start Guide

Get the Amrikyy AI Automation Platform running in **5 minutes**! ⚡

---

## 🎯 What You'll Get

After following this guide, you'll have:
- ✅ Backend API running on `http://localhost:5001`
- ✅ Frontend app running on `http://localhost:8080`
- ✅ Database connected (Supabase)
- ✅ AI services ready (Z.ai)
- ✅ Payment processing configured (Stripe)

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com))
- **Code Editor** (VS Code recommended)

**Check your versions**:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
git --version   # Any recent version
```

---

## 🚀 5-Minute Setup

### Step 1: Clone the Repository (30 seconds)

```bash
git clone https://github.com/Moeabdelaziz007/amrikyy-agent.git
cd amrikyy-agent
```

### Step 2: Install Dependencies (2 minutes)

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

**What this does**: Installs all required packages for both backend and frontend.

### Step 3: Configure Environment Variables (1 minute)

```bash
# Backend configuration
cd backend
cp env.example .env

# Frontend configuration
cd ../frontend
cp .env.example .env
```

**Edit the `.env` files** with your API keys:

**Backend** (`backend/.env`):
```bash
# Required - Get from https://supabase.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Required - Get from https://z.ai
ZAI_API_KEY=your_zai_api_key_here

# Required - Get from https://dashboard.stripe.com
STRIPE_SECRET_KEY=sk_test_your_key_here

# Required - Generate random string
JWT_SECRET=your_super_secret_jwt_key_here
```

**Frontend** (`frontend/.env`):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Don't have API keys yet?** See [Getting API Keys](#getting-api-keys) below.

### Step 4: Setup Database (1 minute)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to SQL Editor
4. Copy contents of `backend/database/production-schema-complete.sql`
5. Paste and execute in SQL Editor

**Done!** Your database is ready.

### Step 5: Start the Application (30 seconds)

```bash
# From project root
npm run dev
```

**This starts**:
- Backend API on `http://localhost:5001`
- Frontend app on `http://localhost:8080`

---

## ✅ Verify It's Working

### Test Backend

Open http://localhost:5001/api/health

You should see:
```json
{
  "status": "healthy",
  "service": "amrikyy-backend",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### Test Frontend

Open http://localhost:8080

You should see the Amrikyy landing page with:
- Animated hero section
- Search functionality
- Beautiful UI

### Test AI Chat

```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test"}'
```

You should get an AI response!

---

## 🎓 Next Steps

Now that everything is running:

### 1. Explore the App
- Search for flights/hotels
- Try the AI chat
- Test the booking flow

### 2. Read the Documentation
- [API Reference](API_REFERENCE.md) - All API endpoints
- [Backend README](backend/README.md) - Backend details
- [Frontend README](frontend/README.md) - Frontend details
- [Environment Setup](ENV_SETUP.md) - Complete configuration guide

### 3. Start Developing
```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend
npm run dev

# Run tests
npm test
```

### 4. Deploy to Production
See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides:
- Railway
- Vercel
- Docker
- Manual deployment

---

## 🔑 Getting API Keys

### Supabase (Database) - FREE

1. Go to https://supabase.com
2. Click "Start your project"
3. Create account (GitHub login recommended)
4. Click "New project"
5. Fill in:
   - Name: `amrikyy-travel`
   - Database Password: (generate strong password)
   - Region: (closest to you)
6. Wait 2 minutes for project creation
7. Go to Settings → API
8. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

**Cost**: Free tier includes:
- 500MB database
- 1GB file storage
- 50,000 monthly active users

### Z.ai (AI Service) - FREE TRIAL

1. Go to https://z.ai
2. Sign up for account
3. Navigate to API Keys
4. Click "Create API Key"
5. Copy key → `ZAI_API_KEY`

**Cost**: Free trial, then pay-as-you-go

### Stripe (Payments) - FREE

1. Go to https://dashboard.stripe.com/register
2. Create account
3. Skip business details (use test mode)
4. Go to Developers → API keys
5. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `STRIPE_PUBLISHABLE_KEY`

**Cost**: Free (only pay transaction fees on real payments)

### Optional: Amadeus (Travel API) - FREE

1. Go to https://developers.amadeus.com
2. Create account
3. Create new app
4. Copy:
   - API Key → `AMADEUS_API_KEY`
   - API Secret → `AMADEUS_API_SECRET`

**Cost**: Free tier includes 2,000 API calls/month

---

## 🐛 Troubleshooting

### "Port already in use"

**Problem**: Port 5001 or 8080 is already taken

**Solution**:
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change ports in .env files
```

### "Module not found"

**Problem**: Dependencies not installed

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm run install:all
```

### "Database connection failed"

**Problem**: Invalid Supabase credentials

**Solution**:
1. Double-check URL and keys in Supabase dashboard
2. Ensure no extra spaces in `.env` file
3. Verify project is active (not paused)
4. Test connection:
   ```bash
   curl -H "apikey: YOUR_ANON_KEY" \
     https://YOUR_PROJECT.supabase.co/rest/v1/
   ```

### "AI API error"

**Problem**: Invalid Z.ai API key

**Solution**:
1. Verify key in Z.ai dashboard
2. Check for typos in `.env`
3. Ensure key has not expired
4. Test with curl:
   ```bash
   curl -X POST http://localhost:5001/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "userId": "test"}'
   ```

### "Frontend shows blank page"

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify backend is running: http://localhost:5001/api/health
2. Check `VITE_API_URL` in `frontend/.env`
3. Check browser console for errors
4. Verify CORS settings in `backend/.env`:
   ```bash
   CORS_ORIGIN=http://localhost:8080
   ```

### "npm install fails"

**Problem**: Node version too old or network issues

**Solution**:
```bash
# Update Node.js to v18+
# Download from https://nodejs.org

# Clear npm cache
npm cache clean --force

# Try again
npm run install:all
```

---

## 📱 Development Workflow

### Daily Development

```bash
# Start both servers
npm run dev

# Or start separately
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

### Making Changes

```bash
# Backend changes
cd backend
# Edit files in routes/, src/, etc.
# Server auto-reloads with nodemon

# Frontend changes
cd frontend
# Edit files in src/
# Browser auto-reloads with Vite HMR
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
cd frontend
npm run e2e
```

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
cd frontend
npm run format
```

---

## 🎯 Common Tasks

### Add a New API Endpoint

1. Create route file: `backend/routes/my-feature.js`
2. Define endpoints:
   ```javascript
   const express = require('express');
   const router = express.Router();
   
   router.get('/my-endpoint', (req, res) => {
     res.json({ message: 'Hello!' });
   });
   
   module.exports = router;
   ```
3. Register in `backend/server.js`:
   ```javascript
   const myFeature = require('./routes/my-feature');
   app.use('/api/my-feature', myFeature);
   ```

### Add a New Frontend Page

1. Create component: `frontend/src/pages/MyPage.tsx`
2. Add route in `frontend/src/App.tsx`:
   ```typescript
   import MyPage from './pages/MyPage';
   
   <Route path="/my-page" element={<MyPage />} />
   ```

### Add Environment Variable

1. Add to `backend/env.example` or `frontend/.env.example`
2. Add to your local `.env` file
3. Document in [ENV_SETUP.md](ENV_SETUP.md)
4. Use in code:
   ```javascript
   // Backend
   const myVar = process.env.MY_VAR;
   
   // Frontend
   const myVar = import.meta.env.VITE_MY_VAR;
   ```

---

## 📚 Additional Resources

### Documentation
- [API Reference](API_REFERENCE.md) - Complete API docs
- [Backend README](backend/README.md) - Backend guide
- [Frontend README](frontend/README.md) - Frontend guide
- [Environment Setup](ENV_SETUP.md) - Configuration guide
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Testing Guide](TESTING.md) - Testing strategies
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Z.ai Documentation](https://z.ai/docs)
- [Stripe API Docs](https://stripe.com/docs/api)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)

### Community
- **GitHub Issues**: https://github.com/Moeabdelaziz007/amrikyy-agent/issues
- **Discussions**: https://github.com/Moeabdelaziz007/amrikyy-agent/discussions
- **Email**: support@amrikyy.ai

---

## 🎉 You're All Set!

You now have a fully functional AI-powered travel platform running locally!

**What to do next**:
1. ✅ Explore the app
2. ✅ Read the documentation
3. ✅ Start building features
4. ✅ Deploy to production

**Need help?** Open an issue on GitHub or email support@amrikyy.ai

---

**Happy Coding!** 🚀

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0
