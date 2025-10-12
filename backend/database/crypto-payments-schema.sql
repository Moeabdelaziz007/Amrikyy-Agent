-- ============================================
-- 💎 Crypto Payment System Database Schema
-- نظام الدفع بالعملات المشفرة - Crypto-First Platform
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. جدول المدفوعات بالعملات المشفرة
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_payments (
  id VARCHAR(50) PRIMARY KEY, -- AMK-XXXXXXXX format
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- معلومات العملة
  cryptocurrency VARCHAR(10) NOT NULL, -- BTC, ETH, USDT, etc.
  amount_usd DECIMAL(12,2) NOT NULL,
  amount_crypto DECIMAL(20,8) NOT NULL,
  exchange_rate DECIMAL(12,2) NOT NULL,
  
  -- عنوان الدفع
  payment_address VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL, -- bitcoin, ethereum, bsc, polygon
  
  -- حالة المعاملة
  status VARCHAR(20) NOT NULL CHECK (status IN (
    'pending',      -- في انتظار الدفع
    'confirming',   -- تم الاستلام، جاري التأكيد
    'confirmed',    -- تم التأكيد
    'expired',      -- انتهت المدة
    'failed',       -- فشلت
    'refunded'      -- تم الاسترداد
  )),
  
  -- تفاصيل المعاملة
  transaction_hash VARCHAR(255),
  confirmations INT DEFAULT 0,
  required_confirmations INT NOT NULL,
  
  -- التوقيتات
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  confirmed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- بيانات إضافية (JSON)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- معرف الاسترداد (إن وجد)
  refund_id UUID,
  
  -- فهارس
  CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_booking ON crypto_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_crypto ON crypto_payments(cryptocurrency);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_txhash ON crypto_payments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_created ON crypto_payments(created_at DESC);

-- ============================================
-- 2. جدول الاستردادات
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id VARCHAR(50) NOT NULL,
  
  -- معلومات الاسترداد
  cryptocurrency VARCHAR(10) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  
  -- السبب
  reason TEXT,
  
  -- الحالة
  status VARCHAR(20) NOT NULL CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed'
  )),
  
  -- تفاصيل المعاملة
  refund_transaction_hash VARCHAR(255),
  
  -- التوقيتات
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- بيانات إضافية
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES crypto_payments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crypto_refunds_invoice ON crypto_refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_crypto_refunds_status ON crypto_refunds(status);

-- ============================================
-- 3. جدول محافظ المستخدمين
-- ============================================
CREATE TABLE IF NOT EXISTS user_crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- معلومات المحفظة
  wallet_address VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL,
  wallet_type VARCHAR(50), -- metamask, trust_wallet, etc.
  
  -- تفضيلات
  is_primary BOOLEAN DEFAULT FALSE,
  label VARCHAR(100), -- My MetaMask Wallet, etc.
  
  -- التوقيتات
  added_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  
  -- التحقق
  verified BOOLEAN DEFAULT FALSE,
  verification_signature TEXT,
  
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, wallet_address, network)
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user ON user_crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_crypto_wallets(wallet_address);

