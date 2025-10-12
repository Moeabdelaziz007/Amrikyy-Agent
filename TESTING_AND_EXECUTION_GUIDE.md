# 🧪 Testing & Execution Guide

**Quick reference for testing current system and starting next phases**

---

## ⚡ **Quick Start Testing**

### **Option A: Automated Testing (Recommended)**

```bash
# 1. Navigate to project
cd /Users/Shared/maya-travel-agent

# 2. Make test script executable
chmod +x test-paymentskit.js

# 3. Start server (if not running)
npm run dev

# 4. In another terminal, run tests
node test-paymentskit.js
```

**Expected Output:**

```
╔════════════════════════════════════════════╗
║     PaymentsKit Test Suite (Phase 1-3)    ║
╚════════════════════════════════════════════╝

Testing against: http://localhost:3000

ℹ [timestamp] 📋 Test 1: Health Check
✓ [timestamp] Health Check: PASSED

ℹ [timestamp] 🔐 Test 2: KYC Service
✓ [timestamp] KYC Start: PASSED - Level: basic
✓ [timestamp] KYC Status: PASSED - Endpoint working

ℹ [timestamp] ⚖️ Test 3: Risk Engine
✓ [timestamp] Risk Engine - Low Risk Transaction: Score: 25, Level: low
✓ [timestamp] Risk Engine - High Risk Transaction: Score: 75, Level: high

ℹ [timestamp] 📊 Test 4: Transaction Monitoring
✓ [timestamp] Monitoring - Get Alerts: PASSED - 5 alerts retrieved
✓ [timestamp] Monitoring - Statistics: PASSED - Stats retrieved

ℹ [timestamp] 💎 Test 5: Crypto Payment Flow (End-to-End)
✓ [timestamp] E2E Payment Flow: PASSED
✓ [timestamp] Phase 2 Integration: PASSED - Risk assessment ran
✓ [timestamp] Phase 3 Integration: PASSED - Transaction monitoring ran

╔════════════════════════════════════════════╗
║              Test Summary                  ║
╚════════════════════════════════════════════╝

✓ Passed: 12
✗ Failed: 0
  Total: 12

🎉 All tests passed!
```

---

### **Option B: Manual API Testing**

```bash
# Test 1: Health Check
curl http://localhost:3000/api/health

# Test 2: KYC Start
curl -X POST http://localhost:3000/api/kyc/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "fullName": "Test User",
    "level": "basic"
  }'

# Test 3: Create Crypto Invoice (Full E2E)
curl -X POST http://localhost:3000/api/crypto/invoice/create \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-test-001",
    "userId": "user-test-001",
    "amountUSD": 1000,
    "cryptocurrency": "USDT",
    "ipCountry": "US",
    "cryptoAddress": "0x1234567890123456789012345678901234567890"
  }'

# Test 4: Get Monitoring Alerts
curl http://localhost:3000/api/monitoring/alerts?limit=10

# Test 5: Get Monitoring Stats
curl http://localhost:3000/api/monitoring/stats
```

---

## 🗄️ **Database Setup**

### **Run Migrations**

```bash
# Set your database URL
export DATABASE_URL="postgresql://user:password@localhost:5432/amrikyy"

# Run all migrations
psql $DATABASE_URL -f backend/database/migrations/001_crypto_payments.sql
psql $DATABASE_URL -f backend/database/migrations/002_kyc_tables.sql
psql $DATABASE_URL -f backend/database/migrations/003_risk_tables.sql
psql $DATABASE_URL -f backend/database/migrations/004_monitoring_tables.sql

# Verify tables exist
psql $DATABASE_URL -c "\dt"
```

**Expected Tables:**

- `crypto_payments`
- `kyc_verifications`
- `risk_assessments`
- `transaction_monitoring`
- `transaction_alerts`
- `sanctions_list`

---

## 🐛 **Troubleshooting**

### **Issue: Server not starting**

```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill existing process
kill -9 $(lsof -ti:3000)

# Start server again
npm run dev
```

### **Issue: Database connection failed**

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### **Issue: Environment variables missing**

```bash
# Create .env file if it doesn't exist
cat > .env << EOF
DATABASE_URL=postgresql://localhost:5432/amrikyy
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_key
SUMSUB_API_BASE=https://api.sumsub.com
SUMSUB_APP_TOKEN=your_token
SUMSUB_WEBHOOK_SECRET=your_secret
CHAINALYSIS_API_KEY=your_key
SLACK_WEBHOOK_URL=your_webhook
EOF

# Load environment variables
source .env
```

### **Issue: Test failures**

```bash
# Check logs
tail -f logs/server.log

# Run specific test
node test-paymentskit.js --test=kyc

# Verbose mode
DEBUG=* node test-paymentskit.js
```

---

## 🚀 **Starting Next Phases**

