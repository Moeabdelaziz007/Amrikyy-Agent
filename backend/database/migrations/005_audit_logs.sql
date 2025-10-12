-- ============================================
-- Phase 4: Audit Logging System
-- File: 005_audit_logs.sql
-- Purpose: Complete audit trail for compliance
-- ============================================

-- ============================================
-- Main Audit Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'payment_created',
    'payment_updated',
    'payment_completed',
    'payment_failed',
    'payment_refunded',
    'kyc_started',
    'kyc_approved',
    'kyc_rejected',
    'risk_assessed',
    'risk_flagged',
    'alert_created',
    'alert_acknowledged',
    'admin_action',
    'user_action',
    'system_action'
  )),
  
  event_category TEXT NOT NULL CHECK (event_category IN (
    'payment',
    'kyc',
    'risk',
    'monitoring',
    'admin',
    'user',
    'system'
  )),
  
  -- References
  user_id UUID,
  transaction_id VARCHAR(50),
  booking_id VARCHAR(50),
  kyc_id UUID,
  risk_id UUID,
  alert_id UUID,
  
  -- Action Details
  action TEXT NOT NULL,
  action_by UUID, -- User or admin who performed action
  action_by_type TEXT CHECK (action_by_type IN ('user', 'admin', 'system')),
  
  -- Status
  status TEXT CHECK (status IN ('success', 'failed', 'pending', 'cancelled')),
  
  -- Data
  metadata JSONB DEFAULT '{}'::jsonb,
  changes JSONB DEFAULT '{}'::jsonb, -- Before/after for updates
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(50),
  session_id VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Retention
  retention_until TIMESTAMP DEFAULT (NOW() + INTERVAL '7 years'), -- Compliance: 7 years
  
  -- Audit Trail Integrity
  previous_log_hash VARCHAR(64), -- For tamper detection
  log_hash VARCHAR(64) -- SHA256 of this log entry
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_audit_user ON payment_audit_log(user_id);
CREATE INDEX idx_audit_transaction ON payment_audit_log(transaction_id);
CREATE INDEX idx_audit_booking ON payment_audit_log(booking_id);
CREATE INDEX idx_audit_event_type ON payment_audit_log(event_type);
CREATE INDEX idx_audit_category ON payment_audit_log(event_category);
CREATE INDEX idx_audit_created ON payment_audit_log(created_at DESC);
CREATE INDEX idx_audit_action_by ON payment_audit_log(action_by);
CREATE INDEX idx_audit_retention ON payment_audit_log(retention_until);
CREATE INDEX idx_audit_metadata ON payment_audit_log USING GIN (metadata);

-- ============================================
-- Audit Log Summary Table (for fast queries)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  event_category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date, event_category, event_type)
);

CREATE INDEX idx_summary_date ON audit_log_summary(date DESC);
CREATE INDEX idx_summary_category ON audit_log_summary(event_category);

-- ============================================
-- Functions
-- ============================================

