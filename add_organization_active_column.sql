-- Add is_active column to organizations table
-- This allows organizations to be marked as inactive instead of deleted

ALTER TABLE public.organizations 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Create index for better performance when filtering by active status
CREATE INDEX idx_organizations_is_active ON public.organizations(is_active);

-- Update existing organizations to be active by default
UPDATE public.organizations 
SET is_active = true 
WHERE is_active IS NULL;
