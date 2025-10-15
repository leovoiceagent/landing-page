-- Create a secure email function that doesn't trigger SECURITY DEFINER linter issues
-- This approach uses a function but doesn't create a view that would trigger the linter

-- Create a simple function to get user email (no SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_user_email_simple(user_uuid uuid)
RETURNS text AS $$
DECLARE
  user_email text;
BEGIN
  -- Simple approach: just return the email if it exists
  -- This function runs with caller's permissions (no SECURITY DEFINER)
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email_simple(uuid) TO authenticated;

-- Test the function
SELECT get_user_email_simple('13ef3edf-7c5a-42bd-a8f5-0f3fd0d590eb') as test_email;
