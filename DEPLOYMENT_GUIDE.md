# 🚀 Amrikyy Travel Agent - Production Deployment Guide

**Version**: 2.0.0  
**Last Updated**: October 22, 2025  
**Status**: Ready for Production Deployment

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Railway Deployment](#railway-deployment)
3. [Render Deployment](#render-deployment)
4. [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Testing](#post-deployment-testing)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### **1. Code Readiness**
- [x] All services implemented and tested
- [x] Database migrations ready
- [x] Email service configured (Gmail)
- [x] Payment integration complete (Stripe)
- [x] Webhook endpoint secured
- [x] Input validation on all routes
- [x] Error handling standardized
- [x] API documentation complete

### **2. Environment Setup**
- [ ] Production database created (Supabase)
- [ ] Gmail App Password generated
- [ ] Stripe production keys obtained
- [ ] Stripe webhook configured
- [ ] Redis instance ready (optional)
- [ ] Domain name configured (optional)

### **3. Security**
- [x] No secrets in code
- [x] Environment variables documented
- [x] RLS policies enabled
- [x] Rate limiting configured
- [x] CORS properly set
- [x] Input validation active

---

## 🚂 Railway Deployment

### **Step 1: Install Railway CLI**

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Verify installation
railway --version
```

### **Step 2: Login to Railway**

```bash
railway login
```

### **Step 3: Create New Project**

```bash
# Initialize Railway project
railway init

# Link to existing project (if already created)
railway link
```

### **Step 4: Set Environment Variables**

```bash
# Set all required environment variables
railway variables set NODE_ENV=production
railway variables set PORT=5000

# Database (Supabase)
railway variables set SUPABASE_URL=your-supabase-url
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Gmail)
railway variables set GMAIL_USER=your-email@gmail.com
railway variables set GMAIL_APP_PASSWORD=your-16-char-app-password

# Payment (Stripe)
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...

# Security
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -base64 32)

# Frontend URL
railway variables set FRONTEND_URL=https://your-frontend-domain.com
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

### **Step 5: Deploy**

```bash
# Deploy to Railway
railway up

# Or use GitHub integration (recommended)
# 1. Push code to GitHub
# 2. Connect Railway to GitHub repo
# 3. Enable auto-deploy on push
```

### **Step 6: Get Deployment URL**

```bash
# Get your Railway URL
railway domain

# Example output: https://amrikyy-agent-production.up.railway.app
```

### **Step 7: Configure Stripe Webhook**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-railway-url.up.railway.app/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
4. Copy webhook signing secret
5. Update Railway variable:
   ```bash
   railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 🎨 Render Deployment

### **Step 1: Create Account**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### **Step 2: Create New Web Service**

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: amrikyy-agent-backend
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid for production)

### **Step 3: Add Environment Variables**

In Render dashboard, add all environment variables:

```
NODE_ENV=production
PORT=5000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### **Step 4: Deploy**

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Get your URL: `https://amrikyy-agent-backend.onrender.com`

### **Step 5: Configure Stripe Webhook**

Same as Railway Step 7, but use your Render URL.

---

## ⚡ Vercel Deployment (Frontend)

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login**

```bash
vercel login
```

### **Step 3: Deploy Frontend**

```bash
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? amrikyy-agent-frontend
# - Directory? ./
# - Override settings? No
```

### **Step 4: Set Environment Variables**

```bash
# Set backend API URL
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.up.railway.app/api

# Set Stripe publishable key
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_...
```

### **Step 5: Deploy to Production**

```bash
vercel --prod
```

### **Step 6: Get Frontend URL**

```bash
# Example: https://amrikyy-agent-frontend.vercel.app
```

### **Step 7: Update Backend CORS**

Update Railway/Render environment variables:

```bash
railway variables set FRONTEND_URL=https://amrikyy-agent-frontend.vercel.app
railway variables set CORS_ORIGIN=https://amrikyy-agent-frontend.vercel.app
```

---

## 🔑 Environment Variables Reference

### **Required Variables**

```bash
# Server
NODE_ENV=production
PORT=5000

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Gmail)
GMAIL_USER=noreply@yourdomain.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_ABC123...

# Security
JWT_SECRET=your-32-char-random-string
ENCRYPTION_KEY=your-32-char-random-string

# Frontend
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### **Optional Variables**

```bash
# Redis (for caching)
REDIS_URL=redis://default:password@host:port

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🧪 Post-Deployment Testing

### **1. Health Check**

```bash
curl https://your-backend-url.up.railway.app/api/health
```

**Expected Response**:
```json
{
  "status": "UP",
  "timestamp": "2025-10-22T10:30:00.000Z",
  "service": "Amrikyy Travel Agent MVP",
  "version": "1.0.0"
}
```

### **2. Test Authentication**

```bash
# Signup
curl -X POST https://your-backend-url.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "fullName": "Test User"
  }'

# Login
curl -X POST https://your-backend-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

### **3. Test Booking Creation**

```bash
curl -X POST https://your-backend-url.up.railway.app/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "flightDetails": {
      "origin": "Cairo (CAI)",
      "destination": "Dubai (DXB)",
      "departureDate": "2025-11-15",
      "returnDate": "2025-11-22",
      "passengers": 2,
      "class": "Economy"
    },
    "travelerInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "+1234567890"
    },
    "totalPrice": 850.00,
    "currency": "usd"
  }'
