-- Add is_active column to user_profiles table
-- This allows user profiles to be marked as inactive instead of deleted

ALTER TABLE public.user_profiles 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Create index for better performance when filtering by active status
CREATE INDEX idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Update existing user profiles to be active by default
UPDATE public.user_profiles 
SET is_active = true 
WHERE is_active IS NULL;
