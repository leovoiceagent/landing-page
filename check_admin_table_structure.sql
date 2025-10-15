-- Check the actual structure of your admin_users table
-- This will show us what columns actually exist

-- 1. Show the structure of admin_users table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- 2. Simple count of admin users (no ORDER BY)
SELECT COUNT(*) as total_admin_users FROM public.admin_users;

-- 3. Check if you're currently logged in
SELECT auth.uid() as current_user_id;

-- 4. Check if you're an admin user (simple query)
SELECT 
  user_id,
  admin_level,
  is_active,
  can_view_all_data
FROM public.admin_users 
WHERE user_id = auth.uid();

-- 5. Show all admin users (simple query, no ORDER BY)
SELECT 
  user_id,
  admin_level,
  is_active,
  can_view_all_data,
  organization_id
FROM public.admin_users;

-- 6. Check if admin_users table has RLS enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'admin_users';
