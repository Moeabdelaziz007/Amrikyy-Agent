-- Migration: 002_create_bookings
-- Description: Create bookings table for flight reservations
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Create bookings table
-- Stores all flight booking information
CREATE TABLE IF NOT EXISTS public.bookings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Flight information (stored as JSONB for flexibility)
  flight_data JSONB NOT NULL,
  
  -- Trip details
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  
  -- Travelers information (array of traveler objects)
  travelers JSONB NOT NULL,
  num_travelers INTEGER NOT NULL CHECK (num_travelers > 0 AND num_travelers <= 9),
  
  -- Pricing
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Payment information
  payment_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  
  -- Booking status
  booking_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_reference TEXT UNIQUE NOT NULL,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.bookings IS 'Flight bookings and reservations';
COMMENT ON COLUMN public.bookings.id IS 'Unique booking identifier';
COMMENT ON COLUMN public.bookings.user_id IS 'References the user who made the booking';
COMMENT ON COLUMN public.bookings.flight_data IS 'Complete flight information from search API';
COMMENT ON COLUMN public.bookings.origin IS 'Departure airport/city code';
COMMENT ON COLUMN public.bookings.destination IS 'Arrival airport/city code';
COMMENT ON COLUMN public.bookings.departure_date IS 'Flight departure date';
COMMENT ON COLUMN public.bookings.return_date IS 'Return flight date (null for one-way)';
COMMENT ON COLUMN public.bookings.travelers IS 'Array of traveler information (name, passport, etc.)';
COMMENT ON COLUMN public.bookings.num_travelers IS 'Total number of travelers (1-9)';
COMMENT ON COLUMN public.bookings.total_price IS 'Total booking price';
COMMENT ON COLUMN public.bookings.currency IS 'Currency code (USD, EUR, etc.)';
COMMENT ON COLUMN public.bookings.payment_status IS 'Stripe payment status';
COMMENT ON COLUMN public.bookings.payment_intent_id IS 'Stripe PaymentIntent ID';
COMMENT ON COLUMN public.bookings.stripe_payment_id IS 'Stripe Payment ID';
COMMENT ON COLUMN public.bookings.booking_status IS 'Overall booking status';
COMMENT ON COLUMN public.bookings.booking_reference IS 'Unique booking reference code (e.g., AMR123ABC)';
COMMENT ON COLUMN public.bookings.notes IS 'Additional notes or special requests';
COMMENT ON COLUMN public.bookings.metadata IS 'Additional metadata as JSON';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_departure_date ON public.bookings(departure_date);

-- Create GIN index for JSONB columns (for fast JSON queries)
CREATE INDEX IF NOT EXISTS idx_bookings_flight_data ON public.bookings USING GIN (flight_data);
CREATE INDEX IF NOT EXISTS idx_bookings_travelers ON public.bookings USING GIN (travelers);
CREATE INDEX IF NOT EXISTS idx_bookings_metadata ON public.bookings USING GIN (metadata);

-- Grant permissions
GRANT SELECT ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO authenticated;
GRANT UPDATE ON public.bookings TO authenticated;
GRANT DELETE ON public.bookings TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 002_create_bookings completed successfully';
  RAISE NOTICE 'Indexes created for optimal query performance';
  RAISE NOTICE 'GIN indexes created for JSONB columns';
END $$;
