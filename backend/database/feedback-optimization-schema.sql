-- Feedback & Optimization Loop Database Schema
-- Extends existing schema with comprehensive interaction tracking and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced Travel Offers Table with Feedback Fields
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' 
  CHECK (status IN ('sent', 'seen', 'clicked', 'accepted', 'rejected', 'expired'));
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS interaction_timestamp TIMESTAMPTZ;
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS ab_test_variant CHAR(1) CHECK (ab_test_variant IN ('A', 'B'));
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS personalization_score INTEGER DEFAULT 0;
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS notification_channels JSONB DEFAULT '[]';
ALTER TABLE travel_offers ADD COLUMN IF NOT EXISTS offer_metadata JSONB DEFAULT '{}';

-- Scout User Interests Table (Move from file storage to database)
CREATE TABLE IF NOT EXISTS scout_user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  interest_count INTEGER DEFAULT 1,
  last_mentioned TIMESTAMPTZ DEFAULT NOW(),
  interest_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scout Price History Table (Move from file storage to database)
CREATE TABLE IF NOT EXISTS scout_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  price_drop_percentage DECIMAL(5, 2),
  source TEXT DEFAULT 'scout_agent',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offer Performance Analytics Table
CREATE TABLE IF NOT EXISTS offer_performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL,
  metric_name TEXT NOT NULL, -- 'click_rate', 'conversion_rate', 'engagement_score'
  metric_value DECIMAL(10, 4) NOT NULL,
  calculation_date DATE NOT NULL,
  sample_size INTEGER DEFAULT 0,
  confidence_level DECIMAL(3, 2) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (offer_id) REFERENCES travel_offers(id) ON DELETE CASCADE
);

-- Scout Strategy Insights Table (Kody's analysis results)
CREATE TABLE IF NOT EXISTS scout_strategy_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_type TEXT NOT NULL, -- 'destination_performance', 'timing_optimization', 'content_effectiveness'
  insight_data JSONB NOT NULL,
  confidence_score DECIMAL(3, 2) DEFAULT 0.5,
  applicable_until TIMESTAMPTZ,
  created_by TEXT DEFAULT 'kody_analytics_engine',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- A/B Test Results Table
CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name TEXT NOT NULL,
  variant_a_offers INTEGER DEFAULT 0,
  variant_b_offers INTEGER DEFAULT 0,
  variant_a_clicks INTEGER DEFAULT 0,
  variant_b_clicks INTEGER DEFAULT 0,
  variant_a_conversions INTEGER DEFAULT 0,
  variant_b_conversions INTEGER DEFAULT 0,
  statistical_significance DECIMAL(5, 4),
  winner_variant CHAR(1),
  test_start_date DATE NOT NULL,
  test_end_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Interaction Events Table (Detailed tracking)
CREATE TABLE IF NOT EXISTS user_interaction_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  offer_id UUID,
  event_type TEXT NOT NULL, -- 'offer_sent', 'offer_viewed', 'offer_clicked', 'offer_shared', 'offer_booked'
  event_data JSONB DEFAULT '{}',
  channel TEXT, -- 'telegram', 'whatsapp', 'web'
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (offer_id) REFERENCES travel_offers(id) ON DELETE SET NULL
);

-- Scout Agent Metrics Table (Performance tracking)
CREATE TABLE IF NOT EXISTS scout_agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  users_monitored INTEGER DEFAULT 0,
  offers_generated INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  price_alerts_triggered INTEGER DEFAULT 0,
  total_savings_identified DECIMAL(12, 2) DEFAULT 0,
  average_offer_response_time INTEGER DEFAULT 0, -- milliseconds
  user_engagement_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scout_user_interests_user_id ON scout_user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_scout_user_interests_destination ON scout_user_interests(destination);
