-- Modify user_profiles to allow NULL organization_id
-- This is needed for the automatic user profile creation
-- New users will have organization_id = NULL until admin assigns them to an organization

-- Remove the NOT NULL constraint from organization_id
ALTER TABLE public.user_profiles 
ALTER COLUMN organization_id DROP NOT NULL;

-- Add a comment explaining the NULL value
COMMENT ON COLUMN public.user_profiles.organization_id IS 'Organization ID - NULL if user has not been assigned to an organization yet';

-- Optional: Add an index for faster queries of unassigned users
CREATE INDEX IF NOT EXISTS idx_user_profiles_unassigned 
ON public.user_profiles(organization_id) 
WHERE organization_id IS NULL;

COMMENT ON INDEX idx_user_profiles_unassigned IS 'Index for finding users not yet assigned to an organization';

