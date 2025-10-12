-- ============================================
-- 🚀 Amrikyy Complete Production Database Schema
-- Advanced Social Proof + Predictive Intelligence + Viral Growth
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For combined indexes

-- ============================================
-- PART 1: CORE TABLES (Users, Trips, Payments)
-- ============================================

-- Note: users table already exists in enhanced-schema.sql
-- This schema extends it with advanced features

-- ============================================
-- PART 2: SOCIAL PROOF SYSTEM
-- ============================================

-- Table: traveler_personas (تحديد نمط المسافر)
CREATE TABLE IF NOT EXISTS traveler_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Persona classification
  persona_type TEXT NOT NULL CHECK (persona_type IN (
    'مسافر_اقتصادي',
    'مسافر_متوسط',
    'باحث_عن_فخامة',
    'مستكشف_جديد',
    'مسافر_دائم'
  )),
  
  -- Booking patterns (JSON for flexibility)
  booking_patterns JSONB DEFAULT '{
    "avg_budget": 0,
    "preferred_destinations": [],
    "booking_frequency": "occasional",
    "typical_duration": 0
  }'::jsonb,
  
  -- Confidence scores
  confidence_level DECIMAL(3,2) CHECK (confidence_level BETWEEN 0 AND 1),
  
  -- Metadata
  calculated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_persona_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_persona UNIQUE(user_id)
);

-- GIN index for JSONB queries (CRITICAL!)
CREATE INDEX idx_personas_booking_patterns 
  ON traveler_personas USING GIN(booking_patterns);
CREATE INDEX idx_personas_type ON traveler_personas(persona_type);
CREATE INDEX idx_personas_user ON traveler_personas(user_id);

-- Table: booking_outcomes (تتبع نتائج الحجوزات)
CREATE TABLE IF NOT EXISTS booking_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Hotel details
  hotel_identifier TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  
  -- Trip details
  destination TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights_stayed INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  -- Pricing
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
  
  -- User satisfaction
  rating INT CHECK (rating >= 1 AND rating <= 5),
  would_rebook BOOLEAN,
  expectation_exceeded BOOLEAN,
  value_for_money INT CHECK (value_for_money >= 1 AND value_for_money <= 5),
  
  -- Detailed ratings
  ratings JSONB DEFAULT '{
    "cleanliness": 0,
    "location": 0,
    "service": 0,
    "amenities": 0,
    "food": 0
  }'::jsonb,
  
  -- Feedback
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT, -- 'booking_confirmation', 'photo', 'receipt'
  
  -- Timestamps
  completed_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  
  CONSTRAINT fk_outcome_booking FOREIGN KEY (booking_id) 
    REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_outcome_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT check_dates_valid CHECK (check_out_date > check_in_date)
);

-- GIN index for JSONB
CREATE INDEX idx_outcomes_ratings ON booking_outcomes USING GIN(ratings);
CREATE INDEX idx_outcomes_booking ON booking_outcomes(booking_id);
CREATE INDEX idx_outcomes_user ON booking_outcomes(user_id);
CREATE INDEX idx_outcomes_hotel ON booking_outcomes(hotel_identifier);
CREATE INDEX idx_outcomes_destination ON booking_outcomes(destination);
CREATE INDEX idx_outcomes_rating ON booking_outcomes(rating);

-- Table: social_proof_cache (cache للـ social proof aggregations)
CREATE TABLE IF NOT EXISTS social_proof_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_identifier TEXT NOT NULL UNIQUE,
  
  -- Persona-based statistics
  persona_type TEXT NOT NULL,
  
  -- Aggregated metrics
  total_bookings INT DEFAULT 0,
  avg_rating DECIMAL(3,2),
  rebooking_rate DECIMAL(3,2) CHECK (rebooking_rate BETWEEN 0 AND 1),
  expectation_exceeded_rate DECIMAL(3,2) CHECK (expectation_exceeded_rate BETWEEN 0 AND 1),
  
  -- Detailed aggregations
  rating_distribution JSONB DEFAULT '{
    "1_star": 0,
    "2_star": 0,
    "3_star": 0,
    "4_star": 0,
    "5_star": 0
  }'::jsonb,
  
  -- Trust score
  trust_score DECIMAL(3,2),
  
  -- Cache metadata
  cached_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_hotel_persona UNIQUE(hotel_identifier, persona_type)
);

