-- Enable Row Level Security (RLS) on all tables
-- This is the safest fix since policies already exist

-- Enable RLS on call_records table
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;

-- Enable RLS on organizations table  
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled (optional - for confirmation)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('call_records', 'organizations', 'properties', 'user_profiles');
