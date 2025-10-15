-- Fix function search path warnings using CASCADE to handle dependencies
-- This safely handles functions that are used by RLS policies

-- Drop existing functions with CASCADE to handle policy dependencies
DROP FUNCTION IF EXISTS public.user_property_access(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.user_organization_properties(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.create_or_find_organization(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_property_kb_documents(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_document_sync_status(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_generation_job(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_organization_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_registration() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_admin_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_user_super_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_admin_permissions(uuid) CASCADE;

-- Now recreate all functions with SET search_path

-- Fix user_property_access function
CREATE OR REPLACE FUNCTION public.user_property_access(user_uuid uuid, property_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.properties p ON up.organization_id = p.organization_id
    WHERE up.user_id = user_uuid AND p.id = property_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix user_organization_properties function
CREATE OR REPLACE FUNCTION public.user_organization_properties(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  organization_id uuid,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.address, p.organization_id, p.is_active, p.created_at, p.updated_at
  FROM public.properties p
  JOIN public.user_profiles up ON up.organization_id = p.organization_id
  WHERE up.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = user_uuid AND is_active = true AND admin_level = 'super_admin'
      ) THEN 'super_admin'
      WHEN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = user_uuid AND is_active = true
      ) THEN 'admin'
      ELSE 'user'
    END INTO user_role;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix create_or_find_organization function
CREATE OR REPLACE FUNCTION public.create_or_find_organization(org_name text)
RETURNS uuid AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Try to find existing organization
  SELECT id INTO org_id FROM public.organizations WHERE name = org_name LIMIT 1;
  
  -- If not found, create new one
  IF org_id IS NULL THEN
    INSERT INTO public.organizations (name, created_at, updated_at)
    VALUES (org_name, now(), now())
    RETURNING id INTO org_id;
  END IF;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true 
    AND can_view_all_data = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_property_kb_documents function
CREATE OR REPLACE FUNCTION public.get_property_kb_documents(property_uuid uuid)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  property_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT kb.id, kb.title, kb.content, kb.property_id, kb.created_at, kb.updated_at
  FROM public.kb_documents kb
  WHERE kb.property_id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_document_sync_status function
CREATE OR REPLACE FUNCTION public.update_document_sync_status(doc_id uuid, sync_status text)
RETURNS void AS $$
BEGIN
  UPDATE public.kb_documents 
  SET sync_status = sync_status, updated_at = now()
  WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix create_generation_job function
CREATE OR REPLACE FUNCTION public.create_generation_job(
  property_uuid uuid,
  job_type text,
  parameters jsonb
)
RETURNS uuid AS $$
DECLARE
  job_id uuid;
BEGIN
  INSERT INTO public.generation_jobs (property_id, job_type, parameters, status, created_at)
  VALUES (property_uuid, job_type, parameters, 'pending', now())
  RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_user_organization_id function
CREATE OR REPLACE FUNCTION public.get_user_organization_id(check_user_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.user_profiles 
    WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_new_user_registration function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_admin_users_updated_at function
CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix is_user_super_admin function
CREATE OR REPLACE FUNCTION public.is_user_super_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true 
    AND admin_level = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_user_admin_permissions function
CREATE OR REPLACE FUNCTION public.get_user_admin_permissions(check_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  is_admin boolean,
  admin_level text,
  can_manage_organizations boolean,
  can_manage_properties boolean,
  can_manage_users boolean,
  can_view_all_data boolean,
  organization_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(au.is_active, false) as is_admin,
    COALESCE(au.admin_level, 'user') as admin_level,
    COALESCE(au.can_manage_organizations, false) as can_manage_organizations,
    COALESCE(au.can_manage_properties, false) as can_manage_properties,
    COALESCE(au.can_manage_users, false) as can_manage_users,
    COALESCE(au.can_view_all_data, false) as can_view_all_data,
    COALESCE(au.organization_id, up.organization_id) as organization_id
  FROM auth.users u
  LEFT JOIN public.admin_users au ON au.user_id = u.id AND au.is_active = true
  LEFT JOIN public.user_profiles up ON up.user_id = u.id
  WHERE u.id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the RLS policies that were dropped with CASCADE
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.user_property_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_organization_properties(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_find_organization(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_property_kb_documents(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_document_sync_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_generation_job(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_admin_permissions(uuid) TO authenticated;
