-- Add is_active column to properties table
-- This allows properties to be marked as inactive instead of deleted

ALTER TABLE public.properties 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Create index for better performance when filtering by active status
CREATE INDEX idx_properties_is_active ON public.properties(is_active);

-- Update existing properties to be active by default
UPDATE public.properties 
SET is_active = true 
WHERE is_active IS NULL;
