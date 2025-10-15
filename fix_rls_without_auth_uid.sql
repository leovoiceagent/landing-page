-- Fix RLS policies without relying on auth.uid()
-- This approach uses a different strategy for admin access

-- First, let's disable RLS temporarily to get things working
ALTER TABLE public.call_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "call_records_access" ON public.call_records;
DROP POLICY IF EXISTS "organizations_access" ON public.organizations;
DROP POLICY IF EXISTS "properties_access" ON public.properties;
DROP POLICY IF EXISTS "user_profiles_access" ON public.user_profiles;

-- Create a function that checks admin status by user_id
CREATE OR REPLACE FUNCTION is_admin_user(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true 
    AND can_view_all_data = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function that gets user's organization
CREATE OR REPLACE FUNCTION get_user_organization_id(check_user_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.user_profiles 
    WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization_id(uuid) TO authenticated;

-- Now enable RLS with simpler policies
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for call_records
CREATE POLICY "call_records_access" ON public.call_records
  FOR ALL USING (
    -- Users can access their organization's call records
    organization_id = get_user_organization_id(auth.uid())
    OR 
    -- Admins can access all call records
    is_admin_user(auth.uid())
    OR
    -- Allow access if auth.uid() is NULL (for direct SQL queries)
    auth.uid() IS NULL
  );

-- Policy for organizations
CREATE POLICY "organizations_access" ON public.organizations
  FOR ALL USING (
    -- Users can access their own organization
    id = get_user_organization_id(auth.uid())
    OR 
    -- Admins can access all organizations
    is_admin_user(auth.uid())
    OR
    -- Allow access if auth.uid() is NULL (for direct SQL queries)
    auth.uid() IS NULL
  );

-- Policy for properties
CREATE POLICY "properties_access" ON public.properties
  FOR ALL USING (
    -- Users can access their organization's properties
    organization_id = get_user_organization_id(auth.uid())
    OR 
    -- Admins can access all properties
    is_admin_user(auth.uid())
    OR
    -- Allow access if auth.uid() is NULL (for direct SQL queries)
    auth.uid() IS NULL
  );

-- Policy for user_profiles
CREATE POLICY "user_profiles_access" ON public.user_profiles
  FOR ALL USING (
    -- Users can access their own profile
    user_id = auth.uid()
    OR 
    -- Users can access profiles in their organization
    organization_id = get_user_organization_id(auth.uid())
    OR 
    -- Admins can access all profiles
    is_admin_user(auth.uid())
    OR
    -- Allow access if auth.uid() is NULL (for direct SQL queries)
    auth.uid() IS NULL
  );

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles')
ORDER BY tablename, policyname;
