-- ROLLBACK: Disable Row Level Security to restore functionality
-- Run this immediately to fix the admin access issue

-- Disable RLS on call_records table
ALTER TABLE public.call_records DISABLE ROW LEVEL SECURITY;

-- Disable RLS on organizations table  
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on properties table
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_profiles table
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (optional - for confirmation)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles');
