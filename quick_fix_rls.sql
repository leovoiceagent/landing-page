-- Quick fix for RLS recursion issue
-- This disables RLS temporarily so you can test the admin panel

-- Disable RLS on all tables to prevent recursion
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_records DISABLE ROW LEVEL SECURITY;

-- Keep RLS on admin_users but with simple policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on admin_users
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can create admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can update admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Only super admins can delete admin records" ON public.admin_users;

-- Create simple, non-recursive policies
CREATE POLICY "Simple admin access" ON public.admin_users
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant all permissions
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.call_records TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
