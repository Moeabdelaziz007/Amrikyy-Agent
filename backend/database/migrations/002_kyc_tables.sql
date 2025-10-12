-- ============================================
-- 🔐 KYC Verification Tables - Phase 1
-- نظام التحقق من الهوية
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. جدول التحقق من الهوية (KYC Verifications)
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- KYC Level
  level TEXT CHECK (level IN ('none', 'basic', 'advanced', 'premium')) DEFAULT 'none',
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  
  -- Provider Details
  provider TEXT DEFAULT 'sumsub', -- 'sumsub', 'onfido', 'jumio', etc.
  provider_applicant_id TEXT UNIQUE,
  
  -- Verification Data (JSON from provider)
  verification_data JSONB DEFAULT '{}'::jsonb,
  
  -- Document Types Verified
  documents_verified TEXT[], -- ['passport', 'drivers_license', 'utility_bill']
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL, -- KYC expires after 1 year typically
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_provider_applicant ON kyc_verifications(provider_applicant_id);
CREATE INDEX IF NOT EXISTS idx_kyc_level ON kyc_verifications(level);
CREATE INDEX IF NOT EXISTS idx_kyc_expires ON kyc_verifications(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 2. جدول حدود المعاملات حسب KYC
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT UNIQUE NOT NULL CHECK (level IN ('none', 'basic', 'advanced', 'premium')),
  
  -- Daily Limits
  daily_limit_usd DECIMAL(12,2) NOT NULL,
  
  -- Monthly Limits
  monthly_limit_usd DECIMAL(12,2) NOT NULL,
  
  -- Transaction Limits
  max_transaction_usd DECIMAL(12,2) NOT NULL,
  
  -- Feature Access
  features JSONB DEFAULT '{
    "crypto_payments": true,
    "fiat_payments": true,
    "withdrawals": true,
    "international": false
  }'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default limits
INSERT INTO kyc_limits (level, daily_limit_usd, monthly_limit_usd, max_transaction_usd, features) VALUES
  ('none', 500, 2000, 500, '{"crypto_payments": true, "fiat_payments": false, "withdrawals": false, "international": false}'::jsonb),
  ('basic', 10000, 50000, 10000, '{"crypto_payments": true, "fiat_payments": true, "withdrawals": true, "international": false}'::jsonb),
  ('advanced', 50000, 200000, 50000, '{"crypto_payments": true, "fiat_payments": true, "withdrawals": true, "international": true}'::jsonb),
  ('premium', 999999, 9999999, 999999, '{"crypto_payments": true, "fiat_payments": true, "withdrawals": true, "international": true}'::jsonb)
ON CONFLICT (level) DO UPDATE SET
  daily_limit_usd = EXCLUDED.daily_limit_usd,
  monthly_limit_usd = EXCLUDED.monthly_limit_usd,
  max_transaction_usd = EXCLUDED.max_transaction_usd,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================
-- 3. جدول سجل التحقق (Audit Log)
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_id UUID REFERENCES kyc_verifications(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'created', 'updated', 'approved', 'rejected', 'expired'
  old_status TEXT,
  new_status TEXT,
  
  -- Actor
  triggered_by TEXT, -- 'system', 'admin', 'webhook'
  admin_id UUID, -- If manual action
  
  -- Details
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_audit_kyc ON kyc_audit_log(kyc_id);
CREATE INDEX IF NOT EXISTS idx_kyc_audit_created ON kyc_audit_log(created_at DESC);

-- ============================================
-- 4. Views للاستعلامات السريعة
-- ============================================

-- View: Users with KYC Status
CREATE OR REPLACE VIEW users_kyc_status AS
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  COALESCE(k.level, 'none') as kyc_level,
  COALESCE(k.status, 'none') as kyc_status,
  k.provider,
  k.approved_at,
  k.expires_at,
  CASE 
    WHEN k.expires_at IS NOT NULL AND k.expires_at < NOW() THEN true
    ELSE false
  END as is_expired,
  l.daily_limit_usd,
  l.monthly_limit_usd,
  l.max_transaction_usd
FROM users u
LEFT JOIN kyc_verifications k ON u.id = k.user_id
LEFT JOIN kyc_limits l ON COALESCE(k.level, 'none') = l.level
ORDER BY u.created_at DESC;

-- View: KYC Statistics
CREATE OR REPLACE VIEW kyc_stats AS
SELECT 
  COUNT(*) as total_verifications,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN level = 'basic' THEN 1 END) as basic_count,
  COUNT(CASE WHEN level = 'advanced' THEN 1 END) as advanced_count,
  COUNT(CASE WHEN level = 'premium' THEN 1 END) as premium_count,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_count
