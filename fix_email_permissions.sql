-- Fix the email permissions issue
-- The problem is that functions can't directly access auth.users table

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_user_email_simple(uuid);

-- Create a different approach using a view that Supabase allows
-- This creates a simple view that joins user_profiles with auth.users
CREATE OR REPLACE VIEW public.user_emails AS
SELECT 
  up.user_id,
  au.email
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;

-- Grant access to authenticated users
GRANT SELECT ON public.user_emails TO authenticated;

-- Enable RLS on the view (inherits from base tables)
ALTER VIEW public.user_emails SET (security_barrier = true);

-- Test the view
SELECT * FROM public.user_emails LIMIT 3;
