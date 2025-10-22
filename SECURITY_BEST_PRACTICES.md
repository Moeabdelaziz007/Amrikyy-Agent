# 🔒 Security Best Practices - Amrikyy Project

Complete guide to keeping your secrets safe and your application secure.

---

## 🎯 Overview

This guide covers:
- ✅ Secret management
- ✅ Environment variables
- ✅ Git security
- ✅ API key protection
- ✅ Database security
- ✅ Error handling
- ✅ Monitoring

---

## 🔑 Secret Management

### **What Are Secrets?**

Secrets are sensitive data that should NEVER be exposed:
- API keys (Gemini, Stripe, PayPal)
- Database passwords
- JWT secrets
- Encryption keys
- OAuth tokens
- Webhook secrets
- Private keys

### **Golden Rules**

1. ❌ **NEVER** commit secrets to Git
2. ❌ **NEVER** hardcode secrets in code
3. ❌ **NEVER** share secrets in chat/email
4. ❌ **NEVER** log secrets to console
5. ✅ **ALWAYS** use environment variables
6. ✅ **ALWAYS** use `.gitignore` for `.env` files
7. ✅ **ALWAYS** rotate secrets regularly
8. ✅ **ALWAYS** use different secrets for dev/prod

---

## 📁 Environment Variables

### **Backend `.env` Structure**

```bash
# ============================================
# AMRIKYY TRAVEL AGENT - ENVIRONMENT VARIABLES
# ============================================

# Security (REQUIRED)
JWT_SECRET="generate-with-openssl-rand-hex-32"
ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"

# Gemini AI (REQUIRED)
GEMINI_API_KEY="AIzaSy-your-actual-key"
GOOGLE_AI_API_KEY="AIzaSy-your-actual-key"

# Supabase (REQUIRED)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-secret"

# PayPal (REQUIRED for payments)
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"

# Monitoring (RECOMMENDED)
SENTRY_DSN="https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxx"
METRICS_API_KEY="generate-with-openssl-rand-hex-32"

# Server Configuration
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### **Frontend `.env` Structure**

```bash
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000

# Supabase (Optional - if using direct client)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Public keys only!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# Feature Flags
VITE_USE_BACKEND_AUTH=true
```

### **Generate Secure Secrets**

```bash
# JWT Secret (32 bytes)
openssl rand -hex 32

# Encryption Key (32 bytes)
openssl rand -hex 32

# Metrics API Key (32 bytes)
openssl rand -hex 32

# Example output:
# 107a04f6ecbea6fe133e40f5160e776e00f88284e0dd6edb1f637beac11b336e
```

---

## 🚫 Git Security

### **`.gitignore` Configuration**

```gitignore
# Environment Variables
.env
.env.*
!.env.example
!.env.template
*.env
*.env.local
*.env.production
*.env.staging
*.env.development
*.env.test

# API Keys
**/api-keys.json
**/secrets.json
**/credentials.json

# Certificates
*.pem
*.key
*.cert
*.crt

# Database
*.db
*.sqlite
*.sqlite3

# Logs (may contain sensitive data)
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/settings.json
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

### **Git Hooks (Pre-Commit)**

Already configured in `.githooks/pre-commit`:

```bash
# Automatically checks for:
- .env files
- API keys (Gemini, Stripe, PayPal)
- Tokens (JWT, Telegram, GitHub)
- Passwords
- Database URLs
- Credit cards
- Hardcoded secrets

# Blocks commit if secrets found! 🛡️
```

**Enable hooks:**
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

### **If You Accidentally Committed Secrets**

**⚠️ IMMEDIATE ACTIONS:**

1. **Rotate ALL exposed secrets immediately**
   ```bash
   # Generate new secrets
   openssl rand -hex 32
   
   # Update in:
   - Backend .env
   - Supabase dashboard
   - Stripe dashboard
   - PayPal dashboard
   - Sentry settings
   ```

