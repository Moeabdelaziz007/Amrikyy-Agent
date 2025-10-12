# 🔧 Database Schema - Critical Fixes & Enhancements

## 🔴 Priority 1: Critical Fixes (MUST DO)

### Task 1.1: Add Missing Base Tables

**File to create:** `backend/database/base-tables.sql`

```sql
-- ============================================
-- Base Tables (Missing Dependencies)
-- ============================================

-- 1. Users Table (Foundation)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  telegram_id BIGINT UNIQUE,
  whatsapp_number TEXT,
  
  -- Authentication
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Profile
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Africa/Cairo',
  
  -- Status
  account_status TEXT CHECK (account_status IN ('active', 'suspended', 'deleted')) DEFAULT 'active',
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_status ON users(account_status);

-- 2. Trips Table (Booking Tracking)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Trip details
  destination TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  travelers_count INT DEFAULT 1,
  
  -- Booking
  hotel_identifier TEXT,
  hotel_name TEXT,
  price_per_night DECIMAL(10,2),
  total_price DECIMAL(10,2),
  
  -- Status
  booking_status TEXT CHECK (booking_status IN (
    'searching', 'pending', 'confirmed', 'cancelled', 'completed'
  )) DEFAULT 'searching',
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN (
    'unpaid', 'pending', 'paid', 'refunded'
  )) DEFAULT 'unpaid',
  payment_method TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_trip_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT check_dates_valid CHECK (check_out_date > check_in_date),
  CONSTRAINT check_nights_positive CHECK (nights > 0),
  CONSTRAINT check_price_positive CHECK (price_per_night > 0 AND total_price > 0)
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(booking_status);
CREATE INDEX idx_trips_dates ON trips(check_in_date, check_out_date);
CREATE INDEX idx_trips_hotel ON trips(hotel_identifier);
```

**Action:** Create this file and run it on Supabase

---

### Task 1.2: Add Row Level Security (RLS)

**File to create:** `backend/database/rls-policies.sql`

```sql
-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE traveler_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;

-- Users: Can only see/edit their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Trips: Users can only see their own trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

-- Personas: Users can only see their own persona
CREATE POLICY "Users can view own personas"
  ON traveler_personas FOR SELECT
  USING (auth.uid() = user_id);

-- Booking Outcomes: Users can only see their own outcomes
CREATE POLICY "Users can view own bookings"
  ON booking_outcomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own booking outcomes"
  ON booking_outcomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Behavior Log: Users can only see their own behavior
CREATE POLICY "Users can view own behavior"
  ON user_behavior_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can log user behavior"
  ON user_behavior_log FOR INSERT
  WITH CHECK (true); -- Allow system to log

-- Predictions: Users can only see their own predictions
CREATE POLICY "Users can view own predictions"
  ON trip_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own outcome predictions"
  ON outcome_predictions FOR SELECT
  USING (auth.uid() = user_id);

-- Referrals: Users can view referrals they made or received
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Shared Content: Users can view their own shared content
CREATE POLICY "Users can view own shared content"
  ON shared_content FOR SELECT
  USING (auth.uid() = user_id);

-- Admin Policies: Admins can see everything
CREATE POLICY "Admins can view all users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all trips"
  ON trips FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Repeat for all tables...
```

**Action:** Create this file and run it on Supabase

---

### Task 1.3: Add JSONB Indexes

**File to create:** `backend/database/jsonb-indexes.sql`

```sql
-- ============================================
-- JSONB Performance Indexes
-- ============================================

-- Traveler Personas
CREATE INDEX IF NOT EXISTS idx_personas_booking_patterns 
  ON traveler_personas USING GIN(booking_patterns);

-- Booking Outcomes
CREATE INDEX IF NOT EXISTS idx_outcomes_ratings 
  ON booking_outcomes USING GIN(ratings);

-- User Behavior Log
CREATE INDEX IF NOT EXISTS idx_behavior_action_data 
  ON user_behavior_log USING GIN(action_data);

-- Trip Predictions
CREATE INDEX IF NOT EXISTS idx_predictions_dates 
  ON trip_predictions USING GIN(predicted_dates);

CREATE INDEX IF NOT EXISTS idx_predictions_budget 
  ON trip_predictions USING GIN(predicted_budget_range);

CREATE INDEX IF NOT EXISTS idx_predictions_reasoning 
  ON trip_predictions USING GIN(prediction_reasoning);

-- Outcome Predictions
CREATE INDEX IF NOT EXISTS idx_outcome_pred_predictions 
  ON outcome_predictions USING GIN(predictions);

CREATE INDEX IF NOT EXISTS idx_outcome_pred_factors 
  ON outcome_predictions USING GIN(factors_considered);

-- Shared Content
CREATE INDEX IF NOT EXISTS idx_shared_content_data 
  ON shared_content USING GIN(content_data);
```

**Action:** Create this file and run it on Supabase

---

### Task 1.4: Add Data Validation Constraints

**File to create:** `backend/database/validation-constraints.sql`

