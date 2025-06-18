
-- Add missing database functions for booking management

-- Function to update booking details
CREATE OR REPLACE FUNCTION public.update_booking_details(
  p_booking_id uuid,
  p_booking_date date DEFAULT NULL,
  p_booking_time time DEFAULT NULL,
  p_service_id uuid DEFAULT NULL,
  p_total_amount numeric DEFAULT NULL,
  p_special_instructions text DEFAULT NULL,
  p_location_town character varying DEFAULT NULL,
  p_duration_minutes integer DEFAULT NULL,
  p_emergency_booking boolean DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings 
  SET 
    booking_date = COALESCE(p_booking_date, booking_date),
    booking_time = COALESCE(p_booking_time, booking_time),
    service_id = COALESCE(p_service_id, service_id),
    total_amount = COALESCE(p_total_amount, total_amount),
    special_instructions = COALESCE(p_special_instructions, special_instructions),
    location_town = COALESCE(p_location_town, location_town),
    duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
    emergency_booking = COALESCE(p_emergency_booking, emergency_booking),
    updated_at = now()
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$;

-- Function to reassign booking provider
CREATE OR REPLACE FUNCTION public.reassign_booking_provider(
  p_booking_id uuid,
  p_new_provider_id uuid,
  p_reassignment_reason text,
  p_old_provider_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the booking with new provider
  UPDATE public.bookings 
  SET 
    provider_id = p_new_provider_id,
    assigned_at = now(),
    updated_at = now()
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Log the reassignment
  INSERT INTO public.booking_assignments (
    booking_id,
    provider_id,
    assigned_by,
    assignment_reason,
    auto_assigned
  ) VALUES (
    p_booking_id,
    p_new_provider_id,
    auth.uid(),
    p_reassignment_reason,
    false
  );
END;
$$;

-- Function to rollback booking status
CREATE OR REPLACE FUNCTION public.rollback_booking_status(
  p_booking_id uuid,
  p_new_status character varying,
  p_reason text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings 
  SET 
    status = p_new_status::booking_status,
    updated_at = now()
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$;

-- Function to mark client no-show
CREATE OR REPLACE FUNCTION public.mark_client_no_show(
  p_booking_id uuid,
  p_reason text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings 
  SET 
    status = 'cancelled'::booking_status,
    updated_at = now()
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$;

-- Function to mark provider no-show
CREATE OR REPLACE FUNCTION public.mark_provider_no_show(
  p_booking_id uuid,
  p_reason text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings 
  SET 
    status = 'cancelled'::booking_status,
    provider_id = NULL,
    assigned_at = NULL,
    updated_at = now()
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$;

-- Function to cancel booking with refund
CREATE OR REPLACE FUNCTION public.cancel_booking_with_refund(
  p_booking_id uuid,
  p_reason text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings 
  SET 
    status = 'cancelled'::booking_status,
    updated_at = now()
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Here you would also create a refund record in a refunds table
  -- For now, we'll just update the booking status
END;
$$;