### **Phase 4: Audit Logs (Week 1)**

```bash
# 1. Create migration file
cat > backend/database/migrations/005_audit_logs.sql << 'EOF'
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  transaction_id VARCHAR(50),
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON payment_audit_log(user_id);
CREATE INDEX idx_audit_transaction ON payment_audit_log(transaction_id);
CREATE INDEX idx_audit_created ON payment_audit_log(created_at DESC);
EOF

# 2. Run migration
psql $DATABASE_URL -f backend/database/migrations/005_audit_logs.sql

# 3. Create audit service (see BEST_TOOLS_IMPLEMENTATION_PLAN.md)

# 4. Test audit logging
curl -X POST http://localhost:3000/api/audit/log \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "payment_created",
    "userId": "user-123",
    "transactionId": "tx-456",
    "action": "create_invoice",
    "metadata": {"amount": 1000, "currency": "USDT"}
  }'
```

---

### **Phase 5: n8n Deployment (Week 3)**

```bash
# 1. Clone n8n AI Starter Kit
git clone https://github.com/n8n-io/self-hosted-ai-starter-kit
cd self-hosted-ai-starter-kit

# 2. Configure environment
cat > .env << EOF
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$(openssl rand -hex 16)
POSTGRES_USER=n8n
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=n8n
QDRANT_API_KEY=$(openssl rand -hex 16)
EOF

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. Access n8n
open http://localhost:5678

# 6. Pull Ollama model
docker exec -it ollama ollama pull llama3.2

# 7. Test Qdrant
curl http://localhost:6333/collections
```

---

### **Phase 6: Genkit Integration (Week 5)**

```bash
# 1. Install Genkit
npm install genkit @genkit-ai/googleai @genkit-ai/qdrant

# 2. Set API key
export GOOGLE_API_KEY=your_gemini_api_key_here

# 3. Create AI service directory
mkdir -p backend/src/services/ai

# 4. Create travel assistant flow
# (See BEST_TOOLS_IMPLEMENTATION_PLAN.md for code)

# 5. Test Genkit
node -e "
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-2.0-flash',
});

(async () => {
  const result = await ai.generate({
    prompt: 'Tell me about Cairo, Egypt in 50 words'
  });
  console.log(result.text);
})();
"
```

---

## 📊 **Monitoring & Observability**

### **Check System Health**

```bash
# Server health
curl http://localhost:3000/api/health

# Database health
psql $DATABASE_URL -c "SELECT COUNT(*) FROM crypto_payments"

# n8n health
curl http://localhost:5678/healthz

# Qdrant health
curl http://localhost:6333/health
```

### **View Logs**

```bash
# Server logs
tail -f logs/server.log

# Error logs
tail -f logs/error.log

# n8n logs
docker logs -f n8n

# Qdrant logs
docker logs -f qdrant
```

### **Performance Metrics**

```bash
# Database query performance
psql $DATABASE_URL -c "
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"

# API response times (requires Morgan middleware)
cat logs/access.log | tail -100

# System resources
top
htop
docker stats
```

---

## 🔐 **Security Checklist**

Before deploying to production:

- [ ] All environment variables set in `.env`
- [ ] Database has strong password
- [ ] SSL certificates configured
- [ ] Firewall rules in place
- [ ] HTTPS enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Secrets not in git repository
- [ ] Backup system configured
- [ ] Monitoring alerts set up

---

## 📚 **Useful Commands**

```bash
# Start development server
npm run dev

# Run tests
npm test
node test-paymentskit.js

# Database operations
psql $DATABASE_URL                          # Connect to DB
psql $DATABASE_URL -f migration.sql         # Run migration
psql $DATABASE_URL -c "SELECT * FROM ..."  # Run query

# Docker operations
docker-compose up -d                        # Start services
docker-compose down                         # Stop services
docker-compose logs -f service_name         # View logs
docker-compose ps                           # List services

# Git operations
git status                                  # Check status
git add .                                   # Stage changes
git commit -m "message"                     # Commit
git push                                    # Push to remote

# Process management
pm2 start server.js                         # Start with PM2
pm2 logs                                    # View logs
pm2 restart all                             # Restart services
pm2 stop all                                # Stop services
```

---

## 🎯 **Next Steps**

1. **Test Current System:** Run `node test-paymentskit.js`
2. **Review Results:** Check test output
3. **Fix Issues:** Address any failing tests
4. **Choose Path:** Decide on Phase 4, 5, or 6
5. **Execute:** Follow step-by-step guide above

---

**Need Help?**

- Review: `BEST_TOOLS_IMPLEMENTATION_PLAN.md`
- Check: `QUICK_START.md`
- Reference: `PAYMENTS_KIT_IMPLEMENTATION.md`

**Ready to deploy?** Follow the production checklist in the main plan! 🚀