2. **Remove from Git history**
   ```bash
   # Remove file from all commits
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (⚠️ WARNING: Rewrites history)
   git push origin --force --all
   git push origin --force --tags
   ```

3. **Notify team**
   - Inform all team members
   - Update their local .env files
   - Pull latest changes

4. **Monitor for abuse**
   - Check API usage dashboards
   - Review database logs
   - Monitor Sentry for errors

---

## 🔐 API Key Protection

### **Backend: Never Expose Keys**

```javascript
// ❌ BAD - Exposes key in error
app.post('/api/ai/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API key:', apiKey); // ❌ NEVER LOG KEYS!
  
  try {
    const response = await fetch('https://api.gemini.com', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
  } catch (error) {
    res.json({ error: error.message }); // ❌ May expose key in error
  }
});

// ✅ GOOD - Keys never exposed
app.post('/api/ai/chat', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(req.body.message);
    
    res.json({ 
      success: true, 
      response: result.response.text() 
    });
  } catch (error) {
    console.error('AI Error:', error.message); // ✅ Log message only
    res.status(500).json({ 
      error: 'AI service unavailable' // ✅ Generic error
    });
  }
});
```

### **Frontend: Only Public Keys**

```typescript
// ✅ GOOD - Public key (safe to expose)
const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ❌ BAD - Secret key (NEVER in frontend!)
const stripe = loadStripe('sk_test_xxxxx'); // ❌ NEVER DO THIS!
```

### **Validate Environment Variables**

```javascript
// backend/src/config/validateEnv.js
function validateEnv() {
  const required = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'GEMINI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables present');
}

// Call on startup
validateEnv();
```

---

## 🗄️ Database Security

### **Supabase Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can only view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create bookings for themselves
CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### **Use Service Role Key Carefully**

```javascript
// ❌ BAD - Service role key in frontend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ❌ Bypasses RLS!
);

// ✅ GOOD - Anon key in frontend (respects RLS)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY // ✅ Safe
);

// ✅ GOOD - Service role key in backend only
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ OK in backend
);
```

### **Parameterized Queries**

```javascript
// ❌ BAD - SQL injection vulnerability
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = '${userId}'`; // ❌ DANGEROUS!

// ✅ GOOD - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId); // ✅ Safe
```

---

## 🛡️ Error Handling

### **Never Expose Sensitive Data in Errors**

```javascript
// ❌ BAD - Exposes internal details
app.post('/api/payment', async (req, res) => {
  try {
    const payment = await stripe.charges.create({
      amount: req.body.amount,
      source: req.body.token,
      api_key: process.env.STRIPE_SECRET_KEY
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ 
      error: error.message, // ❌ May expose API keys!
      stack: error.stack     // ❌ Exposes code structure!
    });
  }
});

// ✅ GOOD - Generic errors, log details
app.post('/api/payment', async (req, res) => {
  try {
    const payment = await stripe.charges.create({
      amount: req.body.amount,
      source: req.body.token,
    });
    res.json({ 
      success: true, 
      paymentId: payment.id 
    });
  } catch (error) {
    // Log full error server-side
    console.error('Payment Error:', {
      message: error.message,
      code: error.code,
      userId: req.user?.id
    });
    
    // Send generic error to client
    res.status(500).json({ 
      error: 'Payment processing failed',
      code: 'PAYMENT_ERROR'
    });
  }
});
```

### **Sentry Integration (Scrubs Secrets)**

Already configured in `backend/config/sentry.init.js`:

```javascript
// Automatically scrubs:
- API keys (Gemini, Stripe, PayPal)
- Tokens (JWT, Telegram, GitHub)
- Passwords
- Database URLs
- Credit cards
- Email addresses (partial)

// Before sending to Sentry
```

---

## 📊 Monitoring & Logging

### **What to Log**

```javascript
// ✅ GOOD - Safe logging
console.log('User login:', {
  userId: user.id,
  email: user.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // Partial redaction
  timestamp: new Date().toISOString()
});

