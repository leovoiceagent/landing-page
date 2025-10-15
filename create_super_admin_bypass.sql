-- Create a super admin bypass for RLS policies
-- This allows us to have RLS enabled but bypass it for super admins

-- First, let's see what user you're currently logged in as
-- Run this query to get your current user ID:
SELECT 
  'Current User ID' as info,
  auth.uid()::text as user_id;

-- If you have a user ID, we can create a super admin record
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from above query
-- You'll need to also get an organization_id from your organizations table

-- Example (replace with your actual values):
/*
INSERT INTO public.admin_users (
  user_id, 
  organization_id, 
  admin_level, 
  can_manage_organizations, 
  can_manage_properties, 
  can_manage_users, 
  can_view_all_data, 
  is_active
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'YOUR_ORG_ID_HERE',   -- Replace with your actual organization ID
  'super_admin',
  true,
  true, 
  true,
  true,
  true
);
*/

-- Alternative: Create a function that bypasses RLS for super admins
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if current user is a super admin
  -- This function runs with SECURITY DEFINER so it can bypass RLS
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND admin_level = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- Test the function
SELECT is_super_admin() as am_i_super_admin;