-- Function: Generate log hash for integrity
CREATE OR REPLACE FUNCTION generate_log_hash(log_data TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(log_data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get user audit trail
CREATE OR REPLACE FUNCTION get_user_audit_trail(
  p_user_id UUID,
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  action TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pal.id,
    pal.event_type,
    pal.action,
    pal.status,
    pal.metadata,
    pal.created_at
  FROM payment_audit_log pal
  WHERE pal.user_id = p_user_id
  ORDER BY pal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get transaction audit trail
CREATE OR REPLACE FUNCTION get_transaction_audit_trail(
  p_transaction_id VARCHAR(50)
)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  action TEXT,
  status TEXT,
  action_by_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pal.id,
    pal.event_type,
    pal.action,
    pal.status,
    pal.action_by_type,
    pal.metadata,
    pal.created_at
  FROM payment_audit_log pal
  WHERE pal.transaction_id = p_transaction_id
  ORDER BY pal.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Update audit summary
CREATE OR REPLACE FUNCTION update_audit_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log_summary (
    date,
    event_category,
    event_type,
    count,
    success_count,
    failed_count,
    unique_users
  )
  VALUES (
    CURRENT_DATE,
    NEW.event_category,
    NEW.event_type,
    1,
    CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, event_category, event_type)
  DO UPDATE SET
    count = audit_log_summary.count + 1,
    success_count = audit_log_summary.success_count + 
      CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
    failed_count = audit_log_summary.failed_count + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update summary
CREATE TRIGGER trigger_update_audit_summary
  AFTER INSERT ON payment_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_summary();

-- ============================================
-- Views
-- ============================================

-- View: Recent audit activity (last 24 hours)
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
  event_category,
  event_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
  MAX(created_at) as last_occurrence
FROM payment_audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_category, event_type
ORDER BY count DESC;

-- View: Failed events for investigation
CREATE OR REPLACE VIEW failed_audit_events AS
SELECT 
  id,
  event_type,
  event_category,
  action,
  user_id,
  transaction_id,
  metadata,
  ip_address,
  created_at
FROM payment_audit_log
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- View: Admin actions audit
CREATE OR REPLACE VIEW admin_actions_audit AS
SELECT 
  pal.id,
  pal.event_type,
  pal.action,
  pal.action_by,
  pal.user_id as affected_user,
  pal.metadata,
  pal.ip_address,
  pal.created_at
FROM payment_audit_log pal
WHERE pal.action_by_type = 'admin'
ORDER BY pal.created_at DESC;

-- View: Compliance report (7-year retention)
CREATE OR REPLACE VIEW compliance_audit_report AS
SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  event_category,
  SUM(count) as total_events,
  SUM(success_count) as successful_events,
  SUM(failed_count) as failed_events,
  SUM(unique_users) as unique_users
FROM audit_log_summary
WHERE date >= NOW() - INTERVAL '7 years'
GROUP BY TO_CHAR(date, 'YYYY-MM'), event_category
ORDER BY month DESC, event_category;

-- ============================================
-- Maintenance Function: Clean expired logs
-- ============================================
CREATE OR REPLACE FUNCTION clean_expired_audit_logs()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  -- Delete logs past retention period
  DELETE FROM payment_audit_log
  WHERE retention_until < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup action
  INSERT INTO payment_audit_log (
    event_type,
    event_category,
    action,
    action_by_type,
    status,
    metadata
  ) VALUES (
    'system_action',
    'system',
    'audit_log_cleanup',
    'system',
    'success',
    jsonb_build_object('deleted_count', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Seed Data (Example Logs)
-- ============================================
INSERT INTO payment_audit_log (
  event_type,
  event_category,
  action,
  action_by_type,
  status,
  metadata
) VALUES 
(
  'system_action',
  'system',
  'audit_system_initialized',
  'system',
  'success',
  '{"version": "1.0", "timestamp": "2025-10-12"}'::jsonb
);

-- ============================================
-- Grant Permissions
-- ============================================
-- Grant read access to application role
-- GRANT SELECT ON payment_audit_log TO app_role;
-- GRANT SELECT ON audit_log_summary TO app_role;
-- GRANT SELECT ON recent_audit_activity TO app_role;
-- GRANT SELECT ON failed_audit_events TO app_role;
-- GRANT SELECT ON admin_actions_audit TO app_role;
-- GRANT SELECT ON compliance_audit_report TO app_role;

-- Grant execute on functions
-- GRANT EXECUTE ON FUNCTION get_user_audit_trail TO app_role;
-- GRANT EXECUTE ON FUNCTION get_transaction_audit_trail TO app_role;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE payment_audit_log IS 'Complete audit trail for all payment system actions (7-year retention for compliance)';
COMMENT ON TABLE audit_log_summary IS 'Daily aggregated audit statistics for fast reporting';
COMMENT ON FUNCTION get_user_audit_trail IS 'Retrieve complete audit trail for a specific user';
COMMENT ON FUNCTION get_transaction_audit_trail IS 'Retrieve complete audit trail for a specific transaction';
COMMENT ON FUNCTION clean_expired_audit_logs IS 'Remove audit logs past retention period (run daily via cron)';

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Audit Logging System initialized successfully!';
  RAISE NOTICE '   - payment_audit_log table created';
  RAISE NOTICE '   - audit_log_summary table created';
  RAISE NOTICE '   - 4 views created for reporting';
  RAISE NOTICE '   - 5 functions created for audit operations';
  RAISE NOTICE '   - Automatic summary updates enabled';
  RAISE NOTICE '   - 7-year retention policy configured';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '   1. Run: SELECT * FROM recent_audit_activity;';
  RAISE NOTICE '   2. Test: SELECT * FROM get_user_audit_trail(''user-id-here'');';
  RAISE NOTICE '   3. Export: See audit-service.js for CSV/JSON export';
END $$;

