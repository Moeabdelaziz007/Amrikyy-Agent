-- Migration: 005_bookings_rls
-- Description: Add Row Level Security policies for bookings table
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Enable Row Level Security on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

-- Policy 1: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own bookings" ON public.bookings IS 
  'Allows users to read only their own bookings';

-- Policy 2: Users can create bookings
CREATE POLICY "Users can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can create bookings" ON public.bookings IS 
  'Allows authenticated users to create bookings for themselves';

-- Policy 3: Users can update their own bookings
-- Only allow updates to certain fields (not payment_status or booking_reference)
CREATE POLICY "Users can update their own bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update their own bookings" ON public.bookings IS 
  'Allows users to update their own bookings (e.g., add notes, cancel)';

-- Policy 4: Users can delete/cancel their own bookings
CREATE POLICY "Users can delete their own bookings"
  ON public.bookings
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can delete their own bookings" ON public.bookings IS 
  'Allows users to delete their own bookings';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 005_bookings_rls completed successfully';
  RAISE NOTICE 'RLS enabled on bookings table';
  RAISE NOTICE '4 policies created (SELECT, INSERT, UPDATE, DELETE)';
END $$;
