# 📊 Monitoring & CI/CD Setup Guide

Complete guide for setting up monitoring, error tracking, and automated deployments for the Amrikyy Travel Platform.

---

## 🎯 Overview

This guide covers:
1. **Error Tracking** with Sentry
2. **Health Monitoring** endpoints
3. **CI/CD Pipeline** with GitHub Actions
4. **Automated Deployments** to Railway & Vercel
5. **Metrics & Analytics**

---

## 🚨 1. SENTRY ERROR TRACKING

### Setup Steps

#### Step 1: Create Sentry Account
1. Go to https://sentry.io
2. Sign up for free account
3. Create new organization or use existing

#### Step 2: Create Project
1. Click "Create Project"
2. Select platform: **Node.js**
3. Set alert frequency
4. Name your project: **amrikyy-backend**
5. Copy the DSN (Data Source Name)

#### Step 3: Configure Environment Variables

Add to `.env` file:
```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/7890123
NODE_ENV=production
```

#### Step 4: Integration (Already Done!)
The following files have been created:
- ✅ `backend/config/monitoring.js` - Sentry initialization
- ✅ `backend/config/sentry.config.js` - Sentry configuration
- ✅ Package.json updated with Sentry dependencies

#### Step 5: Add to Server

In `backend/server.js`, add:
```javascript
const { 
  initializeSentry, 
  sentryRequestHandler, 
  sentryTracingHandler,
  sentryErrorHandler,
  metricsMiddleware,
  performanceMonitoring
} = require('./config/monitoring');

// Initialize Sentry FIRST
initializeSentry(app);

// Sentry request handler (BEFORE other middleware)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Metrics collection
app.use(metricsMiddleware);
app.use(performanceMonitoring);

// ... your routes ...

// Sentry error handler (BEFORE other error handlers)
app.use(sentryErrorHandler());
```

### Features Included

✅ **Automatic Error Capture**
- Uncaught exceptions
- Unhandled promise rejections
- HTTP errors
- Database errors
- Payment errors

✅ **Performance Monitoring**
- Request tracing
- Slow request detection (>1s)
- Response time tracking
- Memory usage monitoring

✅ **Smart Filtering**
- Ignores development errors
- Filters health check spam
- Removes duplicate errors
- Excludes known issues

✅ **Rich Context**
- User information
- Request details
- Environment data
- Breadcrumbs trail

---

## 🏥 2. HEALTH CHECK ENDPOINTS

### Endpoints Created

#### **GET /health** - Basic Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "uptime": 12345,
  "environment": "production",
  "version": "2.0.0"
}
```

#### **GET /health/detailed** - Detailed Health
```bash
curl http://localhost:3000/health/detailed
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "uptime": 12345,
  "checks": {
    "database": { "status": "healthy", "latency": 45 },
    "redis": { "status": "healthy", "type": "redis" },
    "email": { "status": "healthy", "configured": true },
    "stripe": { "status": "healthy", "configured": true }
  }
}
```

#### **GET /health/metrics** - Application Metrics
```bash
curl -H "x-api-key: your-api-key" http://localhost:3000/health/metrics
```

Response:
```json
{
  "timestamp": "2025-10-22T...",
  "requests": {
    "total": 1234,
    "active": 5,
    "errors": 12,
    "errorRate": "0.97%"
  },
  "performance": {
    "avgResponseTime": "145ms",
    "p95ResponseTime": "320ms"
  },
  "uptime": 86400,
  "memory": {
    "used": "128MB",
    "total": "256MB"
  }
}
```

#### **GET /health/ready** - Readiness Probe
For Kubernetes/Railway deployment
```bash
curl http://localhost:3000/health/ready
```

#### **GET /health/live** - Liveness Probe
For Kubernetes/Railway deployment
```bash
curl http://localhost:3000/health/live
```

### Environment Variables

Add to `.env`:
```bash
# Metrics API Key (for protected endpoints)
METRICS_API_KEY=your-secret-api-key-here
```

### Integration in server.js

```javascript
const healthRouter = require('./routes/health');

// Health check routes (should be public)
app.use('/health', healthRouter);
```

---

## 🤖 3. GITHUB ACTIONS CI/CD

### Workflows Created

#### **ci.yml** - Continuous Integration
Runs on every push and PR:
- ✅ Backend tests (Jest)
- ✅ Frontend build & tests
- ✅ Security scanning (Trivy)
- ✅ Code quality (SonarCloud)
- ✅ Dependency review
- ✅ Type checking
- ✅ Linting

#### **test.yml** - Fast Testing
Runs on all branches:
- ✅ Backend unit tests
- ✅ Frontend type checking
- ✅ Frontend build

#### **deploy.yml** - Automated Deployment
Runs on push to main:
- ✅ Deploy backend to Railway
- ✅ Deploy frontend to Vercel
- ✅ Post-deployment verification
- ✅ Health checks

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### **Railway (Backend)**
```
RAILWAY_TOKEN=your-railway-token-here
```

Get from: https://railway.app/account/tokens

#### **Vercel (Frontend)**
```
VERCEL_TOKEN=your-vercel-token-here
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

