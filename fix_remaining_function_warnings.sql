-- Fix the remaining 4 function search path warnings
-- These functions didn't get updated in the previous script

-- Fix user_property_access function
CREATE OR REPLACE FUNCTION public.user_property_access(user_uuid uuid, property_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.properties p ON up.organization_id = p.organization_id
    WHERE up.user_id = user_uuid AND p.id = property_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_document_sync_status function
CREATE OR REPLACE FUNCTION public.update_document_sync_status(doc_id uuid, sync_status text)
RETURNS void AS $$
BEGIN
  UPDATE public.kb_documents 
  SET sync_status = sync_status, updated_at = now()
  WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix create_generation_job function
CREATE OR REPLACE FUNCTION public.create_generation_job(
  property_uuid uuid,
  job_type text,
  parameters jsonb
)
RETURNS uuid AS $$
DECLARE
  job_id uuid;
BEGIN
  INSERT INTO public.generation_jobs (property_id, job_type, parameters, status, created_at)
  VALUES (property_uuid, job_type, parameters, 'pending', now())
  RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_new_user_registration function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.user_property_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_document_sync_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_generation_job(uuid, text, jsonb) TO authenticated;

-- Verify the functions were updated
SELECT 
  proname as function_name,
  prosecdef as has_security_definer,
  proconfig as config_settings
FROM pg_proc 
WHERE proname IN ('user_property_access', 'update_document_sync_status', 'create_generation_job', 'handle_new_user_registration')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