-- ============================================
-- 4. جدول أسعار العملات (Cache)
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_prices (
  cryptocurrency VARCHAR(10) PRIMARY KEY,
  price_usd DECIMAL(12,2) NOT NULL,
  change_24h DECIMAL(5,2),
  volume_24h DECIMAL(15,2),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج أسعار أولية
INSERT INTO crypto_prices (cryptocurrency, price_usd, change_24h) VALUES
  ('BTC', 43000.00, 2.5),
  ('ETH', 2300.00, 1.8),
  ('USDT', 1.00, 0.0),
  ('USDC', 1.00, 0.0),
  ('BNB', 310.00, 3.2),
  ('MATIC', 0.85, -1.5)
ON CONFLICT (cryptocurrency) DO NOTHING;

-- ============================================
-- 5. جدول معاملات Smart Contract
-- ============================================
CREATE TABLE IF NOT EXISTS smart_contract_escrows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id VARCHAR(50) NOT NULL,
  
  -- معلومات العقد
  contract_address VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL,
  
  -- تفاصيل الـ Escrow
  buyer_address VARCHAR(255) NOT NULL,
  seller_address VARCHAR(255) NOT NULL,
  arbiter_address VARCHAR(255), -- للنزاعات
  
  amount DECIMAL(20,8) NOT NULL,
  cryptocurrency VARCHAR(10) NOT NULL,
  
  -- الحالة
  status VARCHAR(20) NOT NULL CHECK (status IN (
    'created',
    'funded',
    'released',
    'refunded',
    'disputed'
  )),
  
  -- معاملات Blockchain
  creation_tx_hash VARCHAR(255),
  release_tx_hash VARCHAR(255),
  
  -- التوقيتات
  created_at TIMESTAMP DEFAULT NOW(),
  funded_at TIMESTAMP,
  released_at TIMESTAMP,
  
  -- شروط الإفراج
  release_conditions JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT fk_escrow_invoice FOREIGN KEY (invoice_id) REFERENCES crypto_payments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_escrows_invoice ON smart_contract_escrows(invoice_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON smart_contract_escrows(status);

-- ============================================
-- 6. طرق العرض (Views)
-- ============================================

-- عرض: ملخص المدفوعات اليومية
CREATE OR REPLACE VIEW daily_crypto_payments AS
SELECT 
  DATE(created_at) as payment_date,
  cryptocurrency,
  COUNT(*) as total_payments,
  SUM(amount_usd) as total_volume_usd,
  SUM(amount_crypto) as total_volume_crypto,
  AVG(confirmations) as avg_confirmations,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
FROM crypto_payments
GROUP BY DATE(created_at), cryptocurrency
ORDER BY payment_date DESC, total_volume_usd DESC;

-- عرض: محافظ المستخدمين النشطة
CREATE OR REPLACE VIEW active_user_wallets AS
SELECT 
  u.id as user_id,
  u.email,
  w.wallet_address,
  w.network,
  w.wallet_type,
  w.is_primary,
  w.verified,
  COUNT(cp.id) as total_payments,
  SUM(cp.amount_usd) as total_spent_usd
FROM users u
JOIN user_crypto_wallets w ON u.id = w.user_id
LEFT JOIN crypto_payments cp ON u.id = cp.user_id
GROUP BY u.id, u.email, w.wallet_address, w.network, w.wallet_type, w.is_primary, w.verified
ORDER BY total_spent_usd DESC NULLS LAST;

-- ============================================
-- 7. الدوال (Functions)
-- ============================================

-- دالة: تحديث حالة المدفوعات المنتهية
CREATE OR REPLACE FUNCTION expire_pending_payments()
RETURNS INT AS $$
DECLARE
  expired_count INT;
BEGIN
  UPDATE crypto_payments
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- دالة: حساب إجمالي حجم المعاملات لمستخدم
CREATE OR REPLACE FUNCTION user_crypto_volume(p_user_id UUID)
RETURNS TABLE(
  total_payments BIGINT,
  total_volume_usd DECIMAL,
  favorite_crypto VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    SUM(amount_usd),
    MODE() WITHIN GROUP (ORDER BY cryptocurrency)
  FROM crypto_payments
  WHERE user_id = p_user_id
    AND status = 'confirmed';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. المحفزات (Triggers)
-- ============================================

-- محفز: تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crypto_payments_modtime
BEFORE UPDATE ON crypto_payments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- محفز: تسجيل معاملة مؤكدة في السجل
CREATE OR REPLACE FUNCTION log_confirmed_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- يمكن إضافة لوجيك إضافي هنا
    -- مثل إرسال إشعار أو تحديث جداول أخرى
    RAISE NOTICE 'Payment confirmed: % - % %', NEW.id, NEW.amount_crypto, NEW.cryptocurrency;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_confirmed
AFTER UPDATE ON crypto_payments
FOR EACH ROW
WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
EXECUTE FUNCTION log_confirmed_payment();

-- ============================================
-- 9. وظيفة صيانة دورية (Cron Job)
-- ============================================

-- يمكن جدولة هذه الدالة للتشغيل كل 5 دقائق
-- لتحديث حالة المدفوعات المنتهية
CREATE OR REPLACE FUNCTION maintain_crypto_payments()
RETURNS TABLE(
  expired_payments INT,
  updated_prices INT
) AS $$
DECLARE
  v_expired INT;
  v_updated INT := 0;
BEGIN
  -- تحديث المدفوعات المنتهية
  SELECT expire_pending_payments() INTO v_expired;
  
  -- يمكن إضافة تحديث أسعار تلقائي هنا
  
  RETURN QUERY SELECT v_expired, v_updated;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. بيانات أولية للاختبار (Optional)
-- ============================================

-- إضافة محفظة تجريبية (للتطوير فقط)
-- يجب حذفها في الإنتاج
/*
INSERT INTO crypto_payments (
  id, booking_id, user_id, cryptocurrency, amount_usd, amount_crypto,
  exchange_rate, payment_address, network, status, required_confirmations,
  expires_at
) VALUES (
  'AMK-TEST001',
  uuid_generate_v4(),
  uuid_generate_v4(),
  'USDT',
  100.00,
  100.00,
  1.00,
  '0xTestWalletAddress',
  'ethereum',
  'pending',
  12,
  NOW() + INTERVAL '30 minutes'
);
*/

-- ============================================
-- تم الانتهاء من مخطط Crypto Payments
-- ============================================

-- ملاحظات مهمة:
-- 1. تأكد من تشغيل هذا بعد schema.sql الأساسي
-- 2. قم بتكوين RLS policies للأمان
-- 3. راقب المدفوعات المنتهية بانتظام
-- 4. احتفظ بنسخ احتياطية من transaction_hashes
-- 5. استخدم محافظ Cold Storage للأموال الكبيرة

COMMENT ON TABLE crypto_payments IS 'جدول المدفوعات بالعملات المشفرة - يدعم Bitcoin, Ethereum, USDT, BNB, MATIC';
COMMENT ON TABLE crypto_refunds IS 'جدول استردادات المدفوعات المشفرة';
COMMENT ON TABLE user_crypto_wallets IS 'محافظ العملات المشفرة للمستخدمين';
COMMENT ON TABLE crypto_prices IS 'ذاكرة مؤقتة لأسعار العملات المشفرة';
COMMENT ON TABLE smart_contract_escrows IS 'عقود Escrow الذكية على Blockchain';

