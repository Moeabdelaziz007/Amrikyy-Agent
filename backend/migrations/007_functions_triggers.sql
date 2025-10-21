-- Migration: 007_functions_triggers
-- Description: Create database functions and triggers for automation
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 
  'Automatically updates the updated_at column on row updates';

-- Trigger: Auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference: AMR + 6 random alphanumeric characters
    ref := 'AMR' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE booking_reference = ref) INTO exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_booking_reference() IS 
  'Generates a unique booking reference code (e.g., AMRABC123)';

-- Function: Calculate booking statistics
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

COMMENT ON FUNCTION get_user_booking_stats(UUID) IS 
  'Returns booking statistics for a specific user';

-- Function: Clean up expired flight searches (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_searches()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.flight_searches
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_searches() IS 
  'Deletes expired flight search cache entries. Run this periodically via cron.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 007_functions_triggers completed successfully';
  RAISE NOTICE 'Created functions:';
  RAISE NOTICE '  - update_updated_at_column()';
  RAISE NOTICE '  - generate_booking_reference()';
  RAISE NOTICE '  - get_user_booking_stats(UUID)';
  RAISE NOTICE '  - cleanup_expired_searches()';
  RAISE NOTICE 'Created triggers:';
  RAISE NOTICE '  - update_profiles_updated_at';
  RAISE NOTICE '  - update_bookings_updated_at';
END $$;
