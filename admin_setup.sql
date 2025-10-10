-- Admin Management Table
-- This table allows manual assignment of admin privileges to users
-- without modifying the auth.users table created by Supabase

CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  organization_id uuid NOT NULL,
  admin_level text NOT NULL DEFAULT 'admin' CHECK (admin_level IN ('admin', 'super_admin')),
  can_manage_organizations boolean NOT NULL DEFAULT true,
  can_manage_properties boolean NOT NULL DEFAULT true,
  can_manage_users boolean NOT NULL DEFAULT true,
  can_view_all_data boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  granted_by uuid, -- References auth.users(id) of who granted admin access
  granted_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT admin_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT admin_users_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_organization_id ON public.admin_users(organization_id);
CREATE INDEX idx_admin_users_active ON public.admin_users(is_active);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own admin record
CREATE POLICY "Users can view own admin record" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only existing admins can insert new admin records
CREATE POLICY "Only admins can create admin records" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_manage_users = true
    )
  );

-- Policy: Only admins can update admin records
CREATE POLICY "Only admins can update admin records" ON public.admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND can_manage_users = true
    )
  );

-- Policy: Only super admins can delete admin records
CREATE POLICY "Only super admins can delete admin records" ON public.admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND admin_level = 'super_admin'
    )
  );

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_user_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_user_super_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true 
    AND admin_level = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's admin permissions
CREATE OR REPLACE FUNCTION get_user_admin_permissions(check_user_id uuid DEFAULT auth.uid())
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_admin_permissions(uuid) TO authenticated;
