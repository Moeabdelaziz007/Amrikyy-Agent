-- ============================================
-- AMRIKYY TRAVEL AGENT - COMPLETE DATABASE SETUP
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- Execution time: ~30 seconds
-- ============================================

-- ============================================
-- MIGRATION 001: CREATE PROFILES TABLE
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Grant permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- ============================================
-- MIGRATION 002: CREATE BOOKINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_data JSONB NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  travelers JSONB NOT NULL,
  num_travelers INTEGER NOT NULL CHECK (num_travelers > 0 AND num_travelers <= 9),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_reference TEXT UNIQUE NOT NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.bookings IS 'Flight bookings and reservations';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_departure_date ON public.bookings(departure_date);

-- Create GIN indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_bookings_flight_data ON public.bookings USING GIN (flight_data);
CREATE INDEX IF NOT EXISTS idx_bookings_travelers ON public.bookings USING GIN (travelers);
CREATE INDEX IF NOT EXISTS idx_bookings_metadata ON public.bookings USING GIN (metadata);

-- Grant permissions
GRANT SELECT ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO authenticated;
GRANT UPDATE ON public.bookings TO authenticated;
GRANT DELETE ON public.bookings TO authenticated;

-- ============================================
-- MIGRATION 003: CREATE FLIGHT_SEARCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.flight_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_params JSONB NOT NULL,
  results JSONB NOT NULL,
  result_count INTEGER DEFAULT 0,
  api_source TEXT DEFAULT 'kiwi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes')
);

-- Add comments
COMMENT ON TABLE public.flight_searches IS 'Cached flight search results to reduce API calls';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flight_searches_params 
  ON public.flight_searches USING GIN (search_params);
CREATE INDEX IF NOT EXISTS idx_flight_searches_expires 
  ON public.flight_searches(expires_at);
CREATE INDEX IF NOT EXISTS idx_flight_searches_created 
  ON public.flight_searches(created_at DESC);

-- Grant permissions
GRANT SELECT ON public.flight_searches TO authenticated;
GRANT SELECT ON public.flight_searches TO anon;
GRANT INSERT ON public.flight_searches TO authenticated;
GRANT INSERT ON public.flight_searches TO anon;
GRANT DELETE ON public.flight_searches TO authenticated;

-- ============================================
-- MIGRATION 004: PROFILES RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MIGRATION 005: BOOKINGS RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

-- Create policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON public.bookings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION 006: ADDITIONAL INDEXES
-- ============================================

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_status 
  ON public.bookings(user_id, booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_user_dates 
  ON public.bookings(user_id, departure_date, return_date);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent 
  ON public.bookings(payment_intent_id) 
  WHERE payment_intent_id IS NOT NULL;

-- Partial indexes
CREATE INDEX IF NOT EXISTS idx_bookings_pending 
  ON public.bookings(user_id, created_at DESC) 
  WHERE booking_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_bookings_confirmed 
  ON public.bookings(user_id, departure_date) 
  WHERE booking_status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_bookings_reference_lower 
  ON public.bookings(LOWER(booking_reference));

-- Analyze tables
ANALYZE public.profiles;
ANALYZE public.bookings;
ANALYZE public.flight_searches;

-- ============================================
-- MIGRATION 007: FUNCTIONS AND TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    ref := 'AMR' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE booking_reference = ref) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Get user booking stats
CREATE OR REPLACE FUNCTION get_user_booking_stats(p_user_id UUID)
RETURNS TABLE(
  total_bookings BIGINT,
  pending_bookings BIGINT,
  confirmed_bookings BIGINT,
  cancelled_bookings BIGINT,
  total_spent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'pending')::BIGINT as pending_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'confirmed')::BIGINT as confirmed_bookings,
    COUNT(*) FILTER (WHERE booking_status = 'cancelled')::BIGINT as cancelled_bookings,
    COALESCE(SUM(total_price) FILTER (WHERE booking_status = 'confirmed'), 0) as total_spent
  FROM public.bookings
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired searches
CREATE OR REPLACE FUNCTION cleanup_expired_searches()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.flight_searches WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  profile_count INTEGER;
  booking_count INTEGER;
  search_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO profile_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles';
  SELECT COUNT(*) INTO booking_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookings';
  SELECT COUNT(*) INTO search_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'flight_searches';
  
  -- Verify
  IF profile_count = 0 OR booking_count = 0 OR search_count = 0 THEN
    RAISE EXCEPTION 'Migration failed - tables not created';
  END IF;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'ALL MIGRATIONS COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ profiles';
  RAISE NOTICE '  ✓ bookings';
  RAISE NOTICE '  ✓ flight_searches';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies: ENABLED';
  RAISE NOTICE 'Indexes: CREATED';
  RAISE NOTICE 'Functions: CREATED';
  RAISE NOTICE 'Triggers: CREATED';
  RAISE NOTICE '';
  RAISE NOTICE 'Your database is ready for production!';
  RAISE NOTICE '============================================';
END $$;
