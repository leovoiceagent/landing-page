-- Fix RLS with proper admin policies
-- This enables RLS but includes admin users in all policies

-- First, rollback the current broken state
ALTER TABLE public.call_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "call_records_access" ON public.call_records;
DROP POLICY IF EXISTS "organizations_access" ON public.organizations;
DROP POLICY IF EXISTS "properties_access" ON public.properties;
DROP POLICY IF EXISTS "user_profiles_access" ON public.user_profiles;

-- Now enable RLS and create proper policies that include admin users

-- Enable RLS on all tables
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for call_records
CREATE POLICY "call_records_access" ON public.call_records
  FOR ALL USING (
    -- Users can access their organization's data
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Admins can access all data
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_view_all_data = true
    )
  );

-- Create policies for organizations
CREATE POLICY "organizations_access" ON public.organizations
  FOR ALL USING (
    -- Users can access their organization
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

-- Create policies for properties
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

-- Create policies for user_profiles
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

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles')
ORDER BY tablename, policyname;
