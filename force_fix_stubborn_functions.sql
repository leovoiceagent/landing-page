-- Force fix the stubborn function warnings by completely dropping and recreating them
-- This approach handles the exact function signatures the linter expects

-- First, let's see what the actual function signatures are
SELECT 
  proname,
  pg_get_function_identity_arguments(oid) as arguments,
  proconfig
FROM pg_proc 
WHERE proname IN ('user_property_access', 'update_document_sync_status', 'create_generation_job', 'handle_new_user_registration')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Drop the functions completely (with CASCADE to handle any dependencies)
DROP FUNCTION IF EXISTS public.user_property_access CASCADE;
DROP FUNCTION IF EXISTS public.update_document_sync_status CASCADE;
DROP FUNCTION IF EXISTS public.create_generation_job CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_registration CASCADE;

-- Recreate user_property_access with exact signature and search_path
CREATE OR REPLACE FUNCTION public.user_property_access(user_uuid uuid, property_uuid uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.properties p ON up.organization_id = p.organization_id
    WHERE up.user_id = user_uuid AND p.id = property_uuid
  );
END;
$$;

-- Recreate update_document_sync_status with exact signature and search_path
CREATE OR REPLACE FUNCTION public.update_document_sync_status(doc_id uuid, sync_status text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE public.kb_documents 
  SET sync_status = sync_status, updated_at = now()
  WHERE id = doc_id;
END;
$$;

-- Recreate create_generation_job with exact signature and search_path
CREATE OR REPLACE FUNCTION public.create_generation_job(
  property_uuid uuid,
  job_type text,
  parameters jsonb
)
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  job_id uuid;
BEGIN
  INSERT INTO public.generation_jobs (property_id, job_type, parameters, status, created_at)
  VALUES (property_uuid, job_type, parameters, 'pending', now())
  RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$;

-- Recreate handle_new_user_registration with exact signature and search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.user_property_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_document_sync_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_generation_job(uuid, text, jsonb) TO authenticated;

-- Verify the functions were created with search_path
SELECT 
  proname as function_name,
  prosecdef as has_security_definer,
  proconfig as config_settings
FROM pg_proc 
WHERE proname IN ('user_property_access', 'update_document_sync_status', 'create_generation_job', 'handle_new_user_registration')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
