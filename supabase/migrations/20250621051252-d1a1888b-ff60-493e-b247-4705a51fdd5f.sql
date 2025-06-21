
-- Create location_map table for static distance calculations
CREATE TABLE IF NOT EXISTS public.location_map (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  town TEXT NOT NULL,
  suburb_a TEXT NOT NULL,
  suburb_b TEXT NOT NULL,
  distance INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add location fields to users table for providers and clients
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS town TEXT,
ADD COLUMN IF NOT EXISTS suburb TEXT,
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 2;

-- Add location fields to bookings table for job requests
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_town TEXT,
ADD COLUMN IF NOT EXISTS client_suburb TEXT,
ADD COLUMN IF NOT EXISTS assigned_provider_id UUID REFERENCES public.users(id);

-- Create index for faster location queries
CREATE INDEX IF NOT EXISTS idx_location_map_town_suburb ON public.location_map(town, suburb_a, suburb_b);
CREATE INDEX IF NOT EXISTS idx_users_town_suburb ON public.users(town, suburb);
CREATE INDEX IF NOT EXISTS idx_bookings_location ON public.bookings(client_town, client_suburb);

-- Insert Windhoek suburb distances
INSERT INTO public.location_map (town, suburb_a, suburb_b, distance) VALUES
-- Same suburb (distance 0)
('Windhoek', 'Katutura', 'Katutura', 0),
('Windhoek', 'Wanaheda', 'Wanaheda', 0),
('Windhoek', 'Khomasdal', 'Khomasdal', 0),
('Windhoek', 'Havana', 'Havana', 0),
('Windhoek', 'Otjomuise', 'Otjomuise', 0),
('Windhoek', 'Rocky Crest', 'Rocky Crest', 0),
('Windhoek', 'Hochland Park', 'Hochland Park', 0),
('Windhoek', 'Pioneerspark', 'Pioneerspark', 0),
('Windhoek', 'Cimbebasia', 'Cimbebasia', 0),
('Windhoek', 'Olympia', 'Olympia', 0),
('Windhoek', 'Suiderhof', 'Suiderhof', 0),
('Windhoek', 'Kleine Kuppe', 'Kleine Kuppe', 0),
('Windhoek', 'Auasblick', 'Auasblick', 0),
('Windhoek', 'Eros', 'Eros', 0),
('Windhoek', 'Windhoek West', 'Windhoek West', 0),
('Windhoek', 'CBD', 'CBD', 0),

-- Adjacent suburbs (distance 1)
('Windhoek', 'Katutura', 'Wanaheda', 1),
('Windhoek', 'Wanaheda', 'Katutura', 1),
('Windhoek', 'Khomasdal', 'Havana', 1),
('Windhoek', 'Havana', 'Khomasdal', 1),
('Windhoek', 'CBD', 'Kleine Kuppe', 1),
('Windhoek', 'Kleine Kuppe', 'CBD', 1),
('Windhoek', 'Olympia', 'Eros', 1),
('Windhoek', 'Eros', 'Olympia', 1),
('Windhoek', 'Hochland Park', 'Pioneerspark', 1),
('Windhoek', 'Pioneerspark', 'Hochland Park', 1),

-- Nearby suburbs (distance 2)
('Windhoek', 'Katutura', 'Khomasdal', 2),
('Windhoek', 'Khomasdal', 'Katutura', 2),
('Windhoek', 'Wanaheda', 'Havana', 2),
('Windhoek', 'Havana', 'Wanaheda', 2),
('Windhoek', 'CBD', 'Olympia', 2),
('Windhoek', 'Olympia', 'CBD', 2),
('Windhoek', 'Eros', 'Auasblick', 2),
('Windhoek', 'Auasblick', 'Eros', 2),

-- Further suburbs (distance 3-4)
('Windhoek', 'Katutura', 'CBD', 3),
('Windhoek', 'CBD', 'Katutura', 3),
('Windhoek', 'Wanaheda', 'Olympia', 3),
('Windhoek', 'Olympia', 'Wanaheda', 3),
('Windhoek', 'Rocky Crest', 'CBD', 4),
('Windhoek', 'CBD', 'Rocky Crest', 4);

-- Insert Swakopmund suburb distances
INSERT INTO public.location_map (town, suburb_a, suburb_b, distance) VALUES
-- Same suburb (distance 0)
('Swakopmund', 'Ocean View', 'Ocean View', 0),
('Swakopmund', 'Mile 4', 'Mile 4', 0),
('Swakopmund', 'Vineta', 'Vineta', 0),
('Swakopmund', 'Kramersdorf', 'Kramersdorf', 0),
('Swakopmund', 'Swakop Central', 'Swakop Central', 0),
('Swakopmund', 'Mondesa', 'Mondesa', 0),
('Swakopmund', 'Tamariskia', 'Tamariskia', 0),
('Swakopmund', 'DRC', 'DRC', 0),

-- Adjacent suburbs (distance 1)
('Swakopmund', 'Ocean View', 'Swakop Central', 1),
('Swakopmund', 'Swakop Central', 'Ocean View', 1),
('Swakopmund', 'Vineta', 'Mondesa', 1),
('Swakopmund', 'Mondesa', 'Vineta', 1),
('Swakopmund', 'Mile 4', 'Kramersdorf', 1),
('Swakopmund', 'Kramersdorf', 'Mile 4', 1),

-- Nearby suburbs (distance 2)
('Swakopmund', 'Ocean View', 'Vineta', 2),
('Swakopmund', 'Vineta', 'Ocean View', 2),
('Swakopmund', 'Swakop Central', 'Mondesa', 2),
('Swakopmund', 'Mondesa', 'Swakop Central', 2),

-- Further suburbs (distance 3-4)
('Swakopmund', 'Tamariskia', 'Swakop Central', 3),
('Swakopmund', 'Swakop Central', 'Tamariskia', 3),
('Swakopmund', 'DRC', 'Ocean View', 4),
('Swakopmund', 'Ocean View', 'DRC', 4);

-- Insert Walvis Bay suburb distances
INSERT INTO public.location_map (town, suburb_a, suburb_b, distance) VALUES
-- Same suburb (distance 0)
('Walvis Bay', 'Meersig', 'Meersig', 0),
('Walvis Bay', 'Lagoon', 'Lagoon', 0),
('Walvis Bay', 'Town', 'Town', 0),
('Walvis Bay', 'Narraville', 'Narraville', 0),
('Walvis Bay', 'Kuisebmond', 'Kuisebmond', 0),
('Walvis Bay', 'Tutaleni', 'Tutaleni', 0),

-- Adjacent suburbs (distance 1)
('Walvis Bay', 'Town', 'Lagoon', 1),
('Walvis Bay', 'Lagoon', 'Town', 1),
('Walvis Bay', 'Meersig', 'Town', 1),
('Walvis Bay', 'Town', 'Meersig', 1),
('Walvis Bay', 'Narraville', 'Kuisebmond', 1),
('Walvis Bay', 'Kuisebmond', 'Narraville', 1),

-- Nearby suburbs (distance 2)
('Walvis Bay', 'Meersig', 'Lagoon', 2),
('Walvis Bay', 'Lagoon', 'Meersig', 2),
('Walvis Bay', 'Town', 'Narraville', 2),
('Walvis Bay', 'Narraville', 'Town', 2),

-- Further suburbs (distance 3-4)
('Walvis Bay', 'Tutaleni', 'Town', 3),
('Walvis Bay', 'Town', 'Tutaleni', 3),
('Walvis Bay', 'Meersig', 'Kuisebmond', 4),
('Walvis Bay', 'Kuisebmond', 'Meersig', 4);

-- Create function for automatic job assignment
CREATE OR REPLACE FUNCTION public.assign_job_to_provider(booking_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  job_record RECORD;
  provider_record RECORD;
  assigned_provider_id UUID;
  min_distance INTEGER;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM public.bookings WHERE id = booking_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Find available providers in the same town
  FOR provider_record IN
    SELECT DISTINCT u.id, u.town, u.suburb, u.max_distance
    FROM public.users u
    WHERE u.role = 'provider' 
      AND u.is_active = true 
      AND u.is_available = true
      AND u.verification_status = 'verified'
      AND u.town = job_record.client_town
    ORDER BY u.rating DESC, u.total_jobs ASC
  LOOP
    -- Check distance between provider and client
    SELECT lm.distance INTO min_distance
    FROM public.location_map lm
    WHERE lm.town = job_record.client_town
      AND lm.suburb_a = provider_record.suburb
      AND lm.suburb_b = job_record.client_suburb;
    
    -- If distance is within provider's max_distance, assign job
    IF min_distance IS NOT NULL AND min_distance <= provider_record.max_distance THEN
      assigned_provider_id := provider_record.id;
      
      -- Update booking with assigned provider
      UPDATE public.bookings 
      SET assigned_provider_id = assigned_provider_id,
          assignment_status = 'auto_assigned',
          status = 'assigned'::booking_status,
          assigned_at = now()
      WHERE id = booking_id;
      
      RETURN assigned_provider_id;
    END IF;
  END LOOP;
  
  -- No providers found within distance, mark for manual assignment
  UPDATE public.bookings 
  SET assignment_status = 'manual_assignment_required',
      status = 'pending'::booking_status
  WHERE id = booking_id;
  
  RETURN NULL;
END;
$$;

-- Create trigger to auto-assign jobs when created
CREATE OR REPLACE FUNCTION public.trigger_auto_job_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only trigger on INSERT of new bookings
  IF TG_OP = 'INSERT' THEN
    PERFORM public.assign_job_to_provider(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS auto_assign_job_trigger ON public.bookings;
CREATE TRIGGER auto_assign_job_trigger
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_job_assignment();
