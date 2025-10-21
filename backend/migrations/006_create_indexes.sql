-- Migration: 006_create_indexes
-- Description: Additional performance indexes (most already created in table migrations)
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Note: Most indexes were already created in migrations 001-003
-- This file adds any additional indexes for optimization

-- Composite indexes for common query patterns

-- Index for finding bookings by user and status (common query)
CREATE INDEX IF NOT EXISTS idx_bookings_user_status 
  ON public.bookings(user_id, booking_status);

-- Index for finding bookings by user and date range
CREATE INDEX IF NOT EXISTS idx_bookings_user_dates 
  ON public.bookings(user_id, departure_date, return_date);

-- Index for payment processing queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent 
  ON public.bookings(payment_intent_id) 
  WHERE payment_intent_id IS NOT NULL;

-- Partial index for pending bookings (faster queries for active bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_pending 
  ON public.bookings(user_id, created_at DESC) 
  WHERE booking_status = 'pending';

-- Partial index for confirmed bookings
CREATE INDEX IF NOT EXISTS idx_bookings_confirmed 
  ON public.bookings(user_id, departure_date) 
  WHERE booking_status = 'confirmed';

-- Index for searching bookings by reference (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_bookings_reference_lower 
  ON public.bookings(LOWER(booking_reference));

-- Analyze tables to update statistics
ANALYZE public.profiles;
ANALYZE public.bookings;
ANALYZE public.flight_searches;

-- Success message with index summary
DO $$
DECLARE
  profile_indexes INTEGER;
  booking_indexes INTEGER;
  search_indexes INTEGER;
BEGIN
  -- Count indexes
  SELECT COUNT(*) INTO profile_indexes
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'profiles';
  
  SELECT COUNT(*) INTO booking_indexes
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'bookings';
  
  SELECT COUNT(*) INTO search_indexes
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'flight_searches';
  
  RAISE NOTICE 'Migration 006_create_indexes completed successfully';
  RAISE NOTICE 'Profiles table: % indexes', profile_indexes;
  RAISE NOTICE 'Bookings table: % indexes', booking_indexes;
  RAISE NOTICE 'Flight_searches table: % indexes', search_indexes;
  RAISE NOTICE 'Tables analyzed for query optimization';
END $$;
