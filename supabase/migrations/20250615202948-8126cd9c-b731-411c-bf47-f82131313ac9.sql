
-- Add current_work_location column to users table for providers
ALTER TABLE public.users 
ADD COLUMN current_work_location VARCHAR(100);

-- Add town/location column to bookings table for location-based filtering
ALTER TABLE public.bookings 
ADD COLUMN location_town VARCHAR(100) DEFAULT 'windhoek';

-- Update existing bookings to have a default location
UPDATE public.bookings 
SET location_town = 'windhoek' 
WHERE location_town IS NULL;

-- Create an index for better performance on location filtering
CREATE INDEX idx_bookings_location_town ON public.bookings(location_town);
CREATE INDEX idx_users_current_work_location ON public.users(current_work_location);