CREATE INDEX idx_social_cache_hotel ON social_proof_cache(hotel_identifier);
CREATE INDEX idx_social_cache_persona ON social_proof_cache(persona_type);
CREATE INDEX idx_social_cache_trust ON social_proof_cache(trust_score DESC);

-- ============================================
-- PART 3: PREDICTIVE INTELLIGENCE
-- ============================================

-- Table: trip_predictions (تنبؤات الرحلات)
CREATE TABLE IF NOT EXISTS trip_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Predicted trip
  predicted_destination TEXT NOT NULL,
  predicted_dates_range DATERANGE,
  predicted_budget DECIMAL(10,2),
  
  -- Prediction metadata
  prediction_reasoning JSONB DEFAULT '{
    "based_on": [],
    "confidence_factors": [],
    "similar_users": []
  }'::jsonb,
  
  confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level BETWEEN 0 AND 1),
  
  -- Tracking
  was_accurate BOOLEAN,
  user_feedback TEXT,
  
  -- Timestamps
  predicted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  CONSTRAINT fk_prediction_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_predictions_user ON trip_predictions(user_id);
CREATE INDEX idx_predictions_confidence ON trip_predictions(confidence_level DESC);
CREATE INDEX idx_predictions_destination ON trip_predictions(predicted_destination);
CREATE INDEX idx_predictions_reasoning ON trip_predictions USING GIN(prediction_reasoning);

-- Table: outcome_predictions (تنبؤات النتائج)
CREATE TABLE IF NOT EXISTS outcome_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Predicted outcome
  predicted_rating DECIMAL(3,2) CHECK (predicted_rating BETWEEN 1 AND 5),
  predicted_satisfaction DECIMAL(3,2) CHECK (predicted_satisfaction BETWEEN 0 AND 1),
  
  -- Prediction basis
  factors_considered JSONB DEFAULT '{
    "user_history": [],
    "hotel_reviews": {},
    "persona_match": 0,
    "price_value_ratio": 0
  }'::jsonb,
  
  confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level BETWEEN 0 AND 1),
  
  -- Actual outcome (filled after trip)
  actual_rating INT CHECK (actual_rating BETWEEN 1 AND 5),
  actual_satisfaction BOOLEAN,
  
  -- Accuracy tracking
  prediction_accuracy DECIMAL(3,2),
  
  -- Timestamps
  predicted_at TIMESTAMP DEFAULT NOW(),
  outcome_recorded_at TIMESTAMP,
  
  CONSTRAINT fk_outcome_pred_booking FOREIGN KEY (booking_id) 
    REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_outcome_pred_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_outcome_pred_booking ON outcome_predictions(booking_id);
CREATE INDEX idx_outcome_pred_user ON outcome_predictions(user_id);
CREATE INDEX idx_outcome_pred_accuracy ON outcome_predictions(prediction_accuracy DESC);
CREATE INDEX idx_outcome_pred_factors ON outcome_predictions USING GIN(factors_considered);

-- ============================================
-- PART 4: VIRAL GROWTH SYSTEM
-- ============================================

