-- Make the current user a super admin
-- This will ensure you have admin access for RLS policies

-- First, let's see your current user ID
SELECT auth.uid() as your_user_id;

-- Get an organization ID to assign to the admin user
-- (We'll use the first organization in your system)
SELECT id as organization_id, name 
FROM public.organizations 
LIMIT 1;

-- Insert yourself as a super admin (replace YOUR_USER_ID and YOUR_ORG_ID with actual values)
-- You'll need to run this with your actual user ID and organization ID from the queries above
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
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID from above
  'YOUR_ORG_ID_HERE',   -- Replace with your actual organization ID from above
  'super_admin',
  true,
  true, 
  true,
  true,
  true
) ON CONFLICT (user_id) DO UPDATE SET
  admin_level = 'super_admin',
  can_manage_organizations = true,
  can_manage_properties = true,
  can_manage_users = true,
  can_view_all_data = true,
  is_active = true;
*/

-- Alternative: Update existing admin user to super_admin
-- (This updates you if you're already an admin but not super_admin)
UPDATE public.admin_users 
SET 
  admin_level = 'super_admin',
  can_manage_organizations = true,
  can_manage_properties = true,
  can_manage_users = true,
  can_view_all_data = true,
  is_active = true
WHERE user_id = auth.uid();

-- Verify the update worked
SELECT 
  user_id,
  admin_level,
  is_active,
  can_view_all_data,
  organization_id
FROM public.admin_users 
WHERE user_id = auth.uid();
