-- Fix the SECURITY DEFINER issue by removing it from the function
-- The view inherits SECURITY DEFINER from the function it calls

-- Drop the existing view first
DROP VIEW IF EXISTS public.user_profiles_with_email;

-- Drop and recreate the function without SECURITY DEFINER
DROP FUNCTION IF EXISTS get_user_email_safely(uuid);

-- Create a simpler function without SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_user_email_safely(user_uuid uuid)
RETURNS text AS $$
DECLARE
  user_email text;
BEGIN
  -- Only allow authenticated users to call this function
  IF auth.role() != 'authenticated' THEN
    RETURN NULL;
  END IF;
  
  -- Check if user is accessing their own data or is an admin
  IF user_uuid = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND can_view_all_data = true
  ) THEN
    -- Get email from auth.users safely
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = user_uuid;
    
    RETURN user_email;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql; -- Removed SECURITY DEFINER

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email_safely(uuid) TO authenticated;

-- Recreate the view
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

-- Set security barrier to true for extra protection
ALTER VIEW public.user_profiles_with_email SET (security_barrier = true);

COMMENT ON VIEW public.user_profiles_with_email IS 'Secure view that safely provides user email information without SECURITY DEFINER';

-- Verify the function no longer has SECURITY DEFINER
SELECT 
  proname,
  prosecdef as has_security_definer
FROM pg_proc 
WHERE proname = 'get_user_email_safely';