-- Table: referrals (نظام الإحالات)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  
  -- Referral code
  referral_code TEXT NOT NULL UNIQUE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',     -- رمز موجود، لم يُستخدم بعد
    'signed_up',   -- تم التسجيل
    'first_booking', -- أول حجز
    'active_user'  -- مستخدم نشط
  )),
  
  -- Reward tracking
  reward_tier TEXT CHECK (reward_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  reward_amount DECIMAL(10,2) DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  referral_channel TEXT, -- 'direct', 'telegram', 'whatsapp', 'email'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  signed_up_at TIMESTAMP,
  first_booking_at TIMESTAMP,
  
  CONSTRAINT fk_referrer FOREIGN KEY (referrer_user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_referred FOREIGN KEY (referred_user_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Table: shared_content (محتوى مشارك)
CREATE TABLE IF NOT EXISTS shared_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- Content details
  content_type TEXT NOT NULL CHECK (content_type IN (
    'trip',
    'destination',
    'review',
    'itinerary',
    'budget_plan'
  )),
  content_id UUID, -- Reference to trips, destinations, etc.
  content_data JSONB NOT NULL,
  
  -- Sharing tracking
  share_platform TEXT NOT NULL, -- 'telegram', 'whatsapp', 'facebook', 'twitter', 'link'
  share_count INT DEFAULT 1,
  view_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0, -- عدد الحجوزات من الشير
  
  -- Viral metrics
  viral_score DECIMAL(5,2), -- Calculated based on shares, views, conversions
  k_factor DECIMAL(5,2), -- Viral coefficient
  
  -- Timestamps
  first_shared_at TIMESTAMP DEFAULT NOW(),
  last_shared_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_shared_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shared_user ON shared_content(user_id);
CREATE INDEX idx_shared_type ON shared_content(content_type);
CREATE INDEX idx_shared_platform ON shared_content(share_platform);
CREATE INDEX idx_shared_viral_score ON shared_content(viral_score DESC);
CREATE INDEX idx_shared_content_data ON shared_content USING GIN(content_data);

-- ============================================
-- PART 5: BEHAVIOR TRACKING (WITH PARTITIONING!)
-- ============================================

-- Table: user_behavior_log (مع partitioning للأداء)
CREATE TABLE IF NOT EXISTS user_behavior_log (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_id UUID,
  
  -- Action details
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL,
  
  -- Context
  page_url TEXT,
  referrer_url TEXT,
  device_info JSONB,
  
  -- Timing
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Performance
  response_time_ms INT,
  
  CONSTRAINT fk_behavior_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
) PARTITION BY RANGE (timestamp);

-- Create partitions for current and next 6 months
CREATE TABLE user_behavior_log_2025_10 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE user_behavior_log_2025_11 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE user_behavior_log_2025_12 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE user_behavior_log_2026_01 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE user_behavior_log_2026_02 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE user_behavior_log_2026_03 PARTITION OF user_behavior_log
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Indexes on partitioned table
CREATE INDEX idx_behavior_user ON user_behavior_log(user_id, timestamp DESC);
CREATE INDEX idx_behavior_action ON user_behavior_log(action_type);
CREATE INDEX idx_behavior_session ON user_behavior_log(session_id);
CREATE INDEX idx_behavior_action_data ON user_behavior_log USING GIN(action_data);

-- ============================================
-- PART 6: AUDIT LOGGING (Tamper-proof)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What happened
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Who did it
  user_id UUID,
  performed_by UUID, -- For admin actions
  
  -- Data snapshots
  old_data JSONB,
  new_data JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp (append-only!)
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Hash chaining for tamper detection
  previous_hash VARCHAR(64),
  current_hash VARCHAR(64)
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_operation ON audit_log(operation);

-- ============================================
-- PART 7: MATERIALIZED VIEWS (Performance!)
-- ============================================

-- Materialized View: User booking statistics
CREATE MATERIALIZED VIEW user_booking_stats AS
SELECT 
  user_id,
  COUNT(*) as booking_count,
  AVG((action_data->>'budget')::DECIMAL) as avg_budget,
  MAX(timestamp) as last_booking_at,
  MIN(timestamp) as first_booking_at,
  CASE 
    WHEN AVG((action_data->>'budget')::DECIMAL) < 80 THEN 'مسافر_اقتصادي'
    WHEN AVG((action_data->>'budget')::DECIMAL) < 150 THEN 'مسافر_متوسط'
    ELSE 'باحث_عن_فخامة'
  END as persona
FROM user_behavior_log
WHERE action_type = 'إكمال_حجز'
GROUP BY user_id;

CREATE UNIQUE INDEX idx_booking_stats_user ON user_booking_stats(user_id);

-- Materialized View: Hotel social proof
CREATE MATERIALIZED VIEW hotel_social_proof AS
SELECT 
  hotel_identifier,
  COUNT(*) as total_reviews,
  AVG(rating) as avg_rating,
  SUM(CASE WHEN would_rebook = TRUE THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) as rebook_rate,
  SUM(CASE WHEN expectation_exceeded = TRUE THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) as exceeded_rate,
  jsonb_object_agg(
    'rating_' || rating::TEXT,
    COUNT(*) FILTER (WHERE rating IS NOT NULL)
  ) as rating_distribution
FROM booking_outcomes
WHERE verified = TRUE
GROUP BY hotel_identifier;

CREATE UNIQUE INDEX idx_social_proof_hotel ON hotel_social_proof(hotel_identifier);

-- ============================================
-- PART 8: FUNCTIONS
-- ============================================

-- Function: Calculate traveler persona (OPTIMIZED!)
CREATE OR REPLACE FUNCTION calculate_traveler_persona(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT persona 
  FROM user_booking_stats 
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Function: Get social proof for hotel
CREATE OR REPLACE FUNCTION get_hotel_social_proof(
  p_hotel_identifier TEXT,
  p_persona_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  avg_rating DECIMAL,
  total_bookings INT,
  rebook_rate DECIMAL,
  exceeded_rate DECIMAL,
  trust_score DECIMAL
) AS $$
BEGIN
  IF p_persona_type IS NULL THEN
    -- All personas
    RETURN QUERY
    SELECT 
      hsp.avg_rating,
      hsp.total_reviews as total_bookings,
      hsp.rebook_rate,
      hsp.exceeded_rate,
      (hsp.avg_rating / 5.0 * 0.4 + hsp.rebook_rate * 0.3 + hsp.exceeded_rate * 0.3) as trust_score
    FROM hotel_social_proof hsp
    WHERE hsp.hotel_identifier = p_hotel_identifier;
  ELSE
    -- Filtered by persona
    RETURN QUERY
    SELECT 
      spc.avg_rating,
      spc.total_bookings,
      spc.rebooking_rate,
      spc.expectation_exceeded_rate,
      spc.trust_score
    FROM social_proof_cache spc
    WHERE spc.hotel_identifier = p_hotel_identifier
      AND spc.persona_type = p_persona_type;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Auto-create monthly partition
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS VOID AS $$
DECLARE
  partition_date DATE := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  partition_name TEXT := 'user_behavior_log_' || TO_CHAR(partition_date, 'YYYY_MM');
  partition_end DATE := partition_date + INTERVAL '1 month';
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I PARTITION OF user_behavior_log
    FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    partition_date,
    partition_end
  );
  
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function: Refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_booking_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hotel_social_proof;
  
  RAISE NOTICE 'Materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate viral coefficient (K-factor)
CREATE OR REPLACE FUNCTION calculate_k_factor(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  invites_sent INT;
  successful_conversions INT;
BEGIN
  -- Count referrals sent
  SELECT COUNT(*) INTO invites_sent
  FROM referrals
  WHERE referrer_user_id = p_user_id;
  
  -- Count successful conversions
  SELECT COUNT(*) INTO successful_conversions
  FROM referrals
  WHERE referrer_user_id = p_user_id
    AND status IN ('first_booking', 'active_user');
  
  -- K-factor = conversions / invites
  IF invites_sent > 0 THEN
    RETURN successful_conversions::DECIMAL / invites_sent;
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PART 9: TRIGGERS
-- ============================================

-- Trigger: Auto-update social proof cache
CREATE OR REPLACE FUNCTION refresh_social_proof_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update cache
  INSERT INTO social_proof_cache (
    hotel_identifier,
    persona_type,
    total_bookings,
    avg_rating,
    rebooking_rate,
    expectation_exceeded_rate,
    trust_score,
    last_updated
  )
  SELECT 
    NEW.hotel_identifier,
    tp.persona_type,
    COUNT(*),
    AVG(bo.rating),
    SUM(CASE WHEN bo.would_rebook = TRUE THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0),
    SUM(CASE WHEN bo.expectation_exceeded = TRUE THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0),
    (AVG(bo.rating) / 5.0 * 0.5 + 
     SUM(CASE WHEN bo.would_rebook = TRUE THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) * 0.5),
    NOW()
  FROM booking_outcomes bo
  JOIN traveler_personas tp ON bo.user_id = tp.user_id
  WHERE bo.hotel_identifier = NEW.hotel_identifier
    AND bo.verified = TRUE
  GROUP BY NEW.hotel_identifier, tp.persona_type
  ON CONFLICT (hotel_identifier, persona_type) 
  DO UPDATE SET
    total_bookings = EXCLUDED.total_bookings,
    avg_rating = EXCLUDED.avg_rating,
    rebooking_rate = EXCLUDED.rebooking_rate,
    expectation_exceeded_rate = EXCLUDED.expectation_exceeded_rate,
    trust_score = EXCLUDED.trust_score,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_proof_on_review
AFTER INSERT OR UPDATE OF rating, would_rebook, expectation_exceeded
ON booking_outcomes
FOR EACH ROW
WHEN (NEW.verified = TRUE)
EXECUTE FUNCTION refresh_social_proof_cache();

-- Trigger: Audit logging for critical tables
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_prev_hash VARCHAR(64);
  v_current_hash VARCHAR(64);
BEGIN
  -- Prepare data snapshots
  v_old_data := CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END;
  v_new_data := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END;
  
  -- Get last hash (for chain)
  SELECT current_hash INTO v_prev_hash
  FROM audit_log
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- Calculate current hash (SHA256 of timestamp + data + prev_hash)
  v_current_hash := encode(
    digest(
      COALESCE(v_prev_hash, '') || 
      NOW()::TEXT || 
      COALESCE(v_new_data::TEXT, v_old_data::TEXT, ''),
      'sha256'
    ),
    'hex'
  );
  
  -- Insert audit log
  INSERT INTO audit_log (
    table_name,
    operation,
    user_id,
    old_data,
    new_data,
    previous_hash,
    current_hash
  )
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.user_id, OLD.user_id),
    v_old_data,
    v_new_data,
    v_prev_hash,
    v_current_hash
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_booking_outcomes
AFTER INSERT OR UPDATE OR DELETE ON booking_outcomes
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_crypto_payments
AFTER INSERT OR UPDATE OR DELETE ON crypto_payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================
-- PART 10: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all advanced tables
ALTER TABLE traveler_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users view own persona" 
  ON traveler_personas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own outcomes" 
  ON booking_outcomes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own outcomes" 
  ON booking_outcomes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view social proof" 
  ON social_proof_cache FOR SELECT 
  USING (TRUE); -- Public data

CREATE POLICY "Users view own predictions" 
  ON trip_predictions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own outcome predictions" 
  ON outcome_predictions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own referrals" 
  ON referrals FOR SELECT 
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users insert own referrals" 
  ON referrals FOR INSERT 
  WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users manage own shared content" 
  ON shared_content FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own behavior" 
  ON user_behavior_log FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin policies (can view all data for analytics)
CREATE POLICY "Admins view all personas" 
  ON traveler_personas FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role')::TEXT = 'admin'
    )
  );

CREATE POLICY "Admins view all outcomes" 
  ON booking_outcomes FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role')::TEXT = 'admin'
    )
  );

