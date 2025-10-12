-- ============================================
-- 📊 Transaction Monitoring Tables - Phase 3
-- نظام مراقبة المعاملات في الوقت الحقيقي
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. جدول مراقبة المعاملات
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(50), -- References crypto_payments(id)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Checks Performed
  checks JSONB DEFAULT '[]'::jsonb,
  
  -- Alert Summary
  alert_count INT DEFAULT 0,
  highest_severity TEXT CHECK (highest_severity IN ('low', 'medium', 'high', 'critical', null)),
  
  -- Status
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_transaction ON transaction_monitoring(transaction_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_user ON transaction_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_severity ON transaction_monitoring(highest_severity) WHERE highest_severity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_monitoring_created ON transaction_monitoring(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_reviewed ON transaction_monitoring(reviewed) WHERE reviewed = false;

-- ============================================
-- 2. جدول تنبيهات المعاملات
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(50),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Alert Details
  alert_type TEXT NOT NULL, -- 'sanctions', 'velocity', 'amount_pattern', 'geolocation', 'wallet_reputation'
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP,
  
  -- Action Taken
  action_taken TEXT, -- 'blocked', 'reviewed', 'escalated', 'cleared'
  action_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_transaction ON transaction_alerts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON transaction_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON transaction_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON transaction_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON transaction_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON transaction_alerts(acknowledged) WHERE acknowledged = false;

-- ============================================
-- 3. جدول قوائم العقوبات المحلية
-- ============================================
CREATE TABLE IF NOT EXISTS sanctions_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity Details
  entity_type TEXT CHECK (entity_type IN ('wallet', 'user', 'ip', 'email', 'domain')) NOT NULL,
  entity_value TEXT NOT NULL, -- الحقل الفعلي (wallet address, email, etc.)
  
  -- Sanctions Info
  list_name TEXT, -- 'OFAC', 'EU', 'UN', 'Internal'
  reason TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  
  -- Status
  active BOOLEAN DEFAULT true,
  added_by UUID,
  removed_by UUID,
  
  -- Timestamps
  added_at TIMESTAMP DEFAULT NOW(),
  removed_at TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sanctions_entity ON sanctions_list(entity_type, entity_value) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_sanctions_type ON sanctions_list(entity_type);
CREATE INDEX IF NOT EXISTS idx_sanctions_active ON sanctions_list(active) WHERE active = true;

-- ============================================
-- 4. جدول سجل الاتصالات بـ Chainalysis
-- ============================================
CREATE TABLE IF NOT EXISTS chainalysis_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Details
  request_type TEXT, -- 'sanctions_check', 'wallet_analysis', 'transaction_trace'
  wallet_address TEXT,
  
  -- Response
  response_data JSONB DEFAULT '{}'::jsonb,
  sanctioned BOOLEAN,
  risk_level TEXT,
  
  -- Metadata
  api_latency_ms INT,
  status_code INT,
  error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chainalysis_wallet ON chainalysis_log(wallet_address);
CREATE INDEX IF NOT EXISTS idx_chainalysis_type ON chainalysis_log(request_type);
CREATE INDEX IF NOT EXISTS idx_chainalysis_sanctioned ON chainalysis_log(sanctioned) WHERE sanctioned = true;
CREATE INDEX IF NOT EXISTS idx_chainalysis_created ON chainalysis_log(created_at DESC);

-- ============================================
-- 5. Views للتحليلات السريعة
-- ============================================

-- View: Active Alerts Summary
CREATE OR REPLACE VIEW active_alerts_summary AS
SELECT 
  DATE(created_at) as date,
  severity,
  alert_type,
  COUNT(*) as alert_count,
  COUNT(CASE WHEN acknowledged = false THEN 1 END) as pending_count
FROM transaction_alerts
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), severity, alert_type
ORDER BY date DESC, severity DESC;

-- View: High Priority Alerts Queue
CREATE OR REPLACE VIEW high_priority_alerts AS
SELECT 
  a.id,
  a.transaction_id,
  a.user_id,
  u.email,
  a.alert_type,
  a.severity,
  a.message,
  a.created_at,
  EXTRACT(EPOCH FROM (NOW() - a.created_at))/3600 as hours_pending
FROM transaction_alerts a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.acknowledged = false 
  AND a.severity IN ('high', 'critical')
ORDER BY 
  CASE a.severity 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
  END,
  a.created_at ASC;

-- View: Monitoring Statistics
CREATE OR REPLACE VIEW monitoring_stats AS
SELECT 
  COUNT(*) as total_monitored,
  COUNT(CASE WHEN alert_count > 0 THEN 1 END) as transactions_with_alerts,
  COUNT(CASE WHEN highest_severity = 'critical' THEN 1 END) as critical_alerts,
  COUNT(CASE WHEN highest_severity = 'high' THEN 1 END) as high_alerts,
  COUNT(CASE WHEN highest_severity = 'medium' THEN 1 END) as medium_alerts,
  AVG(alert_count) as avg_alerts_per_transaction,
  COUNT(CASE WHEN reviewed = false AND alert_count > 0 THEN 1 END) as pending_review
FROM transaction_monitoring
WHERE created_at >= NOW() - INTERVAL '7 days';

-- View: Sanctioned Entities Active
CREATE OR REPLACE VIEW sanctioned_entities AS
SELECT 
  entity_type,
  entity_value,
  list_name,
  reason,
  severity,
  added_at,
  expires_at
FROM sanctions_list
WHERE active = true
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY severity DESC, added_at DESC;

-- ============================================
-- 6. Functions & Triggers
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monitoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER trigger_alerts_updated_at
  BEFORE UPDATE ON transaction_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_monitoring_updated_at();

-- Function: Check if entity is sanctioned
CREATE OR REPLACE FUNCTION is_entity_sanctioned(
  p_entity_type TEXT,
  p_entity_value TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM sanctions_list
    WHERE entity_type = p_entity_type
      AND entity_value = p_entity_value
      AND active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Function: Get alert statistics for user
CREATE OR REPLACE FUNCTION get_user_alert_stats(p_user_id UUID)
RETURNS TABLE(
  total_alerts INT,
  critical_count INT,
  high_count INT,
  medium_count INT,
  pending_count INT,
  last_alert_date TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INT as total_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END)::INT as critical_count,
    COUNT(CASE WHEN severity = 'high' THEN 1 END)::INT as high_count,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END)::INT as medium_count,
    COUNT(CASE WHEN acknowledged = false THEN 1 END)::INT as pending_count,
    MAX(created_at) as last_alert_date
  FROM transaction_alerts
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-expire old sanctions
CREATE OR REPLACE FUNCTION expire_old_sanctions()
RETURNS INT AS $$
DECLARE
  v_expired_count INT;
BEGIN
  UPDATE sanctions_list
  SET active = false,
      removed_at = NOW()
  WHERE active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Sample Data (Optional)
-- ============================================

-- Insert sample sanctioned wallet (for testing)
INSERT INTO sanctions_list (entity_type, entity_value, list_name, reason, severity) VALUES
  ('wallet', '0x0000000000000000000000000000000000000bad', 'Internal', 'Test sanctioned wallet', 'critical'),
  ('wallet', '0x1111111111111111111111111111111111111bad', 'OFAC', 'Known scam address', 'high')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. Scheduled Jobs (PostgreSQL Cron - Optional)
-- ============================================

-- If you have pg_cron extension, you can schedule auto-expiry:
-- SELECT cron.schedule('expire-sanctions', '0 2 * * *', 'SELECT expire_old_sanctions()');

-- ============================================
-- Migration Complete
-- ============================================

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON transaction_monitoring TO your_app_role;
-- GRANT SELECT, INSERT, UPDATE ON transaction_alerts TO your_app_role;
-- GRANT SELECT ON active_alerts_summary TO your_app_role;

-- Verify tables created
SELECT 'transaction_monitoring' as table_name, COUNT(*) as row_count FROM transaction_monitoring
UNION ALL
SELECT 'transaction_alerts', COUNT(*) FROM transaction_alerts
UNION ALL
SELECT 'sanctions_list', COUNT(*) FROM sanctions_list
UNION ALL
SELECT 'chainalysis_log', COUNT(*) FROM chainalysis_log;

-- Show monitoring stats
SELECT * FROM monitoring_stats;

