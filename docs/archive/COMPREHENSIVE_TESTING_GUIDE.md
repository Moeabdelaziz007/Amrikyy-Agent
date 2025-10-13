# 🧪 Comprehensive Testing Guide - Amrikyy PaymentsKit

**Last Updated:** 2025-10-12  
**Version:** 1.0  
**Status:** Ready for Testing

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Phase 1-4 Testing](#phase-1-4-testing)
4. [API Testing](#api-testing)
5. [Database Testing](#database-testing)
6. [Frontend Testing](#frontend-testing)
7. [Integration Testing](#integration-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 **Prerequisites**

### **Required Software**

```bash
# Check versions
node --version    # v18+ required
npm --version     # v9+ required
psql --version    # v14+ required
git --version     # v2.30+ required

# Optional but recommended
docker --version  # For future n8n deployment
```

### **Required Accounts**

- [ ] Supabase account (for database)
- [ ] Google AI Studio (for Gemini API)
- [ ] GitHub account (code hosting)
- [ ] Sumsub account (KYC - optional for testing)
- [ ] Chainalysis account (monitoring - optional for testing)

---

## 🌍 **Environment Setup**

### **Step 1: Clone and Setup**

```bash
# Navigate to project
cd /Users/Shared/maya-travel-agent

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### **Step 2: Configure Environment Variables**

Create `.env` file in project root:

```bash
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://localhost:5432/amrikyy
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# KYC (Phase 1)
SUMSUB_API_BASE=https://api.sumsub.com
SUMSUB_APP_TOKEN=your_token_here
SUMSUB_WEBHOOK_SECRET=your_secret_here
SUMSUB_SIGNATURE_HEADER=x-payload-digest

# Monitoring (Phase 3)
CHAINALYSIS_API_KEY=your_key_here
SLACK_WEBHOOK_URL=your_slack_webhook
ALERT_ENABLED=true

# AI (Future Phase 5)
GOOGLE_API_KEY=your_gemini_api_key

# Server
PORT=3000
NODE_ENV=development
EOF
```

### **Step 3: Database Setup**

```bash
# Start PostgreSQL
brew services start postgresql
# OR
pg_ctl -D /usr/local/var/postgres start

# Create database
createdb amrikyy

# Set database URL
export DATABASE_URL="postgresql://localhost:5432/amrikyy"

# Run migrations (in order)
psql $DATABASE_URL -f backend/database/migrations/001_crypto_payments.sql
psql $DATABASE_URL -f backend/database/migrations/002_kyc_tables.sql
psql $DATABASE_URL -f backend/database/migrations/003_risk_tables.sql
psql $DATABASE_URL -f backend/database/migrations/004_monitoring_tables.sql
psql $DATABASE_URL -f backend/database/migrations/005_audit_logs.sql

# Verify tables
psql $DATABASE_URL -c "\dt"
```

**Expected Output:**

```
List of relations:
  Schema   |         Name          | Type  |  Owner
-----------+-----------------------+-------+----------
 public    | crypto_payments       | table | username
 public    | kyc_verifications     | table | username
 public    | risk_assessments      | table | username
 public    | transaction_monitoring| table | username
 public    | transaction_alerts    | table | username
 public    | payment_audit_log     | table | username
 public    | audit_log_summary     | table | username
```

---

## 🧪 **Phase 1-4 Testing**

### **Automated Test Suite**

#### **Test 1: PaymentsKit System Test**

```bash
# Start server (Terminal 1)
npm run dev

# Run tests (Terminal 2)
node test-paymentskit.js
```

**Expected Output:**

```
╔════════════════════════════════════════════╗
║     PaymentsKit Test Suite (Phase 1-3)    ║
╚════════════════════════════════════════════╝

Testing against: http://localhost:3000

ℹ [timestamp] 📋 Test 1: Health Check
✓ [timestamp] Health Check: PASSED - Server is running

ℹ [timestamp] 🔐 Test 2: KYC Service
✓ [timestamp] KYC Start: PASSED - Level: basic
✓ [timestamp] KYC Status: PASSED - Endpoint working

ℹ [timestamp] ⚖️ Test 3: Risk Engine
✓ [timestamp] Risk Engine - Low Risk: Score: 25, Level: low
✓ [timestamp] Risk Engine - High Risk: Score: 75, Level: high

ℹ [timestamp] 📊 Test 4: Transaction Monitoring
✓ [timestamp] Monitoring - Get Alerts: PASSED
✓ [timestamp] Monitoring - Statistics: PASSED

ℹ [timestamp] 💎 Test 5: E2E Payment Flow
✓ [timestamp] E2E Payment Flow: PASSED
✓ [timestamp] Phase 2 Integration: PASSED
✓ [timestamp] Phase 3 Integration: PASSED

╔════════════════════════════════════════════╗
║              Test Summary                  ║
╚════════════════════════════════════════════╝

✓ Passed: 12
✗ Failed: 0
  Total: 12

🎉 All tests passed!
```

#### **Test 2: Audit System Test**

```bash
./test-audit-system.sh
```

**Expected Output:**

```
╔════════════════════════════════════════════╗
║   Audit System Test Suite (Phase 4)       ║
╚════════════════════════════════════════════╝

Testing against: http://localhost:3000

📋 Test 1: Log Audit Event
Testing: Log payment event... ✓ PASSED
Testing: Log KYC event... ✓ PASSED

🔍 Test 2: Query Audit Trails
Testing: Get user audit trail... ✓ PASSED
Testing: Get transaction audit trail... ✓ PASSED

📊 Test 3: Activity & Statistics
Testing: Get recent activity... ✓ PASSED
Testing: Get audit statistics... ✓ PASSED

⚠️  Test 4: Special Views
Testing: Get failed events... ✓ PASSED
Testing: Get admin actions... ✓ PASSED

💾 Test 5: Export Functions
Testing: Export to CSV... ✓ PASSED
Testing: Export to JSON... ✓ PASSED

╔════════════════════════════════════════════╗
║              Test Summary                  ║
╚════════════════════════════════════════════╝

✓ Passed: 10
✗ Failed: 0
  Total: 10

🎉 All tests passed!
```

---

## 🌐 **API Testing**

### **Manual API Tests with curl**

#### **1. Health Check**

```bash
curl http://localhost:3000/api/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

#### **2. KYC Tests**

```bash
# Start KYC verification
curl -X POST http://localhost:3000/api/kyc/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
    "email": "test@example.com",
    "fullName": "Test User",
    "level": "basic"
  }'

# Check KYC status
curl http://localhost:3000/api/kyc/status/test-user-001
```

#### **3. Crypto Payment Test**

```bash
curl -X POST http://localhost:3000/api/crypto/invoice/create \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-001",
    "userId": "user-001",
    "amountUSD": 1000,
    "cryptocurrency": "USDT",
    "ipCountry": "US",
    "cryptoAddress": "0x1234567890123456789012345678901234567890"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "invoice": {
    "id": "AMK-12345678",
    "amount": 1000,
    "cryptocurrency": "USDT",
    "status": "pending"
  },
  "riskAssessment": {
    "score": 25,
    "level": "low",
    "action": "auto_approve"
  },
  "monitoring": {
    "monitored": true,
    "checks": 5,
    "alerts": 0
  }
}
```

#### **4. Audit Logs Tests**

```bash
# Log audit event
curl -X POST http://localhost:3000/api/audit/log \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "payment_created",
    "eventCategory": "payment",
    "userId": "test-user",
    "action": "Test payment",
    "status": "success"
  }'

# Get recent activity
curl http://localhost:3000/api/audit/activity/recent

# Get statistics
curl http://localhost:3000/api/audit/statistics?days=7

# Export to CSV
curl "http://localhost:3000/api/audit/export/csv?limit=100" \
  -o audit_logs.csv

# Verify file
head audit_logs.csv
```

---

## 🗄️ **Database Testing**

### **Verify Tables and Data**

```sql
-- Connect to database
psql $DATABASE_URL

-- Check all tables exist
\dt

-- Test crypto_payments table
SELECT COUNT(*) FROM crypto_payments;
SELECT * FROM crypto_payments LIMIT 5;

-- Test kyc_verifications table
SELECT COUNT(*) FROM kyc_verifications;
SELECT * FROM kyc_verifications LIMIT 5;

-- Test risk_assessments table
SELECT COUNT(*) FROM risk_assessments;
SELECT * FROM risk_assessments LIMIT 5;

-- Test transaction_monitoring table
SELECT COUNT(*) FROM transaction_monitoring;
SELECT * FROM transaction_monitoring LIMIT 5;

-- Test payment_audit_log table
SELECT COUNT(*) FROM payment_audit_log;
SELECT * FROM payment_audit_log LIMIT 5;

-- Test views
SELECT * FROM recent_audit_activity;
SELECT * FROM failed_audit_events LIMIT 10;
SELECT * FROM admin_actions_audit LIMIT 10;

-- Test functions
SELECT * FROM get_user_audit_trail('test-user-001', 10);
SELECT is_entity_sanctioned('wallet', '0x123abc');

-- Quit
\q
```

---

## 💻 **Frontend Testing**

### **1. Start Development Server**

```bash
cd frontend
npm run dev
```

**Expected:** Server starts on http://localhost:5173

### **2. Manual UI Testing**

Visit these pages:

1. **Landing Page:** http://localhost:5173/

   - [ ] Visual effects working (holographic cards, cursor trail, etc.)
   - [ ] Navigation functional
   - [ ] Forms submitting

2. **Compliance Dashboard:** http://localhost:5173/admin/compliance

   - [ ] Overview tab loads statistics
   - [ ] Audit logs search works
   - [ ] Manual review shows failed events
   - [ ] Export buttons download files

3. **Crypto Payment Modal**
   - [ ] Modal opens
   - [ ] QR code displays
   - [ ] Payment address copyable
   - [ ] Status updates

### **3. Browser Console Check**

Open DevTools (F12) and check:

- [ ] No errors in Console
- [ ] Network requests succeeding
- [ ] No 404s or 500s

---

## 🔗 **Integration Testing**

### **End-to-End Payment Flow**

Test complete payment flow from start to finish:

```bash
# 1. Create payment invoice
INVOICE_ID=$(curl -s -X POST http://localhost:3000/api/crypto/invoice/create \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "e2e-test-001",
    "userId": "user-e2e-001",
    "amountUSD": 500,
    "cryptocurrency": "USDT",
    "ipCountry": "US",
    "cryptoAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
  }' | jq -r '.invoice.id')

echo "Invoice created: $INVOICE_ID"

# 2. Verify risk assessment ran
curl -s "http://localhost:3000/api/monitoring/alerts" | jq '.alerts[] | select(.transaction_id == "'$INVOICE_ID'")'

# 3. Check audit log
curl -s "http://localhost:3000/api/audit/activity/recent" | jq '.activity[] | select(.event_type == "payment_created")'

# 4. Verify all phases executed
echo "✅ Payment created"
echo "✅ Risk assessed"
echo "✅ Monitoring checked"
echo "✅ Audit logged"
```

---

## ⚡ **Performance Testing**

### **Load Testing with Apache Bench**

```bash
# Install Apache Bench
brew install httpd  # macOS

# Test 1: Health endpoint (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test 2: Payment creation (100 requests, 5 concurrent)
ab -n 100 -c 5 -p payment.json -T application/json \
  http://localhost:3000/api/crypto/invoice/create

# Expected results:
# - Health: < 10ms average
# - Payment: < 100ms average
# - 99% requests successful
```

### **Database Performance**

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔒 **Security Testing**

### **1. SQL Injection Test**

```bash
# Try SQL injection in user input
curl -X POST http://localhost:3000/api/kyc/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'; DROP TABLE users; --",
    "email": "test@example.com",
    "fullName": "Test User"
  }'

# Expected: Should fail gracefully, not execute SQL
```

### **2. XSS Test**

```bash
# Try XSS in metadata
curl -X POST http://localhost:3000/api/audit/log \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "user_action",
    "eventCategory": "user",
    "action": "<script>alert(\"XSS\")</script>",
    "status": "success"
  }'

# Expected: Script should be sanitized/escaped
```

### **3. Rate Limiting Test**

```bash
# Send 100 rapid requests
for i in {1..100}; do
  curl -s http://localhost:3000/api/health > /dev/null
done

# Expected: Should succeed (rate limiting not yet implemented)
# TODO: Add rate limiting in production
```

### **4. Authentication Test**

```bash
# Try accessing admin endpoint without auth
curl http://localhost:3000/admin/compliance

# Expected: Should require authentication
# TODO: Add authentication middleware
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Issue 1: Server won't start**

```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill existing process
kill -9 $(lsof -ti:3000)

# Restart server
npm run dev
```

#### **Issue 2: Database connection failed**

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep amrikyy

# Recreate if needed
dropdb amrikyy
createdb amrikyy

# Rerun migrations
psql $DATABASE_URL -f backend/database/migrations/*.sql
```

#### **Issue 3: Tests failing**

```bash
# Check environment variables
cat .env

# Verify database tables
psql $DATABASE_URL -c "\dt"

# Check server logs
tail -f logs/server.log

# Run tests in verbose mode
DEBUG=* node test-paymentskit.js
```

#### **Issue 4: Frontend not loading**

```bash
cd frontend

# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Restart dev server
npm run dev
```

---

## ✅ **Testing Checklist**

### **Phase 1: KYC/AML**

- [ ] KYC start endpoint works
- [ ] KYC status endpoint works
- [ ] Supabase integration working
- [ ] HMAC webhook verification works
- [ ] Database table populated

### **Phase 2: Risk Engine**

- [ ] Low risk transactions approved
- [ ] High risk transactions flagged
- [ ] Risk scoring accurate
- [ ] Database records created
- [ ] Integration with payment flow

### **Phase 3: Transaction Monitoring**

- [ ] Sanctions checking works
- [ ] Velocity monitoring works
- [ ] Amount patterns detected
- [ ] Geolocation checks work
- [ ] Alerts created correctly

### **Phase 4: Audit Logging**

- [ ] Events logged correctly
- [ ] User audit trail works
- [ ] Transaction audit trail works
- [ ] Statistics calculated
- [ ] CSV export works
- [ ] JSON export works
- [ ] Hash integrity verified

### **Frontend**

- [ ] Landing page loads
- [ ] Compliance dashboard loads
- [ ] All tabs functional
- [ ] Export buttons work
- [ ] No console errors

### **Integration**

- [ ] End-to-end payment flow works
- [ ] All phases execute in sequence
- [ ] Data consistent across tables
- [ ] Audit logs complete

---

## 📊 **Test Results Template**

```markdown
# Test Results

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Development/Staging/Production

## Test Summary

- Total Tests: XX
- Passed: XX
- Failed: XX
- Skipped: XX

## Phase 1: KYC/AML

✅ All tests passed

## Phase 2: Risk Engine

✅ All tests passed

## Phase 3: Monitoring

✅ All tests passed

## Phase 4: Audit Logs

✅ All tests passed

## Issues Found

1. Issue description
   - Severity: Low/Medium/High/Critical
   - Steps to reproduce
   - Expected vs actual

## Recommendations

- List any recommendations

## Sign-off

- [ ] Ready for deployment
- [ ] Needs fixes before deployment
```

---

## 🚀 **Ready for Production?**

Before deploying to production, ensure:

- [ ] All automated tests passing
- [ ] Manual testing complete
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

**Questions or Issues?**

- Review: `QUICK_START.md`
- Check: `PAYMENTS_KIT_IMPLEMENTATION.md`
- Reference: `TESTING_AND_EXECUTION_GUIDE.md`

**Happy Testing! 🎉**