```sql
-- ============================================
-- Data Validation Constraints
-- ============================================

-- Booking Outcomes Validation
ALTER TABLE booking_outcomes 
  ADD CONSTRAINT check_satisfaction_range 
  CHECK (satisfaction_score BETWEEN 1 AND 10);

ALTER TABLE booking_outcomes 
  ADD CONSTRAINT check_nights_positive 
  CHECK (nights_stayed > 0);

ALTER TABLE booking_outcomes 
  ADD CONSTRAINT check_price_positive 
  CHECK (price_per_night > 0);

-- Outcome Predictions Validation
ALTER TABLE outcome_predictions 
  ADD CONSTRAINT check_predicted_satisfaction_range 
  CHECK (predicted_satisfaction BETWEEN 1 AND 10);

ALTER TABLE outcome_predictions 
  ADD CONSTRAINT check_confidence_range 
  CHECK (confidence_level BETWEEN 0 AND 1);

ALTER TABLE outcome_predictions 
  ADD CONSTRAINT check_prediction_accuracy_range 
  CHECK (prediction_accuracy IS NULL OR prediction_accuracy BETWEEN 0 AND 1);

-- Social Proof Cache Validation
ALTER TABLE social_proof_cache 
  ADD CONSTRAINT check_satisfaction_range_cache 
  CHECK (avg_satisfaction BETWEEN 0 AND 10);

ALTER TABLE social_proof_cache 
  ADD CONSTRAINT check_rates_valid 
  CHECK (
    (rebooking_rate IS NULL OR rebooking_rate BETWEEN 0 AND 1) AND
    (expectation_exceeded_rate IS NULL OR expectation_exceeded_rate BETWEEN 0 AND 1)
  );

ALTER TABLE social_proof_cache 
  ADD CONSTRAINT check_value_score_positive 
  CHECK (value_score IS NULL OR value_score >= 0);

-- Referrals Validation
ALTER TABLE referrals 
  ADD CONSTRAINT check_reward_amounts_positive 
  CHECK (
    referrer_reward_amount >= 0 AND
    referred_reward_amount >= 0 AND
    bonus_if_booked_48h >= 0
  );

-- Daily Metrics Validation
ALTER TABLE daily_metrics 
  ADD CONSTRAINT check_rates_valid_metrics 
  CHECK (
    (conversion_rate IS NULL OR conversion_rate BETWEEN 0 AND 100) AND
    (emotional_detection_accuracy IS NULL OR emotional_detection_accuracy BETWEEN 0 AND 100) AND
    (prediction_accuracy IS NULL OR prediction_accuracy BETWEEN 0 AND 100) AND
    (social_proof_conversion_lift IS NULL OR social_proof_conversion_lift >= -100) AND
    (viral_coefficient IS NULL OR viral_coefficient >= 0)
  );

ALTER TABLE daily_metrics 
  ADD CONSTRAINT check_counts_non_negative 
  CHECK (
    daily_active_users >= 0 AND
    new_users >= 0 AND
    returning_users >= 0 AND
    total_searches >= 0 AND
    total_bookings >= 0 AND
    predictions_generated >= 0 AND
    predictions_converted >= 0 AND
    social_proof_shown >= 0 AND
    total_shares >= 0 AND
    referral_conversions >= 0
  );
```

**Action:** Create this file and run it on Supabase

---

## 🟡 Priority 2: Performance Optimizations

### Task 2.1: Add Partitioning for Large Tables

**File to create:** `backend/database/partitioning.sql`

```sql
-- ============================================
-- Table Partitioning (for scalability)
-- ============================================

-- Drop existing table and recreate as partitioned
DROP TABLE IF EXISTS user_behavior_log CASCADE;

CREATE TABLE user_behavior_log (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_id UUID,
  
  action_type TEXT NOT NULL CHECK (action_type IN (
    'بدء_بحث', 'عرض_فندق', 'مقارنة_فنادق', 'حفظ_للمفضلة',
    'قراءة_تقييمات', 'تغيير_ميزانية', 'تغيير_تواريخ',
    'إكمال_حجز', 'إلغاء_حجز', 'مشاركة_نتائج'
  )),
  
  action_data JSONB DEFAULT '{}'::jsonb,
  emotional_state TEXT,
  device_type TEXT,
  referrer_source TEXT,
  
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  hour_of_day INT,
  day_of_week INT,
  
  ip_country TEXT,
  user_agent TEXT,
  
  PRIMARY KEY (id, timestamp),
  CONSTRAINT fk_behavior_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) PARTITION BY RANGE (timestamp);

-- Create partitions for current and next 3 months
CREATE TABLE user_behavior_log_2025_01 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE user_behavior_log_2025_02 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE user_behavior_log_2025_03 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Function to auto-create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS VOID AS $$
DECLARE
  partition_date DATE := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  partition_name TEXT := 'user_behavior_log_' || TO_CHAR(partition_date, 'YYYY_MM');
  next_month DATE := partition_date + INTERVAL '1 month';
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I PARTITION OF user_behavior_log
    FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    partition_date,
    next_month
  );
  
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly (requires pg_cron extension)
-- SELECT cron.schedule('create-monthly-partition', '0 0 1 * *', 'SELECT create_monthly_partition()');
```