FROM kyc_verifications;

-- View: Pending KYC Approvals
CREATE OR REPLACE VIEW pending_kyc_approvals AS
SELECT 
  k.id,
  k.user_id,
  u.email,
  k.level,
  k.provider,
  k.provider_applicant_id,
  k.created_at,
  EXTRACT(EPOCH FROM (NOW() - k.created_at))/3600 as hours_pending
FROM kyc_verifications k
LEFT JOIN users u ON k.user_id = u.id
WHERE k.status = 'pending'
ORDER BY k.created_at ASC;

-- ============================================
-- 5. Functions & Triggers
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER trigger_kyc_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_updated_at();

-- Function: Log KYC status changes
CREATE OR REPLACE FUNCTION log_kyc_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO kyc_audit_log (
      kyc_id, 
      event_type, 
      old_status, 
      new_status, 
      triggered_by,
      details
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      'system',
      jsonb_build_object(
        'previous_level', OLD.level,
        'new_level', NEW.level,
        'provider', NEW.provider
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Log status changes
CREATE TRIGGER trigger_log_kyc_changes
  AFTER UPDATE ON kyc_verifications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_kyc_status_change();

-- Function: Check if user can transact
CREATE OR REPLACE FUNCTION can_user_transact(
  p_user_id UUID,
  p_amount_usd DECIMAL
)
RETURNS TABLE(
  allowed BOOLEAN,
  reason TEXT,
  current_limit DECIMAL,
  kyc_level TEXT
) AS $$
DECLARE
  v_kyc_level TEXT;
  v_kyc_status TEXT;
  v_limit DECIMAL;
  v_expires_at TIMESTAMP;
BEGIN
  -- Get user's KYC info
  SELECT 
    COALESCE(k.level, 'none'),
    COALESCE(k.status, 'none'),
    k.expires_at
  INTO v_kyc_level, v_kyc_status, v_expires_at
  FROM users u
  LEFT JOIN kyc_verifications k ON u.id = k.user_id
  WHERE u.id = p_user_id;

  -- Get limit for level
  SELECT max_transaction_usd INTO v_limit
  FROM kyc_limits
  WHERE level = v_kyc_level;

  -- Check if KYC expired
  IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'KYC expired'::TEXT, v_limit, v_kyc_level;
    RETURN;
  END IF;

  -- Check if KYC approved
  IF v_kyc_status != 'approved' AND p_amount_usd > 500 THEN
    RETURN QUERY SELECT false, 'KYC verification required'::TEXT, v_limit, v_kyc_level;
    RETURN;
  END IF;

  -- Check amount against limit
  IF p_amount_usd > v_limit THEN
    RETURN QUERY SELECT false, format('Amount exceeds limit ($%s)', v_limit)::TEXT, v_limit, v_kyc_level;
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT true, 'OK'::TEXT, v_limit, v_kyc_level;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Sample Data for Testing (Optional)
-- ============================================

-- Uncomment to insert test data
/*
-- Insert sample KYC verification
INSERT INTO kyc_verifications (
  user_id,
  level,
  status,
  provider,
  provider_applicant_id
) VALUES (
  'test-user-id',
  'basic',
  'approved',
  'sumsub',
  'test-applicant-001'
);
*/

-- ============================================
-- Migration Complete
-- ============================================

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON kyc_verifications TO your_app_role;
-- GRANT SELECT ON users_kyc_status TO your_app_role;
-- GRANT SELECT ON kyc_stats TO your_app_role;

-- Verify tables created
SELECT 'kyc_verifications' as table_name, COUNT(*) as row_count FROM kyc_verifications
UNION ALL
SELECT 'kyc_limits', COUNT(*) FROM kyc_limits
UNION ALL
SELECT 'kyc_audit_log', COUNT(*) FROM kyc_audit_log;

-- Show KYC limits
SELECT * FROM kyc_limits ORDER BY daily_limit_usd ASC;

