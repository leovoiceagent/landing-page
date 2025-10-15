-- Fix the last security issue: Remove SECURITY DEFINER from user_profiles_with_email view
-- This will resolve the final security linter error

-- Drop the existing view
DROP VIEW IF EXISTS public.user_profiles_with_email;

-- Recreate the view without SECURITY DEFINER property
CREATE OR REPLACE VIEW public.user_profiles_with_email AS
SELECT 
  up.id,
  up.user_id,
  up.organization_id,
  up.first_name,
  up.last_name,
  up.created_at,
  up.is_active,
  -- Use the secure function instead of direct join
  get_user_email_safely(up.user_id) as email
FROM public.user_profiles up;

-- Grant access to authenticated users
GRANT SELECT ON public.user_profiles_with_email TO authenticated;

-- Set security barrier to true for extra protection (this is different from SECURITY DEFINER)
ALTER VIEW public.user_profiles_with_email SET (security_barrier = true);

COMMENT ON VIEW public.user_profiles_with_email IS 'Secure view that safely provides user email information without SECURITY DEFINER';

-- Verify the view was created without SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'user_profiles_with_email';
