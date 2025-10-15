-- Simple admin check - no complex queries
-- Run this to see your current admin status

-- 1. Check if you have any admin users at all
SELECT COUNT(*) as total_admin_users FROM public.admin_users;

-- 2. Check if you're currently logged in
SELECT auth.uid() as current_user_id;

-- 3. Check if you're an admin user
SELECT 
  user_id,
  admin_level,
  is_active,
  can_view_all_data
FROM public.admin_users 
WHERE user_id = auth.uid();

-- 4. Show all admin users (if any exist)
SELECT 
  user_id,
  admin_level,
  is_active,
  can_view_all_data,
  organization_id
FROM public.admin_users;

-- 5. Check if admin_users table has RLS enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'admin_users';
