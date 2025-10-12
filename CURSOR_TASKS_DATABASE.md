# 📋 Cursor Tasks - Database Schema

**Priority:** 🔴 **Critical**  
**Estimated Time:** 45 minutes  
**Files:** `backend/database/production-schema-complete.sql`

---

## ✅ What's Already Done

- ✅ Complete schema file created (`production-schema-complete.sql`)
- ✅ All tables defined (traveler_personas, booking_outcomes, etc.)
- ✅ GIN indexes on JSONB columns
- ✅ Row Level Security policies
- ✅ Partitioning strategy (user_behavior_log)
- ✅ Audit logging with hash chaining
- ✅ Materialized views (user_booking_stats, hotel_social_proof)
- ✅ Helper functions (calculate_traveler_persona, get_hotel_social_proof)

---

## 📋 Tasks to Execute in Gitpod

### **Task 1: Run Schema in Supabase** (10 min)

```bash
# 1. Open Supabase Dashboard
# Go to: https://app.supabase.com/project/YOUR_PROJECT/sql

# 2. Copy schema file
cat backend/database/production-schema-complete.sql

# 3. Paste in SQL Editor and run
# Expected: "Success. No rows returned"

# 4. Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'traveler_personas',
    'booking_outcomes',
    'social_proof_cache',
    'trip_predictions',
    'outcome_predictions',
    'referrals',
    'shared_content',
    'user_behavior_log',
    'audit_log'
  );

# Expected: All 9 tables listed
```

---

### **Task 2: Verify Indexes** (5 min)

```sql
-- Check GIN indexes (critical for JSONB performance)
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%gin%';

-- Expected indexes:
-- ✅ idx_personas_booking_patterns
-- ✅ idx_outcomes_ratings
-- ✅ idx_behavior_action_data
-- ✅ idx_predictions_reasoning
-- ✅ idx_outcome_pred_factors
-- ✅ idx_shared_content_data
```

---

### **Task 3: Verify RLS Policies** (5 min)

```sql
-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: 15+ policies
-- Each table should have at least:
-- - Users view own data
-- - Admins view all data (if applicable)
```

---

### **Task 4: Verify Partitions** (5 min)

```sql
-- Check partitions for user_behavior_log
SELECT
  parent.relname AS parent_table,
  child.relname AS partition_name
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'user_behavior_log';

-- Expected: 6 partitions (2025-10 through 2026-03)
```

---

### **Task 5: Test Functions** (10 min)

```sql
-- Test 1: Calculate persona (should be instant with materialized view)
SELECT calculate_traveler_persona('USER_UUID_HERE');

-- Test 2: Get social proof
SELECT * FROM get_hotel_social_proof('hotel-123', 'مسافر_متوسط');

-- Test 3: Verify audit integrity
SELECT verify_audit_log_integrity();
-- Expected: TRUE

-- Test 4: Get user analytics
SELECT get_user_analytics('USER_UUID_HERE');
-- Expected: JSON with persona, trips, k_factor, etc.

-- Test 5: Calculate K-factor
SELECT calculate_k_factor('USER_UUID_HERE');
-- Expected: Number (0-5)
```

---

### **Task 6: Schedule Cron Jobs** (10 min)

```sql
-- Enable pg_cron extension (if not enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job 1: Refresh materialized views (hourly)
SELECT cron.schedule(
  'refresh-analytics',
  '0 * * * *',
  'SELECT refresh_analytics_views()'
);

-- Job 2: Create next month's partition (monthly)
SELECT cron.schedule(
  'create-partition',
  '0 0 1 * *',
  'SELECT create_monthly_partition()'
);

-- Job 3: Expire old crypto payments (every 5 minutes)
SELECT cron.schedule(
  'expire-payments',
  '*/5 * * * *',
  'SELECT maintain_crypto_payments()'
);

-- Verify cron jobs
SELECT * FROM cron.job;
```

---

### **Task 7: Test Performance** (5 min)

```sql
-- Test query speed

-- Query 1: Get persona (should be < 10ms)
EXPLAIN ANALYZE
SELECT persona FROM user_booking_stats WHERE user_id = 'uuid';

-- Query 2: Get social proof (should be < 20ms)
EXPLAIN ANALYZE
SELECT * FROM get_hotel_social_proof('hotel-123', NULL);

-- Query 3: Behavior query on partition (should be < 100ms)
EXPLAIN ANALYZE
SELECT * FROM user_behavior_log
WHERE user_id = 'uuid'
  AND timestamp >= '2025-10-01'
  AND timestamp < '2025-11-01'
LIMIT 50;
```

---

## ✅ Success Criteria

- [ ] All 9 tables created
- [ ] All GIN indexes exist (6+)
- [ ] All RLS policies active (15+)
- [ ] All 6 partitions created
- [ ] All 5 functions working
- [ ] All 3 cron jobs scheduled
- [ ] Query performance < 50ms average
- [ ] Audit log integrity verified

---

## 🚨 Rollback Plan (if needed)

```sql
-- If something goes wrong, run:
-- See SCHEMA_MIGRATION_GUIDE.md > Rollback Plan
```

---

## 📊 Expected Performance

| Query          | Before | After | Improvement        |
| -------------- | ------ | ----- | ------------------ |
| Persona lookup | 500ms  | 5ms   | **100x faster**    |
| Social proof   | 300ms  | 10ms  | **30x faster**     |
| Behavior query | 2-5s   | 50ms  | **40-100x faster** |

---

**Status after completion:** Database production-ready! ✅