console.log('API request:', {
  method: req.method,
  path: req.path,
  userId: req.user?.id,
  duration: Date.now() - startTime
});

console.log('Payment processed:', {
  orderId: order.id,
  amount: order.amount,
  currency: order.currency,
  status: order.status
});
```

### **What NOT to Log**

```javascript
// ❌ BAD - Logs sensitive data
console.log('Request:', req.body); // ❌ May contain passwords!
console.log('Headers:', req.headers); // ❌ May contain tokens!
console.log('API Key:', process.env.GEMINI_API_KEY); // ❌ NEVER!
console.log('User:', user); // ❌ May contain sensitive fields!
console.log('Payment:', payment); // ❌ May contain card numbers!
```

### **Structured Logging**

```javascript
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data: scrubSensitiveData(data),
      timestamp: new Date().toISOString()
    }));
  },
  
  error: (message, error, data = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error.message,
        code: error.code,
        // Don't include stack in production
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      data: scrubSensitiveData(data),
      timestamp: new Date().toISOString()
    }));
  }
};

function scrubSensitiveData(data) {
  const scrubbed = { ...data };
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret'];
  
  for (const key of Object.keys(scrubbed)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      scrubbed[key] = '[REDACTED]';
    }
  }
  
  return scrubbed;
}
```

---

## 🔄 Secret Rotation

### **When to Rotate Secrets**

- ✅ Every 90 days (scheduled)
- ✅ When employee leaves
- ✅ After security incident
- ✅ When secret is exposed
- ✅ Before major deployment

### **How to Rotate Secrets**

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update .env file
echo "JWT_SECRET=$NEW_SECRET" >> backend/.env

# 3. Update production environment
# - Render: Dashboard → Environment → Update
# - Vercel: Dashboard → Settings → Environment Variables

# 4. Restart services
# - Backend: Redeploy
# - Frontend: Rebuild

# 5. Verify everything works
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 6. Delete old secret
# - Remove from password manager
# - Update documentation
```

---

## ✅ Security Checklist

### **Development**
- [ ] `.env` files in `.gitignore`
- [ ] Git hooks enabled
- [ ] No hardcoded secrets
- [ ] Environment variables validated
- [ ] Secrets generated with `openssl`
- [ ] Different secrets for dev/prod

### **Code**
- [ ] No secrets in logs
- [ ] Generic error messages
- [ ] Parameterized queries
- [ ] Input validation
- [ ] Output sanitization
- [ ] CORS configured

### **Database**
- [ ] RLS enabled
- [ ] Policies configured
- [ ] Service role key protected
- [ ] Backups enabled
- [ ] SSL connections

### **Monitoring**
- [ ] Sentry configured
- [ ] Logs scrubbed
- [ ] Alerts set up
- [ ] Metrics tracked
- [ ] Audit logs enabled

### **Deployment**
- [ ] Secrets in environment variables
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Firewall rules set
- [ ] Security headers enabled

---

## 🚨 Incident Response

### **If Secrets Are Exposed**

1. **Immediate (< 5 minutes)**
   - Rotate ALL exposed secrets
   - Revoke compromised API keys
   - Disable affected accounts

2. **Short-term (< 1 hour)**
   - Review access logs
   - Check for unauthorized access
   - Notify affected users
   - Update team

3. **Long-term (< 24 hours)**
   - Investigate root cause
   - Implement preventive measures
   - Update documentation
   - Post-mortem meeting

### **Emergency Contacts**

```
Security Team: security@amrikyy.com
On-call: +1-XXX-XXX-XXXX
Slack: #security-incidents
```

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security](https://stripe.com/docs/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Sentry Security](https://docs.sentry.io/security-legal-pii/)

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

🔒 Security is not optional - it's essential! 🔒