-- ============================================
-- PART 11: AUTOMATED JOBS (pg_cron in Supabase)
-- ============================================

-- Schedule: Refresh materialized views every hour
-- In Supabase Dashboard > Database > Cron Jobs:
-- SELECT cron.schedule('refresh-analytics', '0 * * * *', 'SELECT refresh_analytics_views()');

-- Schedule: Create next month's partition
-- SELECT cron.schedule('create-partition', '0 0 1 * *', 'SELECT create_monthly_partition()');

-- Schedule: Clean old behavior logs (keep 12 months)
-- SELECT cron.schedule('clean-old-logs', '0 2 * * 0', $$
--   DROP TABLE IF EXISTS user_behavior_log_old CASCADE;
-- $$);

-- ============================================
-- PART 12: VALIDATION CONSTRAINTS
-- ============================================

-- Add validation to existing trips table
ALTER TABLE trips 
  ADD CONSTRAINT check_trip_dates_valid 
  CHECK (end_date > start_date);

ALTER TABLE trips 
  ADD CONSTRAINT check_budget_positive 
  CHECK (budget > 0);

ALTER TABLE trips 
  ADD CONSTRAINT check_group_size_valid 
  CHECK (group_size > 0 AND group_size <= 50);

-- Add validation to expenses
ALTER TABLE expenses 
  ADD CONSTRAINT check_expense_amount_positive 
  CHECK (amount > 0);