```

### **4. Test Stripe Webhook**

```bash
# Use Stripe CLI
stripe listen --forward-to https://your-backend-url.up.railway.app/api/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

### **5. Test Email Delivery**

1. Create a test booking
2. Complete payment with Stripe test card: `4242 4242 4242 4242`
3. Check email inbox for:
   - Booking confirmation
   - Payment receipt

---

## 📊 Monitoring & Maintenance

### **1. Railway Monitoring**

```bash
# View logs
railway logs

# View metrics
railway status

# View environment variables
railway variables
```

### **2. Render Monitoring**

1. Go to Render Dashboard
2. Click on your service
3. View:
   - Logs
   - Metrics (CPU, Memory, Requests)
   - Events

### **3. Supabase Monitoring**

1. Go to Supabase Dashboard
2. Check:
   - Database size
   - API requests
   - Auth users
   - Storage usage

### **4. Stripe Monitoring**

1. Go to Stripe Dashboard
2. Monitor:
   - Payments
   - Webhooks (success/failure rate)
   - Disputes
   - Balance

### **5. Set Up Alerts**

**Railway**:
- Enable email notifications for deployments
- Set up health check monitoring

**Render**:
- Configure health check endpoint: `/api/health`
- Set up email alerts for failures

**Uptime Monitoring** (Optional):
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Monitor: `https://your-backend-url.up.railway.app/api/health`
- Alert via email/SMS on downtime

---

## 🐛 Troubleshooting

### **Deployment Fails**

**Issue**: Build fails on Railway/Render

**Solutions**:
1. Check build logs: `railway logs` or Render dashboard
2. Verify `package.json` has correct scripts
3. Ensure all dependencies are in `dependencies`, not `devDependencies`
4. Check Node version compatibility

```bash
# Add to package.json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### **Environment Variables Not Working**

**Issue**: App can't connect to database/services

**Solutions**:
1. Verify all variables are set: `railway variables` or Render dashboard
2. Check for typos in variable names
3. Ensure no trailing spaces in values
4. Restart service after adding variables

### **Stripe Webhook Not Working**

**Issue**: Bookings not confirming after payment

**Solutions**:
1. Check webhook URL is correct in Stripe Dashboard
2. Verify webhook secret matches: `railway variables get STRIPE_WEBHOOK_SECRET`
3. Check webhook logs in Stripe Dashboard
4. Test locally with Stripe CLI first
5. Ensure endpoint returns 200 OK

### **Emails Not Sending**

**Issue**: No confirmation emails received

**Solutions**:
1. Verify Gmail credentials: `railway variables get GMAIL_USER`
2. Check App Password is correct (16 chars, no spaces)
3. Test email service: Run `node backend/test-email.js` locally
4. Check logs for email errors: `railway logs | grep email`
5. Verify Gmail account isn't suspended

### **CORS Errors**

**Issue**: Frontend can't connect to backend

**Solutions**:
1. Update `CORS_ORIGIN` to match frontend URL
2. Ensure `FRONTEND_URL` is set correctly
3. Check browser console for exact error
4. Verify backend is returning CORS headers

### **Database Connection Issues**

**Issue**: Can't connect to Supabase

**Solutions**:
1. Verify Supabase URL and key
2. Check Supabase project is active
3. Ensure RLS policies allow access
4. Test connection locally first
5. Check Supabase logs in dashboard

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Stripe webhook configured and tested
- [ ] Email service tested
- [ ] Health check endpoint working
- [ ] CORS configured for frontend
- [ ] SSL/HTTPS enabled (automatic on Railway/Render)
- [ ] Domain name configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Error tracking configured (Sentry optional)
- [ ] Rate limiting tested
- [ ] Load testing performed (optional)

---

## 📈 Scaling Considerations

### **When to Scale**

- Response time > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Request queue building up

### **How to Scale**

**Railway**:
```bash
# Upgrade plan for more resources
# Go to Railway Dashboard → Settings → Plan
```

**Render**:
- Upgrade to paid plan for auto-scaling
- Configure horizontal scaling

**Database**:
- Upgrade Supabase plan
- Add read replicas
- Implement connection pooling

**Caching**:
- Add Redis for production
- Increase cache TTLs
- Implement CDN for static assets

---

## 🔐 Security Best Practices

1. **Rotate Secrets Regularly**
   - JWT secret every 90 days
   - API keys every 6 months
   - Database passwords annually

2. **Monitor for Suspicious Activity**
   - Failed login attempts
   - Unusual payment patterns
   - High request rates from single IP

3. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Enable 2FA**
   - Railway account
   - Render account
   - Supabase account
   - Stripe account

5. **Backup Database**
   - Supabase automatic backups enabled
   - Export critical data weekly
   - Test restore procedure

---

## 📞 Support & Resources

**Railway**:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**Render**:
- Docs: https://render.com/docs
- Support: support@render.com
- Status: https://status.render.com

**Stripe**:
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com
- Status: https://status.stripe.com

**Supabase**:
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

---

## 🎉 Deployment Complete!

Your Amrikyy Travel Agent backend is now live in production!

**Next Steps**:
1. Test all endpoints
2. Monitor logs for errors
3. Set up alerts
4. Deploy frontend
5. Announce to users!

---

**Last Updated**: October 22, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅
