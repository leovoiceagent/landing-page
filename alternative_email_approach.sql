-- Alternative approach: Remove the problematic view and try a different method
-- This removes the security linter errors

-- Drop the problematic view
DROP VIEW IF EXISTS public.user_emails CASCADE;

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_user_email_simple(uuid) CASCADE;

-- For now, we'll use a different approach:
-- Store email in user_profiles table when users sign up
-- This avoids accessing auth.users directly

-- Add an email column to user_profiles (if it doesn't exist)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Update existing user_profiles with emails from auth.users
-- This is a one-time migration that runs with elevated permissions
UPDATE public.user_profiles 
SET email = au.email
FROM auth.users au
WHERE public.user_profiles.user_id = au.id 
AND public.user_profiles.email IS NULL;

-- Verify the update worked
SELECT COUNT(*) as profiles_with_emails 
FROM public.user_profiles 
WHERE email IS NOT NULL;
