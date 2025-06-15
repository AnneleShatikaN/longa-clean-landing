
-- More comprehensive cleanup - remove all existing users to ensure clean slate
TRUNCATE TABLE public.users RESTART IDENTITY CASCADE;

-- Also clean up auth.users table completely (this will remove all test users)
DELETE FROM auth.users;

-- Reset any sequences
SELECT setval(pg_get_serial_sequence('public.users', 'id'), 1, false);
