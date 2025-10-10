-- Create a view that joins user_profiles with auth.users to get emails
-- This allows us to query user emails through the API

CREATE OR REPLACE VIEW public.user_profiles_with_email AS
SELECT 
  up.id,
  up.user_id,
  up.organization_id,
  up.first_name,
  up.last_name,
  up.created_at,
  up.is_active,
  au.email,
  au.created_at as user_created_at
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;

-- Grant access to authenticated users
GRANT SELECT ON public.user_profiles_with_email TO authenticated;

-- Add RLS policy (or disable RLS for this view since it's based on user_profiles which has its own RLS)
ALTER VIEW public.user_profiles_with_email SET (security_barrier = false);

COMMENT ON VIEW public.user_profiles_with_email IS 'View that combines user_profiles with auth.users email information';
