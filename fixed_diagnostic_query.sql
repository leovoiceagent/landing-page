-- Fixed diagnostic query using the correct column names
-- Based on your actual admin_users table structure

-- Check if there are any admin users
SELECT 
  'Admin Users Count' as check_type,
  COUNT(*) as count,
  '' as details
FROM public.admin_users
WHERE is_active = true

UNION ALL

-- Check current user's admin status
SELECT 
  'Current User Admin Status' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  ) THEN 1 ELSE 0 END as count,
  COALESCE(auth.uid()::text, 'No auth.uid()') as details

UNION ALL

-- Check if current user has admin permissions
SELECT 
  'Current User Admin Permissions' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND can_view_all_data = true
  ) THEN 1 ELSE 0 END as count,
  '' as details

UNION ALL

-- Check all admin users (using created_at which exists)
SELECT 
  'Admin User Details' as check_type,
  ROW_NUMBER() OVER (ORDER BY created_at) as count,
  CONCAT(
    'User: ', user_id, 
    ', Org: ', organization_id,
    ', Level: ', admin_level,
    ', Active: ', is_active,
    ', Can View All: ', can_view_all_data
  ) as details
FROM public.admin_users
ORDER BY created_at
LIMIT 5;

-- Check if RLS is enabled on admin_users
SELECT 
  'RLS Status on admin_users' as check_type,
  CASE WHEN rowsecurity THEN 1 ELSE 0 END as count,
  'RLS ' || CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as details
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'admin_users';
