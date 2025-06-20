
-- Clear existing bookings data as requested
DELETE FROM service_usage_logs;
DELETE FROM payouts WHERE booking_id IS NOT NULL;
DELETE FROM bookings;

-- Add package_id to bookings table to track package bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.subscription_packages(id) ON DELETE SET NULL;

-- Add scheduled_date to bookings for better scheduling
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS scheduled_date DATE DEFAULT CURRENT_DATE;

-- Create package_bookings table to track the parent package booking
CREATE TABLE IF NOT EXISTS public.package_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.subscription_packages(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS on package_bookings
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for package_bookings
CREATE POLICY "Users can view their own package bookings"
  ON public.package_bookings
  FOR SELECT
  USING (client_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'provider')
  ));

CREATE POLICY "Users can create their own package bookings"
  ON public.package_bookings
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can manage all package bookings"
  ON public.package_bookings
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create function to automatically assign providers based on categories
CREATE OR REPLACE FUNCTION assign_providers_by_category(
  p_service_id UUID,
  p_location TEXT DEFAULT 'windhoek'
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  service_category_id UUID;
  assigned_provider_id UUID;
BEGIN
  -- Get the service's category
  SELECT category_id INTO service_category_id
  FROM services
  WHERE id = p_service_id;
  
  -- Find available providers for this category
  SELECT u.id INTO assigned_provider_id
  FROM users u
  JOIN provider_categories pc ON u.id = pc.provider_id
  WHERE u.role = 'provider' 
    AND u.is_active = true
    AND u.is_available = true
    AND pc.category_id = service_category_id
    AND (u.service_coverage_areas IS NULL OR p_location = ANY(u.service_coverage_areas))
  ORDER BY u.rating DESC, u.total_jobs ASC
  LIMIT 1;
  
  RETURN assigned_provider_id;
END;
$$;

-- Create function to process package booking
CREATE OR REPLACE FUNCTION process_package_booking(
  p_client_id UUID,
  p_package_id UUID,
  p_scheduled_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  package_record RECORD;
  service_inclusion RECORD;
  assigned_provider_id UUID;
  booking_id UUID;
  total_bookings INTEGER := 0;
  successful_assignments INTEGER := 0;
  result JSONB;
BEGIN
  -- Get package details
  SELECT * INTO package_record
  FROM subscription_packages
  WHERE id = p_package_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Package not found');
  END IF;
  
  -- Create parent package booking record
  INSERT INTO package_bookings (client_id, package_id, total_amount, scheduled_date)
  VALUES (p_client_id, p_package_id, package_record.total_price, p_scheduled_date)
  RETURNING id INTO booking_id;
  
  -- Process each service in the package
  FOR service_inclusion IN 
    SELECT psi.*, s.name as service_name, s.category_id
    FROM package_service_inclusions psi
    JOIN services s ON psi.service_id = s.id
    WHERE psi.package_id = p_package_id
  LOOP
    -- Create bookings for each quantity
    FOR i IN 1..service_inclusion.quantity_per_package LOOP
      total_bookings := total_bookings + 1;
      
      -- Find and assign provider
      assigned_provider_id := assign_providers_by_category(service_inclusion.service_id);
      
      -- Create individual booking
      INSERT INTO bookings (
        client_id,
        provider_id,
        service_id,
        package_id,
        booking_date,
        booking_time,
        scheduled_date,
        total_amount,
        provider_payout,
        status,
        location_town
      ) VALUES (
        p_client_id,
        assigned_provider_id,
        service_inclusion.service_id,
        p_package_id,
        p_scheduled_date,
        '09:00',
        p_scheduled_date,
        0, -- No client charge for package bookings
        service_inclusion.provider_fee_per_job,
        CASE WHEN assigned_provider_id IS NOT NULL THEN 'assigned' ELSE 'unassigned' END,
        'windhoek'
      );
      
      IF assigned_provider_id IS NOT NULL THEN
        successful_assignments := successful_assignments + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'package_booking_id', booking_id,
    'total_jobs', total_bookings,
    'successful_assignments', successful_assignments,
    'unassigned_jobs', total_bookings - successful_assignments
  );
END;
$$;
