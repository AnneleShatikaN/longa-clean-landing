
-- Add recurring booking fields to existing bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS recurring_parent_id uuid REFERENCES public.bookings(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS recurring_frequency text; -- 'weekly', 'bi-weekly', 'monthly'
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS recurring_day_of_week integer; -- 0-6 for Sunday-Saturday
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS recurring_end_date date;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_auto_scheduled boolean DEFAULT false;

-- Create recurring_booking_schedules table to track scheduled future bookings
CREATE TABLE IF NOT EXISTS public.recurring_booking_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  service_id uuid NOT NULL REFERENCES public.services(id),
  frequency text NOT NULL, -- 'weekly', 'bi-weekly', 'monthly'
  day_of_week integer, -- 0-6 for Sunday-Saturday
  booking_time time NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  special_instructions text,
  emergency_booking boolean DEFAULT false,
  duration_minutes integer,
  location_town character varying DEFAULT 'windhoek',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.recurring_booking_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_booking_schedules
CREATE POLICY "Users can view their own recurring schedules" 
  ON public.recurring_booking_schedules 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own recurring schedules" 
  ON public.recurring_booking_schedules 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recurring schedules" 
  ON public.recurring_booking_schedules 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own recurring schedules" 
  ON public.recurring_booking_schedules 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Fixed function to generate next recurring booking dates
CREATE OR REPLACE FUNCTION public.get_next_recurring_dates(
  p_start_date date,
  p_frequency text,
  p_day_of_week integer,
  p_months_ahead integer DEFAULT 3
)
RETURNS TABLE(booking_date date)
LANGUAGE plpgsql
AS $$
DECLARE
  current_date date := p_start_date;
  end_date date := p_start_date + (p_months_ahead || ' months')::interval;
BEGIN
  WHILE current_date <= end_date LOOP
    booking_date := current_date;
    RETURN NEXT;
    
    -- Calculate next date based on frequency
    IF p_frequency = 'weekly' THEN
      current_date := current_date + interval '7 days';
    ELSIF p_frequency = 'bi-weekly' THEN
      current_date := current_date + interval '14 days';
    ELSIF p_frequency = 'monthly' THEN
      current_date := current_date + interval '1 month';
    END IF;
  END LOOP;
END;
$$;

-- Function to automatically create recurring bookings
CREATE OR REPLACE FUNCTION public.create_recurring_bookings(schedule_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  schedule_record RECORD;
  next_date date;
  booking_count integer := 0;
  max_bookings integer := 12; -- Limit to 12 future bookings
BEGIN
  -- Get the schedule details
  SELECT * INTO schedule_record
  FROM public.recurring_booking_schedules
  WHERE id = schedule_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Schedule not found');
  END IF;
  
  -- Create bookings for the next few months
  FOR next_date IN 
    SELECT bd.booking_date 
    FROM get_next_recurring_dates(
      schedule_record.start_date, 
      schedule_record.frequency, 
      schedule_record.day_of_week,
      3 -- 3 months ahead
    ) bd
  LOOP
    -- Only create if we haven't hit the limit and date hasn't passed
    IF booking_count < max_bookings AND next_date >= CURRENT_DATE THEN
      INSERT INTO public.bookings (
        client_id,
        service_id,
        booking_date,
        booking_time,
        special_instructions,
        emergency_booking,
        duration_minutes,
        location_town,
        is_recurring,
        recurring_parent_id,
        recurring_frequency,
        recurring_day_of_week,
        is_auto_scheduled,
        status,
        total_amount
      )
      SELECT 
        schedule_record.user_id,
        schedule_record.service_id,
        next_date,
        schedule_record.booking_time,
        schedule_record.special_instructions,
        schedule_record.emergency_booking,
        schedule_record.duration_minutes,
        schedule_record.location_town,
        true,
        schedule_record.parent_booking_id,
        schedule_record.frequency,
        schedule_record.day_of_week,
        true,
        'pending',
        s.client_price
      FROM services s 
      WHERE s.id = schedule_record.service_id;
      
      booking_count := booking_count + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true, 
    'bookings_created', booking_count,
    'schedule_id', schedule_id
  );
END;
$$;

-- Trigger to send notifications for recurring bookings
CREATE OR REPLACE FUNCTION public.notify_recurring_booking()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  service_name VARCHAR;
BEGIN
  -- Only for recurring bookings
  IF NEW.is_recurring = true AND TG_OP = 'INSERT' THEN
    -- Get service name
    SELECT s.name INTO service_name FROM services s WHERE s.id = NEW.service_id;
    
    -- Notify client
    PERFORM send_notification(
      NEW.client_id,
      'recurring_booking_created',
      'Recurring Booking Scheduled',
      'Your recurring ' || service_name || ' booking has been scheduled for ' || NEW.booking_date || ' at ' || NEW.booking_time,
      jsonb_build_object('booking_id', NEW.id, 'is_recurring', true),
      NEW.id,
      'normal'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for recurring booking notifications
DROP TRIGGER IF EXISTS trigger_notify_recurring_booking ON public.bookings;
CREATE TRIGGER trigger_notify_recurring_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_recurring_booking();