-- Add validation to payments
ALTER TABLE payments 
  ADD CONSTRAINT check_payment_amount_positive 
  CHECK (amount > 0);

-- ============================================
-- PART 13: HELPER FUNCTIONS
-- ============================================

-- Function: Verify audit log integrity
CREATE OR REPLACE FUNCTION verify_audit_log_integrity()
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
  v_expected_hash VARCHAR(64);
  v_is_valid BOOLEAN := TRUE;
BEGIN
  FOR v_record IN 
    SELECT id, previous_hash, current_hash, timestamp, new_data, old_data
    FROM audit_log 
    ORDER BY timestamp ASC
  LOOP
    -- Calculate expected hash
    v_expected_hash := encode(
      digest(
        COALESCE(v_record.previous_hash, '') || 
        v_record.timestamp::TEXT || 
        COALESCE(v_record.new_data::TEXT, v_record.old_data::TEXT, ''),
        'sha256'
      ),
      'hex'
    );
    
    -- Check if matches
    IF v_expected_hash != v_record.current_hash THEN
      RAISE WARNING 'Hash mismatch at audit log ID: %', v_record.id;
      v_is_valid := FALSE;
    END IF;
  END LOOP;
  
  RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user analytics dashboard
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'persona', calculate_traveler_persona(p_user_id),
    'total_trips', COUNT(DISTINCT t.id),
    'total_spent', SUM(t.budget),
    'avg_trip_duration', AVG(t.end_date - t.start_date),
    'favorite_destinations', (
      SELECT jsonb_agg(destination)
      FROM (
        SELECT destination, COUNT(*) as cnt
        FROM trips
        WHERE user_id = p_user_id
        GROUP BY destination
        ORDER BY cnt DESC
        LIMIT 3
      ) favs
    ),
    'k_factor', calculate_k_factor(p_user_id),
    'referral_count', (
      SELECT COUNT(*) FROM referrals WHERE referrer_user_id = p_user_id
    ),
    'avg_satisfaction', (
      SELECT AVG(rating) FROM booking_outcomes WHERE user_id = p_user_id
    )
  ) INTO v_result
  FROM trips t
  WHERE t.user_id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PART 14: COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE traveler_personas IS 'تصنيف المسافرين حسب أنماطهم وتفضيلاتهم';
