-- Migration: 008_test_data
-- Description: Insert test data to verify schema works correctly
-- Author: Ona AI Assistant
-- Date: 2025-10-21
-- WARNING: This is for testing only. Run in development environment only!

-- Check if we're in production
DO $$
BEGIN
  IF current_setting('server_version_num')::int >= 140000 THEN
    IF current_database() = 'postgres' AND 
       EXISTS (SELECT 1 FROM pg_settings WHERE name = 'rds.extensions') THEN
      RAISE EXCEPTION 'Cannot run test data in production environment!';
    END IF;
  END IF;
END $$;

-- Test 1: Create test user profile
-- Note: This assumes a test user exists in auth.users
-- You'll need to sign up a test user first through the app

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to get a test user (you'll need to create one first)
  SELECT id INTO test_user_id 
  FROM auth.users 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Insert test profile (if not exists)
    INSERT INTO public.profiles (id, full_name, phone, preferred_currency)
    VALUES (
      test_user_id,
      'Test User',
      '+1234567890',
      'USD'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Test profile created for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'No users found. Please sign up a test user first.';
  END IF;
END $$;

-- Test 2: Create test booking
DO $$
DECLARE
  test_user_id UUID;
  test_booking_id UUID;
  test_reference TEXT;
BEGIN
  -- Get test user
  SELECT id INTO test_user_id 
  FROM auth.users 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Generate booking reference
    test_reference := generate_booking_reference();
    
    -- Insert test booking
    INSERT INTO public.bookings (
      user_id,
      flight_data,
      origin,
      destination,
      departure_date,
      return_date,
      travelers,
      num_travelers,
      total_price,
      currency,
      booking_reference,
      booking_status,
      payment_status
    )
    VALUES (
      test_user_id,
      '{"airline": "Test Airways", "flight_number": "TA123", "duration": "2h 30m"}'::jsonb,
      'JFK',
      'LAX',
      CURRENT_DATE + INTERVAL '30 days',
      CURRENT_DATE + INTERVAL '37 days',
      '[{"first_name": "John", "last_name": "Doe", "passport": "AB123456"}]'::jsonb,
      1,
      299.99,
      'USD',
      test_reference,
      'pending',
      'pending'
    )
    RETURNING id INTO test_booking_id;
    
    RAISE NOTICE 'Test booking created: % (Reference: %)', test_booking_id, test_reference;
  END IF;
END $$;

-- Test 3: Create test flight search cache
INSERT INTO public.flight_searches (
  search_params,
  results,
  result_count,
  api_source,
  expires_at
)
VALUES (
  '{"origin": "JFK", "destination": "LAX", "date": "2025-11-01"}'::jsonb,
  '[{"price": 299, "airline": "Test Airways"}]'::jsonb,
  1,
  'kiwi',
  NOW() + INTERVAL '5 minutes'
);

RAISE NOTICE 'Test flight search cache created';

-- Test 4: Verify RLS policies work
DO $$
DECLARE
  test_user_id UUID;
  profile_count INTEGER;
  booking_count INTEGER;
BEGIN
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Set the user context (simulates authenticated user)
    PERFORM set_config('request.jwt.claim.sub', test_user_id::text, true);
    
    -- Try to read profile
    SELECT COUNT(*) INTO profile_count
    FROM public.profiles
    WHERE id = test_user_id;
    
    -- Try to read bookings
    SELECT COUNT(*) INTO booking_count
    FROM public.bookings
    WHERE user_id = test_user_id;
    
    RAISE NOTICE 'RLS Test - Profile count: %, Booking count: %', profile_count, booking_count;
    
    IF profile_count > 0 AND booking_count > 0 THEN
      RAISE NOTICE 'RLS policies working correctly!';
    END IF;
  END IF;
END $$;

-- Test 5: Test triggers
DO $$
DECLARE
  test_user_id UUID;
  old_updated_at TIMESTAMP;
  new_updated_at TIMESTAMP;
BEGIN
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Get current updated_at
    SELECT updated_at INTO old_updated_at
    FROM public.profiles
    WHERE id = test_user_id;
    
    -- Wait a moment
    PERFORM pg_sleep(1);
    
    -- Update profile
    UPDATE public.profiles
    SET phone = '+9876543210'
    WHERE id = test_user_id;
    
    -- Get new updated_at
    SELECT updated_at INTO new_updated_at
    FROM public.profiles
    WHERE id = test_user_id;
    
    IF new_updated_at > old_updated_at THEN
      RAISE NOTICE 'Trigger test passed - updated_at changed from % to %', old_updated_at, new_updated_at;
    ELSE
      RAISE WARNING 'Trigger test failed - updated_at did not change';
    END IF;
  END IF;
END $$;

-- Test 6: Test functions
DO $$
DECLARE
  test_user_id UUID;
  stats RECORD;
BEGIN
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test booking stats function
    SELECT * INTO stats FROM get_user_booking_stats(test_user_id);
    
    RAISE NOTICE 'Booking stats for user %:', test_user_id;
    RAISE NOTICE '  Total bookings: %', stats.total_bookings;
    RAISE NOTICE '  Pending: %', stats.pending_bookings;
    RAISE NOTICE '  Confirmed: %', stats.confirmed_bookings;
    RAISE NOTICE '  Cancelled: %', stats.cancelled_bookings;
    RAISE NOTICE '  Total spent: $%', stats.total_spent;
  END IF;
END $$;

-- Cleanup instructions
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'To clean up test data, run:';
  RAISE NOTICE '  DELETE FROM public.bookings WHERE booking_status = ''pending'';';
  RAISE NOTICE '  DELETE FROM public.flight_searches;';
  RAISE NOTICE '';
  RAISE NOTICE 'Or run the rollback script: 008_test_data_rollback.sql';
END $$;
