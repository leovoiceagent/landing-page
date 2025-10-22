-- Fix user signup trigger to automatically create user_profiles
-- This ensures that when a new user signs up (not Google), a user_profiles record is created automatically

-- Step 1: Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_registration();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create a new improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  default_org_id uuid;
  first_name_val text;
  last_name_val text;
  full_name_val text;
BEGIN
  -- Get the default organization ID (you may need to adjust this)
  -- For now, we'll use a placeholder - you should replace this with your actual default org ID
  SELECT id INTO default_org_id FROM public.organizations LIMIT 1;
  
  -- If no organization exists, we can't create a user profile
  IF default_org_id IS NULL THEN
    RAISE WARNING 'No default organization found, cannot create user profile for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Extract name information from metadata
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', '');
  
  -- Try to split full name into first and last name
  IF full_name_val != '' THEN
    -- Simple split on first space
    first_name_val := SPLIT_PART(full_name_val, ' ', 1);
    last_name_val := CASE 
      WHEN POSITION(' ' IN full_name_val) > 0 
      THEN SUBSTRING(full_name_val FROM POSITION(' ' IN full_name_val) + 1)
      ELSE ''
    END;
  ELSE
    -- Fallback to individual fields if full name is not available
    first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  END IF;

  -- If we still don't have names, use email prefix
  IF first_name_val = '' AND last_name_val = '' THEN
    first_name_val := SPLIT_PART(NEW.email, '@', 1);
    last_name_val := 'User';
  END IF;

  -- Insert into user_profiles table
  INSERT INTO public.user_profiles (
    user_id, 
    organization_id, 
    first_name, 
    last_name, 
    email, 
    created_at,
    is_active
  )
  VALUES (
    NEW.id,
    default_org_id,
    first_name_val,
    last_name_val,
    NEW.email,
    now(),
    true
  );

  RAISE NOTICE 'Created user profile for user % with name % %', NEW.id, first_name_val, last_name_val;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_registration();

-- Step 4: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_registration() TO service_role;
GRANT INSERT ON public.user_profiles TO service_role;
GRANT SELECT ON public.organizations TO service_role;

-- Step 5: Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users'
AND event_object_schema = 'auth';

-- Step 6: Verify everything is set up correctly
-- Check that the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users'
AND event_object_schema = 'auth';

-- Check that the function exists
SELECT 
  proname as function_name,
  prosecdef as has_security_definer,
  proconfig as config_settings
FROM pg_proc 
WHERE proname = 'handle_new_user_registration'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
