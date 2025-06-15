
-- Update the trigger function to handle existing users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    password_hash,
    full_name,
    phone,
    role,
    is_active,
    rating,
    total_jobs
  ) VALUES (
    NEW.id,
    NEW.email,
    'managed_by_supabase_auth',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'),
    true,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    phone = COALESCE(EXCLUDED.phone, users.phone),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Update the email confirmation trigger function as well
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    password_hash,
    full_name,
    phone,
    role,
    is_active,
    rating,
    total_jobs
  ) VALUES (
    NEW.id,
    NEW.email,
    'managed_by_supabase_auth',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'),
    true,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    phone = COALESCE(EXCLUDED.phone, users.phone),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = now();
  
  RETURN NEW;
END;
$$;