Get from:
1. Vercel token: https://vercel.com/account/tokens
2. Org ID & Project ID: Run `vercel link` in frontend directory

#### **Sentry**
```
SENTRY_DSN=https://your-key@sentry.io/project-id
```

#### **SonarCloud (Optional)**
```
SONAR_TOKEN=your-sonar-token
```

Get from: https://sonarcloud.io

#### **Slack Notifications (Optional)**
```
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 📈 4. METRICS & MONITORING

### Built-in Metrics

The monitoring system tracks:

#### **Request Metrics**
- Total requests
- Active requests
- Error count
- Error rate (%)

#### **Performance Metrics**
- Average response time
- P95 response time (95th percentile)
- Slow request alerts (>1s)

#### **System Metrics**
- Uptime
- Memory usage (used/total)
- CPU usage (via process)

#### **Service Health**
- Database connection
- Redis connection
- Email service status
- Stripe service status

### Accessing Metrics

#### **1. Metrics API**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  http://localhost:3000/health/metrics
```

#### **2. Sentry Dashboard**
Visit your Sentry project to see:
- Error frequency
- Error trends
- Performance issues
- User impact

#### **3. Server Logs**
```bash
# View logs
tail -f backend/logs/combined.log

# View errors only
tail -f backend/logs/error.log
```

---

## 🔄 5. CI/CD WORKFLOW

### Automatic Flow

#### **On Pull Request:**
1. ✅ Run all backend tests
2. ✅ Run all frontend tests
3. ✅ Security scan
4. ✅ Code quality check
5. ✅ Type checking
6. ✅ Build verification
7. ✅ Post results to PR

#### **On Merge to Main:**
1. ✅ Run all tests
2. ✅ Build frontend
3. ✅ Deploy backend to Railway
4. ✅ Deploy frontend to Vercel
5. ✅ Verify deployments
6. ✅ Run health checks
7. ✅ Send notifications

#### **On Failure:**
1. ❌ Stop deployment
2. 📧 Send alert
3. 🔄 Rollback if needed

---

## 🛠️ 6. DEPLOYMENT CONFIGURATION

### Railway (Backend)

#### **Environment Variables Needed:**
```bash
# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
METRICS_API_KEY=your-metrics-api-key

# Redis (optional)
REDIS_URL=redis://...

# Frontend URL
FRONTEND_URL=https://amrikyy.vercel.app
```

#### **Procfile** (already exists)
```
web: node server.js
```

### Vercel (Frontend)

#### **Environment Variables Needed:**
```bash
# API URL
VITE_API_URL=https://amrikyy-backend.railway.app

# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Analytics (optional)
VITE_GA_ID=G-XXXXXXXXXX
```

#### **vercel.json** (already exists)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 📊 7. MONITORING DASHBOARD SETUP

### Sentry Dashboard

1. **Issues View**
   - See all errors in real-time
   - Group by error type
   - Track error frequency
   - Monitor user impact

2. **Performance View**
   - Request performance
   - Slow transactions
   - Database queries
   - API call duration

3. **Alerts**
   - Configure email alerts
   - Slack integration
   - PagerDuty integration (enterprise)
   - Set thresholds

### Custom Metrics Dashboard

Access at: `http://localhost:3000/health/metrics`

Create a simple frontend dashboard:
```javascript
// Fetch metrics every 5 seconds
setInterval(async () => {
  const response = await fetch('/health/metrics', {
    headers: { 'x-api-key': 'YOUR_KEY' }
  });
  const metrics = await response.json();
  updateDashboard(metrics);
}, 5000);
```

---

## 🔔 8. ALERTING

### Sentry Alerts

Configure in Sentry Dashboard:

1. **Error Rate Alert**
   - Trigger: Error rate > 5%
   - Action: Send email + Slack

2. **New Error Alert**
   - Trigger: New error type detected
   - Action: Send notification

3. **Performance Alert**
   - Trigger: P95 response time > 1s
   - Action: Send warning

### Health Check Alerts

Use monitoring services:
- **UptimeRobot** (free): https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **Better Uptime**: https://betteruptime.com

Monitor:
- `https://amrikyy-backend.railway.app/health`
- `https://amrikyy.vercel.app`

---

## 🧪 9. TESTING THE SETUP

### Test Sentry Locally

