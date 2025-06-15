
-- Delete any existing user records that might be causing conflicts
-- This will clean up both the auth.users and public.users tables

-- First, delete from public.users table (this references auth.users)
DELETE FROM public.users WHERE email = 'your-admin-email@example.com';

-- Then delete from auth.users table
-- Replace 'your-admin-email@example.com' with the actual email you're trying to use
DELETE FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Optional: If you want to clean up all test users, you can also run:
-- DELETE FROM public.users WHERE role = 'admin';
-- DELETE FROM auth.users WHERE raw_user_meta_data ->> 'role' = 'admin';
