
-- Add is_available column to users table for provider availability status
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.users.is_available IS 'Provider availability status for receiving job assignments';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_available ON public.users(is_available) WHERE role = 'provider';
