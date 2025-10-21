-- Migration: 001_create_profiles
-- Description: Create profiles table to extend Supabase auth.users
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
-- This extends the auth.users table with additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key references auth.users
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- User information
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Preferences
  preferred_currency TEXT DEFAULT 'USD',
  preferred_language TEXT DEFAULT 'en',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.preferred_currency IS 'User preferred currency for bookings';
COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language (en, ar)';

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Grant permissions
-- Allow authenticated users to read profiles
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Allow authenticated users to insert/update their own profile
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 001_create_profiles completed successfully';
END $$;
