-- Remove the problematic view entirely
-- Since emails aren't showing properly anyway, let's just remove it

-- Drop the view completely
DROP VIEW IF EXISTS public.user_profiles_with_email CASCADE;

-- Drop the function too
DROP FUNCTION IF EXISTS get_user_email_safely(uuid) CASCADE;

-- Verify it's gone
SELECT 
  schemaname,
  viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'user_profiles_with_email';

-- Should return no rows if successful