```javascript
// Add to any route for testing
app.get('/debug-sentry', (req, res) => {
  throw new Error('Test Sentry error!');
});
```

Visit: `http://localhost:3000/debug-sentry`
Check Sentry dashboard for the error.

### Test Health Checks

```bash
# Basic health
curl http://localhost:3000/health

# Detailed health
curl http://localhost:3000/health/detailed

# Metrics (with API key)
curl -H "x-api-key: test-key" http://localhost:3000/health/metrics

# Readiness
curl http://localhost:3000/health/ready

# Liveness
curl http://localhost:3000/health/live
```

### Test CI/CD

1. Create a test commit
2. Push to your branch
3. Watch GitHub Actions tab
4. Verify all checks pass

---

## 📋 10. PRODUCTION CHECKLIST

### Before Deploying

- [ ] Set all environment variables in Railway
- [ ] Set all environment variables in Vercel
- [ ] Configure Sentry project
- [ ] Add GitHub secrets for CI/CD
- [ ] Test health endpoints locally
- [ ] Run full test suite
- [ ] Review Sentry configuration

### After Deploying

- [ ] Verify backend health: `/health`
- [ ] Verify frontend loads
- [ ] Test complete booking flow
- [ ] Monitor Sentry for errors
- [ ] Check metrics endpoint
- [ ] Set up uptime monitoring
- [ ] Configure alerts
- [ ] Test email notifications

---

## 🔧 11. TROUBLESHOOTING

### Sentry Not Capturing Errors

**Check:**
1. `SENTRY_DSN` is set correctly
2. `NODE_ENV=production` (errors not sent in dev)
3. Error not in ignore list
4. Sentry initialized before routes

### Health Check Failing

**Check:**
1. Database connection (Supabase URL & key)
2. Redis connection (if configured)
3. Email service (Gmail credentials)
4. Stripe service (API key)

### CI/CD Pipeline Failing

**Check:**
1. GitHub secrets are set
2. Railway token is valid
3. Vercel token is valid
4. Tests pass locally
5. Dependencies are installed

### Metrics Not Updating

**Check:**
1. `metricsMiddleware` is added to server
2. Requests are going through the middleware
3. API key is correct for `/health/metrics`

---

## 📊 12. MONITORING BEST PRACTICES

### 1. Error Tracking
- ✅ Monitor error rates
- ✅ Set up alerts for new errors
- ✅ Review errors daily
- ✅ Fix critical errors immediately

### 2. Performance
- ✅ Monitor P95 response times
- ✅ Track slow requests (>1s)
- ✅ Optimize slow endpoints
- ✅ Set performance budgets

### 3. Availability
- ✅ Set up uptime monitoring
- ✅ Monitor health endpoints
- ✅ Configure redundancy
- ✅ Test failover scenarios

### 4. Security
- ✅ Monitor failed auth attempts
- ✅ Track suspicious activity
- ✅ Review access logs
- ✅ Regular security audits

---

## 🚀 13. QUICK START

### Install Sentry Dependencies
```bash
cd backend
npm install
```

### Add Environment Variables
```bash
# Add to .env
echo "SENTRY_DSN=your-dsn-here" >> .env
echo "METRICS_API_KEY=$(openssl rand -hex 32)" >> .env
```

### Test Locally
```bash
# Start server
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# Test detailed health
curl http://localhost:3000/health/detailed

# Test metrics
curl -H "x-api-key: YOUR_KEY" http://localhost:3000/health/metrics
```

### Deploy
```bash
# Push to trigger CI/CD
git push origin main
```

---

## 📚 14. ADDITIONAL RESOURCES

### Documentation
- **Sentry Docs**: https://docs.sentry.io/platforms/node/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs

### Monitoring Tools
- **Sentry**: Error tracking
- **UptimeRobot**: Uptime monitoring
- **Google Analytics**: User analytics
- **LogRocket**: Session replay (optional)

### Performance Tools
- **Lighthouse**: Frontend performance
- **WebPageTest**: Load testing
- **k6**: API load testing

---

## ✅ WHAT'S BEEN DONE

- ✅ Sentry configuration created
- ✅ Health check endpoints implemented
- ✅ Metrics collection system built
- ✅ GitHub Actions workflows created
- ✅ CI/CD pipeline configured
- ✅ Deployment automation ready
- ✅ Documentation written

---

## 🎯 NEXT STEPS

1. **Add Sentry DSN** to environment variables
2. **Add GitHub Secrets** for deployment
3. **Push to main** to trigger CI/CD
4. **Monitor Sentry** dashboard
5. **Set up uptime monitoring**

---

**Setup Complete!** 🎉

Your monitoring and CI/CD infrastructure is ready to use!
