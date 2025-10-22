# 🔧 Environment Setup Guide

Complete guide to set up all environment variables for Amrikyy Travel Agent.

---

## 📋 Quick Start

```bash
# 1. Copy example file
cp backend/.env.example backend/.env

# 2. Edit with your values
nano backend/.env

# 3. Generate secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For METRICS_API_KEY
```

---

## 🔑 Required Variables

### **1. Security**

```bash
JWT_SECRET="your-jwt-secret"
```
**How to generate:**
```bash
openssl rand -base64 64
```

---

### **2. Gemini AI (Google)**

```bash
GEMINI_API_KEY="AIzaSy..."
GOOGLE_AI_API_KEY="AIzaSy..."  # Same as above
GEMINI_MODEL="gemini-2.0-flash-exp"
GEMINI_PRO_MODEL="gemini-2.5-pro"
```

**How to get:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy and paste

**Student Pack Benefits:**
- ✅ Free access to Gemini 2.5 Pro
- ✅ 2M token context window
- ✅ Higher rate limits

---

### **3. Supabase Database**

```bash
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
```

**How to get:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

**Database Setup:**
Run the SQL migration in Supabase SQL Editor:
```bash
cat backend/migrations/ALL_MIGRATIONS.sql
# Copy and paste into Supabase SQL Editor
```

---

### **4. Stripe Payment**

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**How to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy "Secret key" (starts with `sk_test_`)
3. For webhook secret:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Copy "Signing secret"

**Test Cards:**
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- CVV: Any 3 digits
- Expiry: Any future date

---

### **5. PayPal Payment**

```bash
PAYPAL_CLIENT_ID="AV1dKvz..."
PAYPAL_CLIENT_SECRET="EC6AAV9..."
PAYPAL_MODE="sandbox"
```

**How to get:**
1. Go to [PayPal Developer](https://developer.paypal.com/dashboard/)
2. Go to Apps & Credentials
3. Create app or select existing
4. Copy:
   - Client ID → `PAYPAL_CLIENT_ID`
   - Secret → `PAYPAL_CLIENT_SECRET`

**Test Account:**
- Create sandbox accounts in PayPal Developer
- Use for testing payments

---

### **6. Telegram Bot**

```bash
TELEGRAM_BOT_TOKEN="8311767002:AAE..."
```

**How to get:**
1. Open Telegram
2. Search for [@BotFather](https://t.me/botfather)
3. Send `/newbot`
4. Follow instructions
5. Copy the token

---

## ⚙️ Optional Variables

### **7. Email Service (Gmail)**

```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

**How to get App Password:**
1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not enabled)
3. App passwords → Generate
4. Select "Mail" and "Other"
5. Copy the 16-character password

---

### **8. Monitoring (Sentry)**

```bash
SENTRY_DSN="https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx"
METRICS_API_KEY="107a04f6ecbea6fe..."
```

**How to get:**
1. Go to [Sentry.io](https://sentry.io)
2. Create account (free tier available)
3. Create new Node.js project
4. Copy DSN

**Generate Metrics Key:**
```bash
openssl rand -hex 32
```

---

### **9. Travel APIs**

```bash
KIWI_API_KEY="your-key"
BOOKING_COM_AFFILIATE_ID="your-id"
MAPBOX_API_KEY="your-key"
```

**Optional** - Use `DEMO_KEY` for development

---

## 🚀 Server Configuration

```bash
PORT=5000
NODE_ENV="development"  # or "production"
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

---

## ✅ Verification

Test your configuration:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Test health check
curl http://localhost:5000/api/health

# 3. Test PayPal
curl http://localhost:5000/api/paypal/health

# 4. Test metrics (use your METRICS_API_KEY)
curl -H "x-api-key: YOUR_KEY" http://localhost:5000/health/metrics
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use `.env.example` for reference

2. **Use strong secrets**
   ```bash
   # Generate strong secrets
   openssl rand -base64 64
   ```

3. **Rotate keys regularly**
   - Change JWT_SECRET every 90 days
   - Rotate API keys if compromised

4. **Use environment-specific keys**
   - Test keys for development
   - Production keys for live

5. **Limit key permissions**
   - Use read-only keys when possible
   - Restrict API key scopes

---

## 📚 Related Documentation

- [MONITORING_SETUP.md](./MONITORING_SETUP.md) - Monitoring configuration
- [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md) - GitHub Actions secrets
- [QUICK_START_SECRETS.md](./QUICK_START_SECRETS.md) - Quick setup guide

---

## 🆘 Troubleshooting

### **"Invalid API key" errors**
- Check key format (no extra spaces)
- Verify key is active
- Check API quotas

### **Database connection fails**
- Verify Supabase URL is correct
- Check service_role key (not anon key)
- Ensure database migrations ran

### **Payment errors**
- Use test mode keys for development
- Check webhook URLs are correct
- Verify webhook secrets match

### **Email not sending**
- Enable 2FA on Gmail
- Use App Password (not regular password)
- Check "Less secure apps" setting

---

## 📞 Support

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@amrikyy.com

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0
