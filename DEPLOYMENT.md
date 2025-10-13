# Deployment Guide

Complete guide for deploying the Amrikyy AI Automation Platform to production.

## 📋 Table of Contents

- [Quick Deploy (5 Minutes)](#quick-deploy-5-minutes)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Railway (Recommended)](#railway-recommended)
  - [Vercel](#vercel)
  - [Docker](#docker)
  - [Manual Deployment](#manual-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

---

## 🚀 Quick Deploy (5 Minutes)

The fastest way to get Amrikyy running in production:

### Option 1: Railway + Vercel (Recommended)

```bash
# 1. Deploy backend to Railway
cd backend
railway login
railway up

# 2. Deploy frontend to Vercel
cd ../frontend
vercel --prod

# 3. Configure environment variables in dashboards
# Railway: https://railway.app/dashboard
# Vercel: https://vercel.com/dashboard

# Done! Your app is live 🎉
```

### Option 2: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

---

## 📋 Prerequisites

### Required Accounts

Create free accounts for these services:

1. **Supabase** (https://supabase.com) - Database
2. **Railway** (https://railway.app) - Backend hosting
3. **Vercel** (https://vercel.com) - Frontend hosting
4. **Z.ai** (https://z.ai) - AI services
5. **Stripe** (https://stripe.com) - Payments
6. **GitHub** (https://github.com) - Source control

### Required Tools

```bash
# Node.js 18+
node --version  # v18.0.0 or higher

# Git
git --version

# Railway CLI (optional)
npm install -g @railway/cli

# Vercel CLI (optional)
npm install -g vercel
```

### API Keys Needed

Before deploying, obtain these API keys:

- ✅ Supabase URL and keys
- ✅ Z.ai API key
- ✅ Stripe secret key
- ✅ JWT secret (generate random string)

See [ENV_SETUP.md](ENV_SETUP.md) for detailed instructions.

---

## 🎯 Deployment Options

### Railway (Recommended)

**Best for**: Backend API, databases, background jobs

**Pros**:
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Built-in monitoring
- ✅ Free tier available
- ✅ PostgreSQL support

**Steps**:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   # In Railway dashboard, add all variables from ENV_SETUP.md
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get URL**
   ```bash
   railway domain
   # Your backend is now live at: https://your-app.railway.app
   ```

**Configuration**:

Create `railway.toml` in backend directory:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[healthcheck]]
path = "/api/health"
interval = 30
timeout = 10
```

---

### Vercel

**Best for**: Frontend, static sites, serverless functions

**Pros**:
- ✅ Lightning-fast CDN
- ✅ Automatic deployments
- ✅ Preview deployments
- ✅ Free tier generous
- ✅ Great DX

**Steps**:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment**
   ```bash
   # In Vercel dashboard:
   # Settings → Environment Variables
   # Add all VITE_* variables
   ```

5. **Done!**
   ```
   Your frontend is live at: https://your-app.vercel.app
   ```

**Configuration**:

Create `vercel.json` in frontend directory:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### Docker

**Best for**: Self-hosting, Kubernetes, custom infrastructure

**Backend Dockerfile**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
```

**Frontend Dockerfile**:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
    env_file:
      - ./backend/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

**Deploy**:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Manual Deployment

**Best for**: VPS, dedicated servers, custom setups

**Requirements**:
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx
- PM2 process manager

**Steps**:

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/Moeabdelaziz007/amrikyy-agent.git
   cd amrikyy-agent
   ```

3. **Install Dependencies**
   ```bash
   npm run install:all
   ```

4. **Configure Environment**
   ```bash
   cd backend
   cp env.example .env
   nano .env  # Edit with production values

   cd ../frontend
   cp .env.example .env
   nano .env  # Edit with production values
   ```

5. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

6. **Start Backend with PM2**
   ```bash
   cd backend
   pm2 start server.js --name amrikyy-backend
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/amrikyy
   ```

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Frontend
       location / {
           root /var/www/amrikyy-agent/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/amrikyy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

9. **Done!**
   ```
   Your app is live at: https://yourdomain.com
   ```

---

## 🗄️ Database Setup

### Supabase Setup

1. **Create Project**
   - Go to https://supabase.com/dashboard
   - Click "New project"
   - Fill in details
   - Wait for provisioning (~2 minutes)

2. **Run Migrations**
   - Go to SQL Editor
   - Copy contents of `backend/database/production-schema-complete.sql`
   - Paste and execute

3. **Get Connection Details**
   - Go to Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key

4. **Configure Environment**
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

See [backend/database/SCHEMA_MIGRATION_GUIDE.md](backend/database/SCHEMA_MIGRATION_GUIDE.md) for detailed instructions.

---

## 🔐 Environment Configuration

### Production Environment Variables

**Backend** (`backend/.env`):

```bash
# Environment
NODE_ENV=production
PORT=5001

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
ZAI_API_KEY=your_zai_api_key
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
JWT_SECRET=your_super_secret_jwt_key_min_64_chars
ENCRYPTION_KEY=your_32_character_encryption_key

# CORS
CORS_ORIGIN=https://yourdomain.com

# Optional
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
REDIS_URL=redis://your-redis-url
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

**Frontend** (`frontend/.env`):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-url.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Security Notes**:
- ⚠️ Never commit `.env` files
- ⚠️ Use different keys for dev/prod
- ⚠️ Rotate keys regularly
- ⚠️ Use secrets management in production

See [ENV_SETUP.md](ENV_SETUP.md) for complete configuration guide.

---

## ✅ Post-Deployment

### 1. Verify Deployment

```bash
# Check backend health
curl https://your-backend-url.com/api/health

# Expected response:
# {"status":"healthy","service":"amrikyy-backend","timestamp":"..."}

# Check frontend
curl https://your-frontend-url.com

# Should return HTML
```

### 2. Test Critical Paths

```bash
# Test AI chat
curl -X POST https://your-backend-url.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test"}'

# Test search
curl -X POST https://your-backend-url.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"origin": "CAI", "destination": "DXB", "departureDate": "2025-03-01"}'
```

### 3. Configure Webhooks

**Stripe Webhooks**:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-backend-url.com/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

**Telegram Webhooks** (if using):
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-backend-url.com/api/miniapp/webhook"
```

### 4. Setup Monitoring

**Sentry** (Error Tracking):
1. Create project at https://sentry.io
2. Copy DSN
3. Add to environment variables
4. Verify errors are being captured

**Uptime Monitoring**:
- Use UptimeRobot (https://uptimerobot.com)
- Monitor: `https://your-backend-url.com/api/health`
- Alert on downtime

### 5. Configure DNS

Point your domain to deployment:

**For Vercel**:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**For Railway**:
```
Type: CNAME
Name: api
Value: your-app.railway.app
```

---

## 📊 Monitoring & Maintenance

### Health Checks

**Backend Health Endpoint**:
```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "service": "amrikyy-backend",
  "timestamp": "2025-01-15T10:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

**Detailed Health Check**:
```bash
GET /api/health/detailed
```

### Metrics

**Prometheus Metrics**:
```bash
GET /metrics
```

**Key Metrics to Monitor**:
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Database connections
- Memory usage
- CPU usage

### Logs

**View Logs**:

Railway:
```bash
railway logs
```

PM2:
```bash
pm2 logs amrikyy-backend
```

Docker:
```bash
docker-compose logs -f
```

### Backups

**Database Backups**:

Supabase automatically backs up your database. To create manual backup:

1. Go to Supabase Dashboard
2. Database → Backups
3. Click "Create backup"

**Code Backups**:
- Git repository is your backup
- Tag releases: `git tag v1.0.0`
- Push tags: `git push --tags`

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to database"

**Problem**: Invalid Supabase credentials

**Solution**:
```bash
# Verify credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/
```

#### "AI API rate limit exceeded"

**Problem**: Too many AI requests

**Solution**:
- Implement caching
- Add rate limiting
- Upgrade Z.ai plan

#### "Payment webhook failed"

**Problem**: Invalid webhook secret

**Solution**:
1. Get secret from Stripe dashboard
2. Update `STRIPE_WEBHOOK_SECRET`
3. Restart backend

#### "Frontend shows blank page"

**Problem**: API URL misconfigured

**Solution**:
```bash
# Check frontend .env
echo $VITE_API_URL

# Should match backend URL
# Update and rebuild:
npm run build
```

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm start

# Or set in .env
LOG_LEVEL=debug
```

### Performance Issues

**Slow Response Times**:
1. Check database indexes
2. Enable Redis caching
3. Optimize queries
4. Scale horizontally

**High Memory Usage**:
1. Check for memory leaks
2. Restart services
3. Increase memory limits
4. Optimize code

---

## 🔄 Rollback Procedures

### Quick Rollback

**Railway**:
```bash
# View deployments
railway status

# Rollback to previous
railway rollback
```

**Vercel**:
```bash
# View deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Manual Rollback

```bash
# Checkout previous version
git checkout v1.0.0

# Redeploy
railway up
# or
vercel --prod
```

### Database Rollback

**⚠️ CAUTION**: Database rollbacks are risky!

1. Restore from backup
2. Run down migrations (if available)
3. Test thoroughly before going live

---

## 📋 Deployment Checklist

Before deploying to production:

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] API keys obtained
- [ ] Domain configured
- [ ] SSL certificate ready

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrated
- [ ] Webhooks configured
- [ ] DNS updated

### Post-Deployment
- [ ] Health checks passing
- [ ] Critical paths tested
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Team notified

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Secrets rotated
- [ ] Audit logging enabled

---

## 📚 Additional Resources

- [Quick Start Guide](QUICKSTART.md)
- [API Reference](API_REFERENCE.md)
- [Environment Setup](ENV_SETUP.md)
- [Backend README](backend/README.md)
- [Database Migration Guide](backend/database/SCHEMA_MIGRATION_GUIDE.md)

---

## 🆘 Support

Need help with deployment?

- **Email**: support@amrikyy.ai
- **GitHub Issues**: https://github.com/Moeabdelaziz007/amrikyy-agent/issues
- **Documentation**: https://docs.amrikyy.ai

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0
METRICS_PORT=9090
PROMETHEUS_ENABLED=true
```

**Frontend `.env` file:**

```bash
VITE_API_URL=https://api.amrikyytravel.ai
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TELEGRAM_BOT_USERNAME=@YourBotUsername
```

### 2. GitHub Secrets

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**

- `RAILWAY_TOKEN` - Railway API token
- `RAILWAY_SERVICE_BACKEND_STAGING` - Staging service ID
- `RAILWAY_SERVICE_BACKEND_PROD` - Production service ID
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `STAGING_API_KEY` - API key for staging smoke tests
- `PRODUCTION_API_KEY` - API key for production smoke tests
- `TELEGRAM_WEBHOOK_URL` - For deployment notifications
- `COLLIBRA_API_KEY` - Collibra API key for config management

---

## 🏛️ **Collibra Setup**

### 1. Create Configuration Assets

1. **Login to Collibra**: https://amrikyy.collibra.com

2. **Create Configuration Domain**:
   - Navigate to: Data Assets → Create Domain
   - Name: `Configuration`
   - Type: `Configuration Management`

3. **Create Configuration Assets**:

   **Development Config:**
   ```
   Name: amrikyy_development_config
   Type: Configuration
   Domain: Configuration
   ```

   **Staging Config:**
   ```
   Name: amrikyy_staging_config
   Type: Configuration
   Domain: Configuration
   ```

   **Production Config:**
   ```
   Name: amrikyy_production_config
   Type: Configuration
   Domain: Configuration
   ```

4. **Add Attributes to Each Asset**:

   Format: `section.key` = `value`

   ```
   database.url = postgresql://...
   database.pool_size = 10
   database.ssl = true
   
   ai.provider = zai
   ai.api_url = https://open.bigmodel.cn/api/paas/v4
   ai.model = glm-4-flash
   ai.max_tokens = 2000
   ai.temperature = 0.7
   
   payments.stripe_enabled = true
   payments.webhook_secret = whsec_...
   
   telegram.bot_token = 123456:ABC...
   telegram.webhook_url = https://...
   
   cache.jsonbin_api_key = $2a$10...
   cache.ttl = 3600
   
   monitoring.prometheus_enabled = true
   monitoring.metrics_port = 9090
   
   security.rate_limit_window_ms = 60000
   security.rate_limit_max = 100
   security.cors_origin = https://...
   ```

5. **Set Data Owners & Stewards**:
   - Assign responsible team members
   - Configure approval workflows
   - Enable audit logging

### 2. Test Collibra Integration

```bash
cd backend
node -e "
const { getInstance } = require('./src/config/collibra-config');
const collibra = getInstance();

collibra.getConfig('development').then(config => {
  console.log('✅ Collibra connection successful!');
  console.log(JSON.stringify(config, null, 2));
}).catch(err => {
  console.error('❌ Collibra connection failed:', err.message);
});
"
```

---

## 🌐 **Deployment Options**

### Option 1: Railway (Backend) + Vercel (Frontend) ⭐ **Recommended**

#### Deploy Backend to Railway

```bash
# 1. Login to Railway
railway login

# 2. Link to your project
railway link

# 3. Set environment variables
railway variables set NODE_ENV=production
railway variables set COLLIBRA_API_KEY=your_key
# ... set all other env vars

# 4. Deploy
railway up

# 5. Get the deployment URL
railway domain
```

#### Deploy Frontend to Vercel

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy to production
cd frontend
vercel --prod

# 3. Set environment variables
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production
# ... set all other env vars
```

### Option 2: PM2 on VPS

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Start backend
cd backend
pm2 start ecosystem.config.js --env production

# 3. Serve frontend with nginx
cd frontend
npm run build
sudo cp -r dist/* /var/www/html/

# 4. Setup PM2 startup
pm2 startup
pm2 save
```

---

## 📊 **Monitoring Setup**

### 1. Prometheus Setup

**Install Prometheus:**

```bash
# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Copy config
cp /path/to/amrikyy-travel-agent/prometheus.yml .

# Start Prometheus
./prometheus --config.file=prometheus.yml
```

**Access Prometheus:**
- URL: http://localhost:9090
- Check targets: http://localhost:9090/targets

### 2. Grafana Setup

**Install Grafana:**

```bash
# Ubuntu/Debian
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

**Configure Grafana:**

1. Access Grafana: http://localhost:3000
2. Login: admin/admin
3. Add Prometheus datasource:
   - Configuration → Data Sources → Add data source
   - Select Prometheus
   - URL: http://localhost:9090
   - Save & Test

4. Import Amrikyy Dashboard:
   - Dashboards → Import
   - Upload: `grafana/amrikyy-dashboard.json`
   - Select Prometheus datasource
   - Import

### 3. Alerts Configuration

Create `alerts.yml`:

```yaml
groups:
  - name: amrikyy_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "95th percentile response time > 5s"
          
      - alert: LowCacheHitRate
        expr: cache_hits / (cache_hits + cache_misses) < 0.7
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate below 70%"
```

---

## 🔄 **CI/CD Pipeline**

### GitHub Actions Workflow

The workflow is already configured in `.github/workflows/production-deploy.yml`

**Triggers:**
- Push to `main` branch → Deploy to Production
- Pull Request → Deploy to Staging

**Pipeline Stages:**

1. **Lint** - Code quality checks
2. **Test** - Run test suite
3. **Build** - Build frontend
4. **Deploy Staging** - Deploy to staging environment
5. **Smoke Tests (Staging)** - Validate staging deployment
6. **Deploy Production** - Deploy to production
7. **Smoke Tests (Production)** - Validate production deployment
8. **Load Test** - Performance validation

**Manual Trigger:**

```bash
# Trigger workflow manually
gh workflow run production-deploy.yml
```

---

## ✅ **Testing & Validation**

### 1. Smoke Tests

**Run locally:**

```bash
cd backend
TEST_URL=http://localhost:3001 npm run smoke-test
```

**Run against staging:**

```bash
TEST_URL=https://staging-api.amrikyytravel.ai \
TEST_API_KEY=your_staging_key \
npm run smoke-test
```

**Expected Output:**

```
🚀 Starting Amrikyy Travel Agent Smoke Tests
Target URL: https://api.amrikyytravel.ai
────────────────────────────────────────────────────────────
✓ [2024-01-10T12:00:00.000Z] Health Check: PASSED
✓ [2024-01-10T12:00:01.000Z] Metrics Endpoint: PASSED
✓ [2024-01-10T12:00:05.000Z] Boss Agent Orchestration: PASSED
✓ [2024-01-10T12:00:08.000Z] AI Chat Endpoint: PASSED
✓ [2024-01-10T12:00:10.000Z] Skills System - Empathy Detection: PASSED
✓ [2024-01-10T12:00:15.000Z] Rate Limiting: PASSED
✓ [2024-01-10T12:00:16.000Z] Error Handling - Invalid Input: PASSED
✓ [2024-01-10T12:00:20.000Z] Concurrent Request Handling: PASSED
────────────────────────────────────────────────────────────
✅ Tests Passed: 8/8
❌ Tests Failed: 0/8
📊 Success Rate: 100.00%
🟢 All smoke tests PASSED
```

### 2. Load Testing with k6

```bash
# Install k6
# See: https://k6.io/docs/getting-started/installation/

# Run load test
K6_TARGET_URL=https://api.amrikyytravel.ai \
K6_API_KEY=your_api_key \
k6 run k6/load-test.js

# Custom load test
k6 run --vus 100 --duration 5m k6/load-test.js
```

---

## 🔒 **Security Checklist**

### Pre-Deployment Security Checklist

- [ ] All API keys stored in environment variables
- [ ] Collibra API key securely stored in GitHub Secrets
- [ ] Database connection uses SSL
- [ ] CORS configured for specific domains (not `*`)
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Input validation on all endpoints
- [ ] JWT tokens with proper expiration
- [ ] Stripe webhook signature verification
- [ ] Telegram webhook uses HTTPS
- [ ] Dependencies audited (`npm audit`)
- [ ] Secrets not committed to git
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced on all domains
- [ ] Content Security Policy configured
- [ ] XSS protection enabled

### Post-Deployment Security Checks

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit fix

# SSL/TLS check
curl -I https://api.amrikyytravel.ai

# CORS check
curl -H "Origin: https://malicious-site.com" -I https://api.amrikyytravel.ai
```

---

## 🎯 **Deployment Checklist**

### Before Deploying

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Collibra assets created and populated
- [ ] Database migrations run
- [ ] Backup created
- [ ] Team notified

### During Deployment

- [ ] CI/CD pipeline triggered
- [ ] Monitor deployment logs
- [ ] Watch for errors in real-time
- [ ] Smoke tests pass

### After Deployment

- [ ] Verify health endpoint
- [ ] Check Prometheus metrics
- [ ] Review Grafana dashboards
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify monitoring alerts
- [ ] Update documentation
- [ ] Notify stakeholders

---

## 📞 **Support & Troubleshooting**

### Common Issues

**1. Collibra Connection Failed**

```bash
# Test connection
curl -X GET "https://amrikyy.collibra.com/rest/2.0/version" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check credentials in .env
echo $COLLIBRA_API_KEY
```

**2. Deployment Failed**

```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs
```

**3. Smoke Tests Failed**

```bash
# Run with debug mode
DEBUG=* npm run smoke-test

# Test individual endpoints
curl https://api.amrikyytravel.ai/health
```

---

## 🚀 **Quick Deploy Commands**

```bash
# Full deployment from scratch
npm run deploy:full

# Backend only
npm run deploy:backend

# Frontend only
npm run deploy:frontend

# Run all tests
npm run test:all

# Monitor deployment
npm run deploy:monitor
```

---

**📚 Additional Resources:**

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Collibra Documentation](https://docs.collibra.com/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [k6 Documentation](https://k6.io/docs/)

---

**🎉 Happy Deploying!**

For support, contact: support@amrikyytravel.ai