COMMENT ON TABLE booking_outcomes IS 'نتائج الحجوزات الفعلية مع تقييمات المستخدمين';
COMMENT ON TABLE social_proof_cache IS 'ذاكرة مؤقتة للـ social proof - يتم تحديثها تلقائياً';
COMMENT ON TABLE trip_predictions IS 'تنبؤات AI بالرحلات المستقبلية للمستخدمين';
COMMENT ON TABLE outcome_predictions IS 'تنبؤات بمستوى الرضا قبل الحجز';
COMMENT ON TABLE referrals IS 'نظام الإحالات والنمو الفيروسي';
COMMENT ON TABLE shared_content IS 'تتبع المحتوى المشارك والـ viral metrics';
COMMENT ON TABLE user_behavior_log IS 'سجل سلوك المستخدمين - partitioned by month';
COMMENT ON TABLE audit_log IS 'سجل تدقيق tamper-proof بـ hash chaining';

COMMENT ON MATERIALIZED VIEW user_booking_stats IS 'إحصائيات حجوزات المستخدمين - refresh hourly';
COMMENT ON MATERIALIZED VIEW hotel_social_proof IS 'Social proof للفنادق - refresh hourly';

COMMENT ON FUNCTION calculate_traveler_persona IS 'حساب نمط المسافر من تاريخ الحجوزات';
COMMENT ON FUNCTION get_hotel_social_proof IS 'الحصول على social proof لفندق معين';
COMMENT ON FUNCTION refresh_analytics_views IS 'تحديث materialized views';
COMMENT ON FUNCTION verify_audit_log_integrity IS 'التحقق من سلامة audit log';

-- ============================================
-- ✅ Schema Complete!
-- ============================================

-- Next steps:
-- 1. Run this schema in Supabase SQL Editor
-- 2. Schedule cron jobs for automated maintenance
-- 3. Set up monitoring for query performance
-- 4. Configure backup retention (7+ days)
-- 5. Enable Point-in-Time Recovery (PITR)

-- Performance tips:
-- - Materialized views refresh hourly (reduce load)
-- - Partitioned behavior log (fast queries)
-- - GIN indexes on JSONB (fast JSON queries)
-- - RLS enabled (security by default)
-- - Audit log with hash chaining (compliance ready)