**Action:** Create this file and run it on Supabase

---

### Task 2.2: Add Materialized Views for Performance

**File to create:** `backend/database/materialized-views.sql`

```sql
-- ============================================
-- Materialized Views (for fast queries)
-- ============================================

-- User Booking Statistics (for persona calculation)
CREATE MATERIALIZED VIEW user_booking_stats AS
SELECT 
  user_id,
  COUNT(*) as total_bookings,
  AVG((action_data->>'budget')::DECIMAL) as avg_budget,
  AVG((action_data->>'nights')::INT) as avg_nights,
  ARRAY_AGG(DISTINCT action_data->>'destination') FILTER (WHERE action_data->>'destination' IS NOT NULL) as destinations,
  MAX(timestamp) as last_booking_date,
  CASE 
    WHEN AVG((action_data->>'budget')::DECIMAL) < 80 THEN 'مسافر_اقتصادي'
    WHEN AVG((action_data->>'budget')::DECIMAL) < 150 THEN 'مسافر_متوسط'
    ELSE 'باحث_عن_فخامة'
  END as calculated_persona
FROM user_behavior_log
WHERE action_type = 'إكمال_حجز'
  AND action_data->>'budget' IS NOT NULL
GROUP BY user_id;

CREATE UNIQUE INDEX idx_booking_stats_user ON user_booking_stats(user_id);

-- Hotel Performance by Persona
CREATE MATERIALIZED VIEW hotel_performance_by_persona AS
SELECT 
  hotel_identifier,
  user_persona,
  COUNT(*) as total_bookings,
  AVG(satisfaction_score) as avg_satisfaction,
  COUNT(*) FILTER (WHERE would_rebook = true) * 100.0 / COUNT(*) as rebooking_rate,
  COUNT(*) FILTER (WHERE exceeded_expectations = true) * 100.0 / COUNT(*) as exceeded_rate,
  AVG(price_per_night) as avg_price,
  ARRAY_AGG(DISTINCT unnest(highlights)) FILTER (WHERE highlights IS NOT NULL) as common_highlights,
  ARRAY_AGG(DISTINCT unnest(pain_points)) FILTER (WHERE pain_points IS NOT NULL) as common_pain_points
FROM booking_outcomes
GROUP BY hotel_identifier, user_persona
HAVING COUNT(*) >= 5; -- Minimum 5 bookings for statistical significance

CREATE INDEX idx_hotel_perf_hotel ON hotel_performance_by_persona(hotel_identifier);
CREATE INDEX idx_hotel_perf_persona ON hotel_performance_by_persona(user_persona);
CREATE INDEX idx_hotel_perf_satisfaction ON hotel_performance_by_persona(avg_satisfaction DESC);

-- Refresh materialized views (schedule hourly)
-- SELECT cron.schedule('refresh-booking-stats', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY user_booking_stats');
-- SELECT cron.schedule('refresh-hotel-performance', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY hotel_performance_by_persona');
```

**Action:** Create this file and run it on Supabase

---

### Task 2.3: Add Audit Logging

**File to create:** `backend/database/audit-logging.sql`

```sql
-- ============================================
-- Audit Logging (for compliance & debugging)
-- ============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_operation ON audit_log(operation);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    user_id
  )
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END,
      auth.uid()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_booking_outcomes
AFTER INSERT OR UPDATE OR DELETE ON booking_outcomes
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_trips
AFTER INSERT OR UPDATE OR DELETE ON trips
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_trip_predictions
AFTER INSERT OR UPDATE OR DELETE ON trip_predictions
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_referrals
AFTER INSERT OR UPDATE OR DELETE ON referrals
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Retention policy: Keep audit logs for 90 days
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS VOID AS $$
BEGIN
  DELETE FROM audit_log
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up audit logs older than 90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs()');
```

**Action:** Create this file and run it on Supabase

---

## 📝 Summary for Cursor:

**Create these 8 SQL files in `backend/database/` folder:**

1. ✅ `base-tables.sql` - Users & Trips tables
2. ✅ `rls-policies.sql` - Row Level Security
3. ✅ `jsonb-indexes.sql` - Performance indexes
4. ✅ `validation-constraints.sql` - Data validation
5. ✅ `partitioning.sql` - Table partitioning
6. ✅ `materialized-views.sql` - Fast queries
7. ✅ `audit-logging.sql` - Compliance & debugging
8. ✅ `run-all.sql` - Master script to run all

**Then run on Supabase in this order:**
```sql
\i backend/database/base-tables.sql
\i backend/database/rls-policies.sql
\i backend/database/jsonb-indexes.sql
\i backend/database/validation-constraints.sql
\i backend/database/partitioning.sql
\i backend/database/materialized-views.sql
\i backend/database/audit-logging.sql
```

**Expected Result:**
- ✅ All foreign keys working
- ✅ RLS protecting user data
- ✅ Fast JSONB queries
- ✅ Data integrity enforced
- ✅ Scalable to millions of rows
- ✅ Full audit trail

---

**Ready for Cursor to implement?** ✅
