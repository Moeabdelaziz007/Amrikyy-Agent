-- Migration: 004_profiles_rls
-- Description: Add Row Level Security policies for profiles table
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 
  'Allows users to read their own profile data';

-- Policy 2: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS 
  'Allows users to create their profile during signup';

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
  'Allows users to update their own profile information';

-- Policy 4: Public profiles viewable by everyone (optional - for future features)
-- Uncomment if you want to allow viewing other users' profiles
-- CREATE POLICY "Public profiles are viewable by everyone"
--   ON public.profiles
--   FOR SELECT
--   USING (true);

-- Create function to automatically create profile on user signup
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

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a profile when a new user signs up';

-- Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Triggers profile creation when a new user signs up';

-- Test RLS policies (these will fail if RLS is not working correctly)
DO $$
BEGIN
  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on profiles table';
  END IF;
  
  -- Verify policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    RAISE EXCEPTION 'No RLS policies found on profiles table';
  END IF;
  
  RAISE NOTICE 'RLS verification passed';
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 004_profiles_rls completed successfully';
  RAISE NOTICE 'RLS enabled on profiles table';
  RAISE NOTICE '3 policies created (SELECT, INSERT, UPDATE)';
  RAISE NOTICE 'Auto-profile creation trigger added';
END $$;