CREATE INDEX IF NOT EXISTS idx_scout_price_history_destination ON scout_price_history(destination);
CREATE INDEX IF NOT EXISTS idx_scout_price_history_recorded_at ON scout_price_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_performance_analytics_offer_id ON offer_performance_analytics(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_performance_analytics_date ON offer_performance_analytics(calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_scout_strategy_insights_type ON scout_strategy_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_scout_strategy_insights_active ON scout_strategy_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_name ON ab_test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_user_id ON user_interaction_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_offer_id ON user_interaction_events(offer_id);
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_timestamp ON user_interaction_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scout_agent_metrics_date ON scout_agent_metrics(metric_date DESC);

-- Create views for common analytics queries
CREATE OR REPLACE VIEW offer_performance_summary AS
SELECT 
  o.id,
  o.title,
  o.destination,
  o.category,
  o.status,
  o.ab_test_variant,
  COUNT(ue.id) as total_interactions,
  COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) as clicks,
  COUNT(CASE WHEN ue.event_type = 'offer_booked' THEN 1 END) as bookings,
  CASE 
    WHEN COUNT(ue.id) > 0 THEN 
      ROUND(COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END)::DECIMAL / COUNT(ue.id) * 100, 2)
    ELSE 0 
  END as click_rate,
  CASE 
    WHEN COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) > 0 THEN 
      ROUND(COUNT(CASE WHEN ue.event_type = 'offer_booked' THEN 1 END)::DECIMAL / COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  o.created_at,
  o.valid_until
FROM travel_offers o
LEFT JOIN user_interaction_events ue ON o.id = ue.offer_id
WHERE o.is_active = true
GROUP BY o.id, o.title, o.destination, o.category, o.status, o.ab_test_variant, o.created_at, o.valid_until;

-- Create view for user engagement analytics
CREATE OR REPLACE VIEW user_engagement_analytics AS
SELECT 
  ue.user_id,
  COUNT(ue.id) as total_events,
  COUNT(CASE WHEN ue.event_type = 'offer_sent' THEN 1 END) as offers_received,
  COUNT(CASE WHEN ue.event_type = 'offer_viewed' THEN 1 END) as offers_viewed,
  COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) as offers_clicked,
  COUNT(CASE WHEN ue.event_type = 'offer_booked' THEN 1 END) as offers_booked,
  CASE 
    WHEN COUNT(CASE WHEN ue.event_type = 'offer_sent' THEN 1 END) > 0 THEN 
      ROUND(COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END)::DECIMAL / COUNT(CASE WHEN ue.event_type = 'offer_sent' THEN 1 END) * 100, 2)
    ELSE 0 
  END as engagement_rate,
  MAX(ue.timestamp) as last_interaction,
  MIN(ue.timestamp) as first_interaction
FROM user_interaction_events ue
GROUP BY ue.user_id;

-- Insert sample data for testing
INSERT INTO scout_strategy_insights (insight_type, insight_data, confidence_score, applicable_until) VALUES
('destination_performance', '{"top_destinations": ["tokyo", "paris", "dubai"], "click_rates": {"tokyo": 0.15, "paris": 0.12, "dubai": 0.18}}', 0.85, NOW() + INTERVAL '30 days'),
('timing_optimization', '{"best_times": ["09:00", "14:00", "19:00"], "best_days": ["friday", "saturday"], "timezone": "UTC+3"}', 0.78, NOW() + INTERVAL '14 days'),
('content_effectiveness', '{"high_performing_titles": ["عرض خاص", "خصم كبير"], "effective_descriptions": ["ثقافة", "طعام", "مغامرة"]}', 0.82, NOW() + INTERVAL '21 days');

-- Create function to calculate offer performance metrics
CREATE OR REPLACE FUNCTION calculate_offer_performance(offer_uuid UUID)
RETURNS TABLE (
  offer_id UUID,
  total_interactions BIGINT,
  click_rate DECIMAL,
  conversion_rate DECIMAL,
  engagement_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    COUNT(ue.id) as total_interactions,
    CASE 
      WHEN COUNT(ue.id) > 0 THEN 
        ROUND(COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END)::DECIMAL / COUNT(ue.id) * 100, 2)
      ELSE 0 
    END as click_rate,
    CASE 
      WHEN COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) > 0 THEN 
        ROUND(COUNT(CASE WHEN ue.event_type = 'offer_booked' THEN 1 END)::DECIMAL / COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) * 100, 2)
      ELSE 0 
    END as conversion_rate,
    CASE 
      WHEN COUNT(ue.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN ue.event_type = 'offer_viewed' THEN 1 END) * 0.3 + 
               COUNT(CASE WHEN ue.event_type = 'offer_clicked' THEN 1 END) * 0.5 + 
               COUNT(CASE WHEN ue.event_type = 'offer_booked' THEN 1 END) * 1.0) / COUNT(ue.id) * 100, 2)
      ELSE 0 
    END as engagement_score
  FROM travel_offers o
  LEFT JOIN user_interaction_events ue ON o.id = ue.offer_id
  WHERE o.id = offer_uuid
  GROUP BY o.id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user interest trends
CREATE OR REPLACE FUNCTION get_user_interest_trends(user_id_param TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  destination TEXT,
  interest_count BIGINT,
  trend_direction TEXT,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sui.destination,
    COUNT(sui.id) as interest_count,
    CASE 
      WHEN COUNT(sui.id) > LAG(COUNT(sui.id)) OVER (PARTITION BY sui.destination ORDER BY sui.updated_at) THEN 'increasing'
      WHEN COUNT(sui.id) < LAG(COUNT(sui.id)) OVER (PARTITION BY sui.destination ORDER BY sui.updated_at) THEN 'decreasing'
      ELSE 'stable'
    END as trend_direction,
    MAX(sui.updated_at) as last_activity
  FROM scout_user_interests sui
  WHERE sui.user_id = user_id_param 
    AND sui.updated_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY sui.destination
  ORDER BY interest_count DESC;
END;
$$ LANGUAGE plpgsql;
