-- Remove the problematic view entirely and use direct queries instead
-- This avoids the SECURITY DEFINER issue completely

-- Drop the view and function
DROP VIEW IF EXISTS public.user_profiles_with_email CASCADE;
DROP FUNCTION IF EXISTS get_user_email_secure(uuid) CASCADE;
DROP TRIGGER IF EXISTS prevent_email_updates_trigger ON public.user_profiles;
DROP FUNCTION IF EXISTS prevent_email_updates() CASCADE;

-- Verify everything is cleaned up
SELECT 
  schemaname,
  viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'user_profiles_with_email';

-- Should return no rows if successful
