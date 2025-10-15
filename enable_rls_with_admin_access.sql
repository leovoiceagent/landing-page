-- Enable RLS with proper admin access policies
-- This should fix all remaining "RLS disabled" security issues

-- First, ensure we're starting clean
ALTER TABLE public.call_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "call_records_access" ON public.call_records;
DROP POLICY IF EXISTS "organizations_access" ON public.organizations;
DROP POLICY IF EXISTS "properties_access" ON public.properties;
DROP POLICY IF EXISTS "user_profiles_access" ON public.user_profiles;

-- Enable RLS on all tables
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies that include admin access

-- Policy for call_records: Users see their org's data, admins see everything
CREATE POLICY "call_records_access" ON public.call_records
  FOR ALL USING (
    -- Users can access their organization's call records
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Admins can access all call records
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_view_all_data = true
    )
  );

-- Policy for organizations: Users see their org, admins see all
CREATE POLICY "organizations_access" ON public.organizations
  FOR ALL USING (
    -- Users can access their own organization
    id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Admins can access all organizations
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_view_all_data = true
    )
  );

-- Policy for properties: Users see their org's properties, admins see all
CREATE POLICY "properties_access" ON public.properties
  FOR ALL USING (
    -- Users can access their organization's properties
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Admins can access all properties
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_view_all_data = true
    )
  );

-- Policy for user_profiles: Users see their org's profiles, admins see all
CREATE POLICY "user_profiles_access" ON public.user_profiles
  FOR ALL USING (
    -- Users can access their own profile
    user_id = auth.uid()
    OR 
    -- Users can access profiles in their organization
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Admins can access all profiles
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_view_all_data = true
    )
  );

-- Verify all policies are created and RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles')
ORDER BY tablename;

-- Show the policies that were created
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles')
ORDER BY tablename, policyname;
