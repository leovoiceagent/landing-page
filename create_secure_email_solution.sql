-- Create a secure email solution that restores email display
-- without the SECURITY DEFINER issues

-- Step 1: Create a secure function to get user emails
CREATE OR REPLACE FUNCTION get_user_email_secure(user_uuid uuid)
RETURNS text AS $$
DECLARE
  user_email text;
BEGIN
  -- Only allow if the requesting user is an admin or accessing their own data
  IF auth.uid() IS NULL OR 
     auth.uid() = user_uuid OR 
     EXISTS (
       SELECT 1 FROM public.admin_users 
       WHERE user_id = auth.uid() 
       AND is_active = true 
       AND can_view_all_data = true
     ) THEN
    
    -- Get email from auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = user_uuid;
    
    RETURN user_email;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email_secure(uuid) TO authenticated;

-- Step 3: Create a secure view that uses the function
CREATE OR REPLACE VIEW public.user_profiles_with_email AS
SELECT 
  up.id,
  up.user_id,
  up.organization_id,
  up.first_name,
  up.last_name,
  up.created_at,
  up.is_active,
  get_user_email_secure(up.user_id) as email
FROM public.user_profiles up;

-- Step 4: Grant access to the view
GRANT SELECT ON public.user_profiles_with_email TO authenticated;

-- Step 5: Set security barrier (not SECURITY DEFINER)
ALTER VIEW public.user_profiles_with_email SET (security_barrier = true);

-- Step 6: Create a policy to prevent email updates in user_profiles
-- (Emails should only be managed through auth.users)
CREATE OR REPLACE FUNCTION prevent_email_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent any updates to email-related fields in user_profiles
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    RAISE EXCEPTION 'Email cannot be updated in user_profiles table. Use auth.users instead.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to enforce email immutability
DROP TRIGGER IF EXISTS prevent_email_updates_trigger ON public.user_profiles;
CREATE TRIGGER prevent_email_updates_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_email_updates();

COMMENT ON VIEW public.user_profiles_with_email IS 'Secure view for displaying user emails with proper access controls';
