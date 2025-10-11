-- Automatic User Profile Creation Trigger
-- This trigger automatically creates a user_profiles record when a new user signs up
-- 
-- HOW IT WORKS:
-- 1. When a new user is created in auth.users
-- 2. This trigger automatically creates a matching record in user_profiles
-- 3. User needs to be assigned to an organization later (set organization_id = NULL initially)
-- 4. first_name and last_name are extracted from user metadata (display_name or full_name)

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name_value text;
  first_name_value text;
  last_name_value text;
BEGIN
  -- Get the full name from user metadata
  -- Try display_name first, then full_name, then fall back to email
  full_name_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1) -- Use email username as fallback
  );

  -- Split the full name into first and last name
  -- If there's a space, split on it. Otherwise, use full name as first name.
  IF position(' ' in full_name_value) > 0 THEN
    first_name_value := split_part(full_name_value, ' ', 1);
    last_name_value := substring(full_name_value from position(' ' in full_name_value) + 1);
  ELSE
    first_name_value := full_name_value;
    last_name_value := '';
  END IF;

  -- Insert into public.user_profiles
  INSERT INTO public.user_profiles (
    user_id,
    organization_id,
    first_name,
    last_name,
    is_active
  ) VALUES (
    NEW.id,
    NULL, -- Organization will be assigned by admin later
    first_name_value,
    COALESCE(NULLIF(last_name_value, ''), 'User'), -- Default to 'User' if no last name
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, service_role;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user_profile when a new user signs up';

