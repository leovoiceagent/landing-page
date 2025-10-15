-- Fix remaining function search path warnings using ALTER FUNCTION
-- This approach modifies the existing functions directly instead of recreating them

-- Alter user_property_access function to set search_path
ALTER FUNCTION public.user_property_access(uuid, uuid) SET search_path = public;

-- Alter update_document_sync_status function to set search_path
ALTER FUNCTION public.update_document_sync_status(uuid, text) SET search_path = public;

-- Alter create_generation_job function to set search_path
ALTER FUNCTION public.create_generation_job(uuid, text, jsonb) SET search_path = public;

-- Alter handle_new_user_registration function to set search_path
ALTER FUNCTION public.handle_new_user_registration() SET search_path = public;

-- Verify the functions were updated
SELECT 
  proname as function_name,
  prosecdef as has_security_definer,
  proconfig as config_settings
FROM pg_proc 
WHERE proname IN ('user_property_access', 'update_document_sync_status', 'create_generation_job', 'handle_new_user_registration')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Also check if there are any other functions that might need fixing
SELECT 
  proname as function_name,
  CASE WHEN proconfig IS NULL THEN 'No search_path set' ELSE 'search_path configured' END as search_path_status
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND prokind = 'f'  -- Only functions, not procedures
AND proname NOT LIKE 'pg_%'  -- Exclude system functions
ORDER BY proname;
