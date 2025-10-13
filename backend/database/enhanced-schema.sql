-- Enhanced Database Schema for Maya AI Travel Assistant
-- Advanced user profiling, conversation tracking, and personalization

-- Create enhanced users table with comprehensive profiling
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Enhanced user information
  telegram_id BIGINT UNIQUE,
  telegram_username TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT DEFAULT 'SA',
  preferred_language TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Asia/Riyadh',
  
  -- Travel preferences
  travel_style TEXT DEFAULT 'balanced' CHECK (travel_style IN ('budget', 'balanced', 'luxury')),
  accommodation_preference TEXT DEFAULT 'hotel' CHECK (accommodation_preference IN ('hotel', 'apartment', 'hostel', 'luxury')),
  transportation_preference TEXT DEFAULT 'mixed' CHECK (transportation_preference IN ('flight', 'train', 'car', 'mixed')),
  food_preferences TEXT DEFAULT 'halal' CHECK (food_preferences IN ('halal', 'vegetarian', 'vegan', 'any')),
  budget_range TEXT DEFAULT 'medium' CHECK (budget_range IN ('low', 'medium', 'high', 'luxury')),
  group_size INTEGER DEFAULT 1,
  
  -- Cultural and religious preferences
  cultural_background TEXT DEFAULT 'arabic',
  religious_requirements TEXT[] DEFAULT ARRAY['halal_food', 'prayer_times'],
  special_needs TEXT[],
  
  -- AI interaction preferences
  preferred_response_length TEXT DEFAULT 'detailed' CHECK (preferred_response_length IN ('short', 'medium', 'detailed')),
  humor_preference TEXT DEFAULT 'moderate' CHECK (humor_preference IN ('none', 'moderate', 'high')),
  formality_level TEXT DEFAULT 'friendly' CHECK (formality_level IN ('formal', 'friendly', 'casual')),
  information_density TEXT DEFAULT 'high' CHECK (information_density IN ('low', 'medium', 'high')),
  
  -- Analytics
  total_trips INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  average_trip_duration INTEGER DEFAULT 0,
  loyalty_score DECIMAL(3,2) DEFAULT 0.0,
  engagement_level TEXT DEFAULT 'medium' CHECK (engagement_level IN ('low', 'medium', 'high', 'premium')),
  satisfaction_trend TEXT DEFAULT 'neutral' CHECK (satisfaction_trend IN ('positive', 'neutral', 'negative')),
  recommendation_accuracy DECIMAL(3,2) DEFAULT 0.8,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user interests table
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL, -- 'destination', 'activity', 'cuisine', 'culture', 'adventure', 'relaxation'
  interest_value TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  source TEXT, -- 'conversation', 'booking', 'search', 'feedback'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interest_type, interest_value)
);

-- Create user dislikes table
CREATE TABLE IF NOT EXISTS public.user_dislikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  dislike_type TEXT NOT NULL,
  dislike_value TEXT NOT NULL,
  severity DECIMAL(3,2) DEFAULT 0.5, -- 0.0 = mild dislike, 1.0 = strong dislike
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dislike_type, dislike_value)
);

-- Create conversation history table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- Store additional context, tools used, etc.
  response_time_ms INTEGER,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'travel_destination', 'budget_saving', 'skill_learning', 'experience'
  goal_description TEXT NOT NULL,
  target_date DATE,
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user constraints table
CREATE TABLE IF NOT EXISTS public.user_constraints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  constraint_type TEXT NOT NULL, -- 'budget', 'time', 'health', 'family', 'work', 'religious'
  constraint_description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_flexible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user motivations table
