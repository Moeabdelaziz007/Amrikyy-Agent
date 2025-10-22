-- Price Alerts Database Schema for Automated Scout Agent
-- Extends existing enhanced database schema

-- Price Alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Alert configuration
  route_code TEXT NOT NULL, -- e.g., "CAI-DXB", "IST-KUL"
  alert_type TEXT NOT NULL DEFAULT 'decrease' CHECK (alert_type IN ('decrease', 'target_price', 'any_change')),
  threshold_price DECIMAL(10,2) NOT NULL, -- Price threshold for triggering alert

  -- Search parameters (JSONB for flexible storage)
  flight_params JSONB NOT NULL, -- Stores origin, destination, dates, etc.

  -- Alert status
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_price DECIMAL(10,2),
  alert_triggered BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, route_code, alert_type)
);

-- Price History table (tracks price changes over time)
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.price_alerts(id) ON DELETE CASCADE,

  -- Price tracking
  flight_info JSONB NOT NULL, -- Complete flight details from API
  current_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Change Tracking
  price_change DECIMAL(10,2) DEFAULT 0, -- Positive = increase, Negative = decrease
  card_allowed_changes INTEGER DEFAULT 0, -- For aggregation

  -- Metadata
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT -- e.g., "kiwi_api" "telegram_direct"

  -- Composite index for efficient queries
  UNIQUE(alert_id, scraped_at)
);

-- Alert Logs table (tracks when alerts were sent)
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Alert details
  message_text TEXT NOT NULL,
  delivery_method TEXT DEFAULT 'telegram' CHECK (delivery_method IN ('telegram', 'email', 'sms')),
  success BOOLEAN DEFAULT false,

  -- Context
  trigger_reason TEXT, -- e.g., "price_dropped_below_threshold"
  price_threshold DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  price_change DECIMAL(10,2),

  -- Delivery status
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance optimized indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON public.price_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_route ON public.price_alerts(route_code);
CREATE INDEX IF NOT EXISTS idx_price_alerts_last_checked ON public.price_alerts(last_checked_at);

CREATE INDEX IF NOT EXISTS idx_price_history_alert_scraped ON public.price_history(alert_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_price ON public.price_history(current_price);

CREATE INDEX IF NOT EXISTS idx_alert_logs_alert_created ON public.alert_logs(alert_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_logs_user_sent ON public.alert_logs(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_logs_delivery ON public.alert_logs(delivery_method, success);

-- RLS Policies (Row Level Security)
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own price alerts
CREATE POLICY "Users manage own price alerts" ON public.price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Users can view price history for their alerts
CREATE POLICY "Users view price history" ON public.price_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.price_alerts pa
      WHERE pa.id = price_history.alert_id AND pa.user_id = auth.uid()
    )
  );

-- Users can view their alert logs
CREATE POLICY "Users view alert logs" ON public.alert_logs
  FOR ALL USING (auth.uid() = user_id);

-- Function to clean old alert logs (retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_alert_logs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.alert_logs
  WHERE created_at < NOW() - INTERVAL 'days' days_old;

  -- Update table statistics
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get price savings impact
CREATE OR REPLACE FUNCTION public.calculate_price_alert_impact(user_uuid UUID)
RETURNS TABLE(
  total_alerts_triggered INTEGER,
  potential_savings DECIMAL(10,2),
  actual_goals_conversion DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as alerts_triggered,
    COALESCE(SUM(-price_change), 0) as potential_savings,
    0.0 as actual_conversion  -- Placeholder for future booking tracking
  FROM public.alert_logs al
  WHERE al.user_id = user_uuid
    AND al.trigger_reason LIKE '%dropped%'
    AND al.created_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;