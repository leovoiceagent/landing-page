-- Add foreign key constraint between admin_users and user_profiles
-- This allows PostgREST to perform proper joins

-- First, ensure we have the admin_users table with the correct structure
-- The admin_users table should reference user_profiles through a composite key

-- Add foreign key from admin_users.user_id to user_profiles.user_id
-- Note: This assumes both tables have user_id columns that should be linked
ALTER TABLE public.admin_users
DROP CONSTRAINT IF EXISTS admin_users_user_id_fkey;

ALTER TABLE public.admin_users
ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Optional: If you want to also link through user_profiles
-- ALTER TABLE public.admin_users
-- ADD CONSTRAINT admin_users_user_profile_fkey 
-- FOREIGN KEY (user_id) 
-- REFERENCES public.user_profiles(user_id) 
-- ON DELETE CASCADE;

-- Add comment
COMMENT ON CONSTRAINT admin_users_user_id_fkey ON public.admin_users 
IS 'Foreign key linking admin_users to auth.users';
