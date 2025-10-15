-- IMMEDIATE ROLLBACK: Disable RLS to restore admin panel access
-- Run this immediately to fix the admin access issue

-- Disable RLS on all tables
ALTER TABLE public.call_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop the policies that aren't working
DROP POLICY IF EXISTS "call_records_access" ON public.call_records;
DROP POLICY IF EXISTS "organizations_access" ON public.organizations;
DROP POLICY IF EXISTS "properties_access" ON public.properties;
DROP POLICY IF EXISTS "user_profiles_access" ON public.user_profiles;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles');
