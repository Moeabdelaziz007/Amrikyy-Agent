-- ============================================
-- 🎯 Risk Assessment Tables - Phase 2
-- نظام تقييم المخاطر المتقدم
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. جدول تقييمات المخاطر
-- ============================================
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(50), -- References crypto_payments(id)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Risk Score & Level
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100) NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  
  -- Action Taken
  action TEXT CHECK (action IN ('auto_approve', 'manual_review', 'reject')) NOT NULL,
  
  -- Risk Signals (JSON)
  risk_signals JSONB DEFAULT '{
    "amount": 0,
    "velocity": 0,
    "location": 0,
    "behavior": 0,
    "wallet": 0
  }'::jsonb,
  
  -- Review Status (for manual review cases)
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  
  -- ML Model Info (for future ML integration)
  model_version TEXT,
  model_confidence DECIMAL(5,4),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_transaction ON risk_assessments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_risk_user ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_score ON risk_assessments(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_action ON risk_assessments(action);
CREATE INDEX IF NOT EXISTS idx_risk_created ON risk_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_review ON risk_assessments(reviewed) WHERE action = 'manual_review';

-- ============================================
-- 2. جدول قواعد المخاطر المخصصة
-- ============================================
CREATE TABLE IF NOT EXISTS risk_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Rule Type
  rule_type TEXT CHECK (rule_type IN ('amount', 'velocity', 'location', 'behavior', 'wallet', 'custom')) NOT NULL,
  
  -- Rule Condition (JSON)
  condition JSONB NOT NULL,
  -- Example: {"field": "amount", "operator": ">", "value": 10000}
  
  -- Rule Action
  action TEXT CHECK (action IN ('increase_score', 'flag_review', 'auto_reject')) NOT NULL,
  score_modifier INT DEFAULT 0, -- How much to add/subtract from score
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  priority INT DEFAULT 0, -- Higher priority rules execute first
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_rules_enabled ON risk_rules(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_rules_type ON risk_rules(rule_type);

-- ============================================
-- 3. جدول سجل القرارات (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS risk_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,
  
  -- Decision Details
  decision TEXT NOT NULL, -- 'approved', 'rejected', 'escalated'
  decision_by UUID REFERENCES users(id),
  decision_reason TEXT,
  
  -- Previous State
  previous_action TEXT,
  new_action TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_assessment ON risk_decisions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON risk_decisions(created_at DESC);

-- ============================================
-- 4. Views للتحليلات السريعة
-- ============================================

-- View: High Risk Transactions Summary
CREATE OR REPLACE VIEW high_risk_transactions AS
SELECT 
  ra.id,
  ra.transaction_id,
  ra.user_id,
  u.email as user_email,
  ra.risk_score,
  ra.risk_level,
  ra.action,
  ra.reviewed,
  ra.created_at,
  cp.amount_usd,
  cp.cryptocurrency,
  cp.status as payment_status
FROM risk_assessments ra
LEFT JOIN users u ON ra.user_id = u.id
LEFT JOIN crypto_payments cp ON ra.transaction_id = cp.id
WHERE ra.risk_level IN ('high', 'critical')
ORDER BY ra.created_at DESC;

-- View: Manual Review Queue
CREATE OR REPLACE VIEW manual_review_queue AS
SELECT 
  ra.id as assessment_id,
  ra.transaction_id,
  ra.user_id,
  u.email as user_email,
  ra.risk_score,
  ra.risk_signals,
  ra.created_at,
  cp.amount_usd,
  cp.cryptocurrency,
  cp.payment_address,
  EXTRACT(EPOCH FROM (NOW() - ra.created_at))/3600 as hours_pending
FROM risk_assessments ra
LEFT JOIN users u ON ra.user_id = u.id
LEFT JOIN crypto_payments cp ON ra.transaction_id = cp.id
WHERE ra.action = 'manual_review' 
  AND ra.reviewed = false
ORDER BY ra.risk_score DESC, ra.created_at ASC;

-- View: Daily Risk Statistics
CREATE OR REPLACE VIEW daily_risk_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_assessments,
  AVG(risk_score) as avg_risk_score,
  COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count,
  COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_count,
  COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
  COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_risk_count,
  COUNT(CASE WHEN action = 'auto_approve' THEN 1 END) as auto_approved,
  COUNT(CASE WHEN action = 'manual_review' THEN 1 END) as manual_reviews,
  COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejected
FROM risk_assessments
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- 5. Functions & Triggers
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_risk_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER trigger_risk_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_updated_at();

-- Function: Calculate user risk profile
CREATE OR REPLACE FUNCTION calculate_user_risk_profile(p_user_id UUID)
RETURNS TABLE(
  avg_risk_score DECIMAL,
  total_assessments INT,
  high_risk_count INT,
  last_assessment_date TIMESTAMP,
  risk_trend TEXT
) AS $$
DECLARE
  v_recent_avg DECIMAL;
  v_older_avg DECIMAL;
BEGIN
  -- Get average risk score
  SELECT AVG(risk_score), COUNT(*), COUNT(CASE WHEN risk_level IN ('high','critical') THEN 1 END), MAX(created_at)
  INTO avg_risk_score, total_assessments, high_risk_count, last_assessment_date
  FROM risk_assessments
  WHERE user_id = p_user_id;
  
  -- Calculate trend (last 5 vs previous 5)
  SELECT AVG(risk_score) INTO v_recent_avg
  FROM (
    SELECT risk_score FROM risk_assessments
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 5
  ) recent;
  
  SELECT AVG(risk_score) INTO v_older_avg
  FROM (
    SELECT risk_score FROM risk_assessments
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    OFFSET 5 LIMIT 5
  ) older;
  
  IF v_recent_avg > v_older_avg + 10 THEN
    risk_trend := 'increasing';
  ELSIF v_recent_avg < v_older_avg - 10 THEN
    risk_trend := 'decreasing';
  ELSE
    risk_trend := 'stable';
  END IF;
  
  RETURN QUERY SELECT avg_risk_score, total_assessments, high_risk_count, last_assessment_date, risk_trend;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Sample Risk Rules (Optional)
-- ============================================

-- Rule 1: Large transactions from new users
INSERT INTO risk_rules (name, description, rule_type, condition, action, score_modifier, enabled, priority)
VALUES (
  'Large Transaction - New User',
  'Flag transactions over $5000 from users less than 7 days old',
  'custom',
  '{"amount": {"gt": 5000}, "user_age_days": {"lt": 7}}'::jsonb,
  'increase_score',
  30,
  true,
  100
) ON CONFLICT DO NOTHING;

-- Rule 2: High velocity
INSERT INTO risk_rules (name, description, rule_type, condition, action, score_modifier, enabled, priority)
VALUES (
  'High Transaction Velocity',
  'Flag users with more than 5 transactions in 24 hours',
  'velocity',
  '{"tx_count_24h": {"gt": 5}}'::jsonb,
  'flag_review',
  20,
  true,
  90
) ON CONFLICT DO NOTHING;

-- Rule 3: High-risk countries
INSERT INTO risk_rules (name, description, rule_type, condition, action, score_modifier, enabled, priority)
VALUES (
  'High-Risk Country',
  'Auto-reject transactions from sanctioned countries',
  'location',
  '{"country": {"in": ["KP", "IR", "SY", "CU"]}}'::jsonb,
  'auto_reject',
  100,
  true,
  200
) ON CONFLICT DO NOTHING;

-- ============================================
-- 7. Sample Data for Testing (Optional)
-- ============================================

-- Uncomment to insert test data
/*
-- Insert sample risk assessment
INSERT INTO risk_assessments (
  transaction_id,
  user_id,
  risk_score,
  risk_level,
  action,
  risk_signals
) VALUES (
  'test-tx-001',
  'test-user-id',
  45,
  'medium',
  'auto_approve',
  '{"amount": 30, "velocity": 20, "location": 0, "behavior": 50, "wallet": 20}'::jsonb
);
*/

-- ============================================
-- Migration Complete
-- ============================================

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON risk_assessments TO your_app_role;
-- GRANT SELECT ON high_risk_transactions TO your_app_role;
-- GRANT SELECT ON manual_review_queue TO your_app_role;

-- Verify tables created
SELECT 'risk_assessments' as table_name, COUNT(*) as row_count FROM risk_assessments
UNION ALL
SELECT 'risk_rules', COUNT(*) FROM risk_rules
UNION ALL
SELECT 'risk_decisions', COUNT(*) FROM risk_decisions;