CREATE TABLE IF NOT EXISTS public.user_motivations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  motivation_type TEXT NOT NULL, -- 'exploration', 'relaxation', 'adventure', 'culture', 'family', 'business'
  motivation_description TEXT NOT NULL,
  importance_score INTEGER DEFAULT 3 CHECK (importance_score >= 1 AND importance_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  country TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  travel_style TEXT,
  group_size INTEGER DEFAULT 1,
  
  -- Enhanced trip information
  trip_purpose TEXT, -- 'leisure', 'business', 'family', 'honeymoon', 'adventure', 'cultural'
  accommodation_type TEXT,
  transportation_method TEXT,
  special_requirements TEXT[],
  
  -- AI-generated data
  ai_recommendations JSONB,
  personalized_score DECIMAL(3,2),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  feedback TEXT,
  
  -- Media and documents
  image_url TEXT,
  documents JSONB, -- Store flight tickets, hotel confirmations, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip activities table
CREATE TABLE IF NOT EXISTS public.trip_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT, -- 'sightseeing', 'restaurant', 'shopping', 'adventure', 'cultural', 'religious'
  location TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  duration_hours DECIMAL(4,2),
  cost DECIMAL(10,2),
  booking_reference TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user behavior tracking table
CREATE TABLE IF NOT EXISTS public.user_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'message_sent', 'button_clicked', 'command_used', 'search_performed'
  action_data JSONB NOT NULL,
  session_id UUID,
  device_info JSONB,
  location_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'destination', 'activity', 'accommodation', 'restaurant', 'transport'
  recommendation_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  personalization_score DECIMAL(3,2),
  reasoning TEXT,
  user_feedback TEXT,
  was_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL, -- 'recommendation', 'conversation', 'service', 'feature'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table with enhanced information
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Enhanced destination information
  description TEXT,
  best_time_to_visit TEXT,
  climate_info TEXT,
  cultural_highlights TEXT[],
  local_customs TEXT,
  
  -- Practical information
  currency TEXT,
  language TEXT,
  timezone TEXT,
  visa_requirements TEXT,
  
  -- Ratings and reviews
  overall_rating DECIMAL(3,2) DEFAULT 0,
  safety_rating DECIMAL(3,2) DEFAULT 0,
  cost_rating TEXT, -- '$', '$$', '$$$', '$$$$'
  family_friendly BOOLEAN DEFAULT true,
  halal_friendly BOOLEAN DEFAULT false,
  
  -- Media
  image_url TEXT,
  gallery_urls TEXT[],
  
  -- SEO and search
  search_keywords TEXT[],
  popular_activities TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create halal restaurants table
CREATE TABLE IF NOT EXISTS public.halal_restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cuisine_type TEXT,
  price_range TEXT,
  rating DECIMAL(3,2),
  halal_certification TEXT,
  prayer_facilities BOOLEAN DEFAULT false,
  opening_hours JSONB,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prayer locations table
CREATE TABLE IF NOT EXISTS public.prayer_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mosque', 'prayer_room', 'masjid')),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  facilities TEXT[], -- 'parking', 'ablution', 'library', 'classes'
  prayer_times_url TEXT,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table with enhanced categorization
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'accommodation', 'transportation', 'food', 'activities', 'shopping', 'misc'
  subcategory TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  payment_method TEXT,
  receipt_url TEXT,
  is_shared BOOLEAN DEFAULT false,
  shared_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table with enhanced tracking
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT NOT NULL,
  payment_provider TEXT, -- 'stripe', 'paypal', 'telegram', 'bank_transfer'
  provider_transaction_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'telegram', 'web', 'mobile'
  device_info JSONB,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  messages_count INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON public.users(last_active);
CREATE INDEX IF NOT EXISTS idx_users_travel_style ON public.users(travel_style);
CREATE INDEX IF NOT EXISTS idx_users_engagement_level ON public.users(engagement_level);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_type ON public.user_interests(interest_type);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON public.trips(destination);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON public.user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action_type ON public.user_behavior(action_type);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON public.ai_recommendations(recommendation_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dislikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user interests
CREATE POLICY "Users can manage own interests" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trips
CREATE POLICY "Users can manage own trips" ON public.trips
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user behavior
CREATE POLICY "Users can insert own behavior data" ON public.user_behavior
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for AI recommendations
CREATE POLICY "Users can view own recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.ai_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create enhanced user profile
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    avatar_url,
    telegram_id,
    telegram_username
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    (NEW.raw_user_meta_data->>'telegram_id')::bigint,
    NEW.raw_user_meta_data->>'telegram_username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_enhanced ON auth.users;
CREATE TRIGGER on_auth_user_created_enhanced
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_enhanced();

-- Function to update user last active timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET last_active = NOW(), updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update last active
CREATE TRIGGER update_last_active_on_conversation
  AFTER INSERT ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active();

CREATE TRIGGER update_last_active_on_behavior
  AFTER INSERT ON public.user_behavior
  FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active();

-- Function to calculate user engagement level
CREATE OR REPLACE FUNCTION public.calculate_engagement_level(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  activity_score INTEGER;
  conversation_count INTEGER;
  days_since_last_active INTEGER;
BEGIN
  -- Count conversations in last 30 days
  SELECT COUNT(*) INTO conversation_count
  FROM public.conversations
  WHERE user_id = user_uuid 
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Calculate days since last active
  SELECT EXTRACT(days FROM NOW() - last_active) INTO days_since_last_active
  FROM public.users
  WHERE id = user_uuid;
  
  -- Calculate activity score
  activity_score := conversation_count - days_since_last_active;
  
  -- Determine engagement level
  IF activity_score >= 50 THEN
    RETURN 'premium';
  ELSIF activity_score >= 20 THEN
    RETURN 'high';
  ELSIF activity_score >= 5 THEN
    RETURN 'medium';
  ELSE
    RETURN 'low';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample destinations with enhanced data
INSERT INTO public.destinations (name, country, region, description, best_time_to_visit, currency, language, timezone, overall_rating, cost_rating, halal_friendly, search_keywords, popular_activities) VALUES
('Istanbul', 'Turkey', 'Marmara', 'مدينة تاريخية عريقة تجمع بين أوروبا وآسيا، مليئة بالثقافة والتاريخ الإسلامي العظيم', 'Apr-Jun, Sep-Nov', 'TRY', 'Turkish', 'Europe/Istanbul', 4.8, '$$', true, ARRAY['istanbul', 'turkey', 'historical', 'cultural', 'mosques'], ARRAY['زيارة المساجد التاريخية', 'تجربة الطعام التركي', 'التسوق في البازار', 'رحلة بحرية في البوسفور']),
('Kuala Lumpur', 'Malaysia', 'Selangor', 'عاصمة ماليزيا الحديثة مع ناطحات السحاب والتقاليد الماليزية الأصيلة', 'Dec-Feb, Jun-Aug', 'MYR', 'Malay', 'Asia/Kuala_Lumpur', 4.6, '$$', true, ARRAY['kuala lumpur', 'malaysia', 'modern', 'halal', 'shopping'], ARRAY['زيارة برجا بتروناس', 'التسوق في مراكز التسوق', 'تجربة الطعام الماليزي', 'زيارة المساجد']),
('Bangkok', 'Thailand', 'Central Thailand', 'مدينة نابضة بالحياة مع المعابد الذهبية والأسواق العائمة', 'Nov-Mar', 'THB', 'Thai', 'Asia/Bangkok', 4.5, '$$', false, ARRAY['bangkok', 'thailand', 'temples', 'street food', 'nightlife'], ARRAY['زيارة المعابد', 'تجربة الطعام الشارعي', 'التسوق في الأسواق', 'الأنشطة الليلية']),
('Dubai', 'UAE', 'Dubai', 'مدينة المستقبل مع ناطحات السحاب والمتاجر الفاخرة والشواطئ الجميلة', 'Nov-Mar', 'AED', 'Arabic', 'Asia/Dubai', 4.7, '$$$', true, ARRAY['dubai', 'uae', 'luxury', 'shopping', 'modern'], ARRAY['زيارة برج خليفة', 'التسوق في دبي مول', 'رحلات الصحراء', 'الشواطئ']),
('Cairo', 'Egypt', 'Cairo', 'مدينة الألف مئذنة مع التاريخ الفرعوني والإسلامي العريق', 'Oct-Apr', 'EGP', 'Arabic', 'Africa/Cairo', 4.4, '$', true, ARRAY['cairo', 'egypt', 'pyramids', 'history', 'culture'], ARRAY['زيارة الأهرامات', 'المتحف المصري', 'المساجد التاريخية', 'النيل']),
('Marrakech', 'Morocco', 'Marrakech-Safi', 'مدينة السحر مع الأسواق الملونة والحدائق الأندلسية', 'Mar-May, Sep-Nov', 'MAD', 'Arabic', 'Africa/Casablanca', 4.5, '$$', true, ARRAY['marrakech', 'morocco', 'souk', 'gardens', 'atlas'], ARRAY['استكشاف السوق', 'زيارة الحدائق', 'رحلات جبال الأطلس', 'التجربة الثقافية']);

-- Insert sample halal restaurants
INSERT INTO public.halal_restaurants (destination_id, name, address, cuisine_type, price_range, rating, halal_certification, prayer_facilities) 
SELECT d.id, 'Sultan Ahmet Restaurant', 'Sultan Ahmet Square, Istanbul', 'Turkish', '$$', 4.5, 'Certified Halal', true
FROM public.destinations d WHERE d.name = 'Istanbul';

INSERT INTO public.halal_restaurants (destination_id, name, address, cuisine_type, price_range, rating, halal_certification, prayer_facilities) 
SELECT d.id, 'Nasi Kandar Pelita', 'Jalan Ampang, Kuala Lumpur', 'Malaysian', '$', 4.3, 'JAKIM Certified', true
FROM public.destinations d WHERE d.name = 'Kuala Lumpur';

-- Insert sample prayer locations
INSERT INTO public.prayer_locations (destination_id, name, type, address, capacity, facilities)
SELECT d.id, 'Sultan Ahmed Mosque', 'mosque', 'Sultan Ahmet Square, Istanbul', 1000, ARRAY['parking', 'ablution', 'library']
FROM public.destinations d WHERE d.name = 'Istanbul';

INSERT INTO public.prayer_locations (destination_id, name, type, address, capacity, facilities)
SELECT d.id, 'National Mosque of Malaysia', 'mosque', 'Jalan Perdana, Kuala Lumpur', 15000, ARRAY['parking', 'ablution', 'library', 'classes']
FROM public.destinations d WHERE d.name = 'Kuala Lumpur';

-- Revenue Analytics Tables

-- Revenue categories table
CREATE TABLE IF NOT EXISTS public.revenue_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('booking', 'commission', 'fee', 'subscription', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue events table for tracking individual revenue transactions
CREATE TABLE IF NOT EXISTS public.revenue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.revenue_categories(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  description TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('booking', 'payment', 'commission', 'fee', 'refund', 'adjustment')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue analytics table for aggregated data
CREATE TABLE IF NOT EXISTS public.revenue_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  booking_revenue DECIMAL(15,2) DEFAULT 0,
  commission_revenue DECIMAL(15,2) DEFAULT 0,
  fee_revenue DECIMAL(15,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  average_transaction_value DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period_type, period_start, period_end)
);

-- Revenue forecasts table
CREATE TABLE IF NOT EXISTS public.revenue_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_period TEXT NOT NULL CHECK (forecast_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  forecast_date DATE NOT NULL,
  predicted_revenue DECIMAL(15,2) NOT NULL,
  confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  factors JSONB, -- Factors influencing the forecast
  actual_revenue DECIMAL(15,2),
  accuracy DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for revenue tables
ALTER TABLE public.revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revenue tables (admin/system access primarily)
CREATE POLICY "System can manage revenue categories" ON public.revenue_categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage revenue events" ON public.revenue_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage revenue analytics" ON public.revenue_analytics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage revenue forecasts" ON public.revenue_forecasts
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for revenue tables
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON public.revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_trip_id ON public.revenue_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_payment_id ON public.revenue_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_category_id ON public.revenue_events(category_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_event_date ON public.revenue_events(event_date);
CREATE INDEX IF NOT EXISTS idx_revenue_events_source ON public.revenue_events(source);
CREATE INDEX IF NOT EXISTS idx_revenue_events_status ON public.revenue_events(status);

CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON public.revenue_analytics(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_created_at ON public.revenue_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_period ON public.revenue_forecasts(forecast_period, forecast_date);

-- Insert default revenue categories
INSERT INTO public.revenue_categories (name, description, type) VALUES
('Trip Booking', 'Revenue from trip bookings', 'booking'),
('Payment Processing Fee', 'Fees from payment processing', 'fee'),
('Commission', 'Commission from bookings', 'commission'),
('Subscription', 'Subscription revenue', 'subscription'),
('Refund Adjustment', 'Revenue adjustments from refunds', 'other')
ON CONFLICT (name) DO NOTHING;

-- Function to automatically log revenue events on payment completion
CREATE OR REPLACE FUNCTION public.log_revenue_event_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  category_record RECORD;
  revenue_amount DECIMAL(12,2);
  revenue_description TEXT;
BEGIN
  -- Only log for completed payments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Determine category based on payment description or metadata
    SELECT * INTO category_record
    FROM public.revenue_categories
    WHERE type = 'booking'
    LIMIT 1;

    -- Calculate revenue amount (could include commission logic here)
    revenue_amount := NEW.amount;

    -- Create description
    revenue_description := COALESCE(NEW.description, 'Payment revenue');

    -- Insert revenue event
    INSERT INTO public.revenue_events (
      user_id,
      trip_id,
      payment_id,
      category_id,
      amount,
      currency,
      description,
      source,
      status,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.trip_id,
      NEW.id,
      category_record.id,
      revenue_amount,
      NEW.currency,
      revenue_description,
      'payment',
      'completed',
      jsonb_build_object(
        'payment_method', NEW.payment_method,
        'provider_transaction_id', NEW.provider_transaction_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic revenue logging on payment completion
CREATE TRIGGER log_revenue_on_payment_completion
  AFTER UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.log_revenue_event_on_payment();

-- Function to update revenue analytics (daily aggregation)
CREATE OR REPLACE FUNCTION public.update_daily_revenue_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  analytics_record RECORD;
BEGIN
  -- Calculate daily revenue analytics
  SELECT
    SUM(amount) as total_revenue,
    SUM(CASE WHEN source = 'booking' THEN amount ELSE 0 END) as booking_revenue,
    SUM(CASE WHEN source = 'commission' THEN amount ELSE 0 END) as commission_revenue,
    SUM(CASE WHEN source = 'fee' THEN amount ELSE 0 END) as fee_revenue,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(amount) as avg_transaction_value
  INTO analytics_record
  FROM public.revenue_events
  WHERE DATE(event_date) = target_date
    AND status = 'completed';

  -- Insert or update daily analytics
  INSERT INTO public.revenue_analytics (
    period_type,
    period_start,
    period_end,
    total_revenue,
    booking_revenue,
    commission_revenue,
    fee_revenue,
    transaction_count,
    unique_users,
    average_transaction_value
  ) VALUES (
    'daily',
    target_date,
    target_date,
    COALESCE(analytics_record.total_revenue, 0),
    COALESCE(analytics_record.booking_revenue, 0),
    COALESCE(analytics_record.commission_revenue, 0),
    COALESCE(analytics_record.fee_revenue, 0),
    COALESCE(analytics_record.transaction_count, 0),
    COALESCE(analytics_record.unique_users, 0),
    COALESCE(analytics_record.avg_transaction_value, 0)
  )
  ON CONFLICT (period_type, period_start, period_end)
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    booking_revenue = EXCLUDED.booking_revenue,
    commission_revenue = EXCLUDED.commission_revenue,
    fee_revenue = EXCLUDED.fee_revenue,
    transaction_count = EXCLUDED.transaction_count,
    unique_users = EXCLUDED.unique_users,
    average_transaction_value = EXCLUDED.average_transaction_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;