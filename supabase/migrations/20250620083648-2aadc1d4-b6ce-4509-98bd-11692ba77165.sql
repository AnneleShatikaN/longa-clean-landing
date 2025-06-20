
-- Add service_address column to the bookings table
ALTER TABLE public.bookings 
ADD COLUMN service_address TEXT;

-- Update the column to be NOT NULL with a default value for existing records
UPDATE public.bookings 
SET service_address = 'Address not provided' 
WHERE service_address IS NULL;

-- Make the column NOT NULL going forward
ALTER TABLE public.bookings 
ALTER COLUMN service_address SET NOT NULL;
