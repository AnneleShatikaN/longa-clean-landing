
-- Remove user from public.users table first (due to foreign key relationships)
DELETE FROM public.users WHERE email = 'annele66hilya@gmail.com';

-- Remove user from auth.users table
DELETE FROM auth.users WHERE email = 'annele66hilya@gmail.com';

-- Also clean up any related data that might reference this user
-- Remove any pending transactions
DELETE FROM public.pending_transactions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'annele66hilya@gmail.com'
);

-- Remove any bookings as client
DELETE FROM public.bookings WHERE client_id IN (
  SELECT id FROM auth.users WHERE email = 'annele66hilya@gmail.com'
);

-- Remove any bookings as provider
DELETE FROM public.bookings WHERE provider_id IN (
  SELECT id FROM auth.users WHERE email = 'annele66hilya@gmail.com'
);

-- Remove any notifications
DELETE FROM public.notifications WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'annele66hilya@gmail.com'
);

-- Note: Run the auth.users deletion last after cleaning up references
DELETE FROM auth.users WHERE email = 'annele66hilya@gmail.com';
