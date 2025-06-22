
-- Delete the current provider user to clean up the database
-- This will remove the user from both the users table and auth.users table
DELETE FROM auth.users 
WHERE id IN (
  SELECT id FROM public.users 
  WHERE role = 'provider' AND provider_category IS NULL
);

-- Also delete from users table (though cascade should handle this)
DELETE FROM public.users 
WHERE role = 'provider' AND provider_category IS NULL;
