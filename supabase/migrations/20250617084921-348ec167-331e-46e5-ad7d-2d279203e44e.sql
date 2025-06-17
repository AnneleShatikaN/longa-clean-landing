
-- First, let's create some real subscription packages in the database
INSERT INTO public.subscription_packages (name, description, price, duration_days, is_active) VALUES
('Basic Package', 'Perfect for occasional service needs with essential cleaning services', 299, 30, true),
('Premium Package', 'Most popular choice for regular users with comprehensive cleaning and maintenance', 599, 30, true),
('Enterprise Package', 'Unlimited access for businesses with all services and priority support', 1199, 30, true);

-- Get the package IDs for creating entitlements (we'll need to reference these)
-- We'll create entitlements for cleaning services (assuming they exist in services table)

-- Create package entitlements for Basic Package (2 cleanings per month)
INSERT INTO public.package_entitlements (package_id, allowed_service_id, quantity_per_cycle, cycle_days)
SELECT sp.id, s.id, 2, 30
FROM public.subscription_packages sp, public.services s
WHERE sp.name = 'Basic Package' 
AND s.name ILIKE '%clean%' 
AND s.service_type = 'one-off'
LIMIT 2;

-- Create package entitlements for Premium Package (4 cleanings + 2 maintenance per month)
INSERT INTO public.package_entitlements (package_id, allowed_service_id, quantity_per_cycle, cycle_days)
SELECT sp.id, s.id, 
CASE 
  WHEN s.name ILIKE '%clean%' THEN 4
  ELSE 2
END, 30
FROM public.subscription_packages sp, public.services s
WHERE sp.name = 'Premium Package' 
AND (s.name ILIKE '%clean%' OR s.name ILIKE '%maintenance%' OR s.name ILIKE '%repair%')
AND s.service_type = 'one-off'
LIMIT 4;

-- Create package entitlements for Enterprise Package (unlimited - set high numbers)
INSERT INTO public.package_entitlements (package_id, allowed_service_id, quantity_per_cycle, cycle_days)
SELECT sp.id, s.id, 999, 30
FROM public.subscription_packages sp, public.services s
WHERE sp.name = 'Enterprise Package' 
AND s.service_type = 'one-off'
AND s.is_active = true;

-- Update the PaymentFlow to handle package purchases properly
-- Create a function to activate package after payment approval
CREATE OR REPLACE FUNCTION public.activate_user_package(
  p_user_id uuid,
  p_package_id uuid,
  p_duration_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  package_record RECORD;
BEGIN
  -- Get package details
  SELECT * INTO package_record
  FROM public.subscription_packages
  WHERE id = p_package_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Package not found');
  END IF;
  
  -- Deactivate any existing active packages for this user
  UPDATE public.user_active_packages
  SET status = 'expired'
  WHERE user_id = p_user_id AND status = 'active';
  
  -- Create new active package
  INSERT INTO public.user_active_packages (
    user_id,
    package_id,
    start_date,
    expiry_date,
    status
  ) VALUES (
    p_user_id,
    p_package_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day' * p_duration_days,
    'active'
  );
  
  -- Send activation notification
  PERFORM send_notification(
    p_user_id,
    'package_activated',
    'Package Activated!',
    'Your ' || package_record.name || ' has been activated and is ready to use.',
    jsonb_build_object('package_id', p_package_id, 'package_name', package_record.name),
    NULL,
    'normal'
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Package activated successfully',
    'package_name', package_record.name
  );
END;
$$;

-- Update the approve_pending_transaction function to handle package activation
CREATE OR REPLACE FUNCTION public.approve_pending_transaction(transaction_id uuid, admin_notes_param text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  activation_result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get the transaction
  SELECT * INTO transaction_record
  FROM public.pending_transactions
  WHERE id = transaction_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found or already processed');
  END IF;

  -- Update transaction status
  UPDATE public.pending_transactions
  SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = now(),
    admin_notes = admin_notes_param,
    updated_at = now()
  WHERE id = transaction_id;

  -- Handle subscription activation
  IF transaction_record.transaction_type = 'subscription' THEN
    SELECT public.activate_user_package(
      transaction_record.user_id,
      transaction_record.package_id,
      30 -- Default 30 days
    ) INTO activation_result;
    
    IF NOT (activation_result->>'success')::boolean THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Failed to activate package: ' || (activation_result->>'error')
      );
    END IF;
  END IF;

  -- Handle booking creation (existing logic)
  IF transaction_record.transaction_type = 'booking' THEN
    INSERT INTO public.bookings (
      client_id,
      service_id,
      booking_date,
      booking_time,
      total_amount,
      special_instructions,
      emergency_booking,
      duration_minutes,
      location_town,
      status
    ) VALUES (
      transaction_record.user_id,
      transaction_record.service_id,
      (transaction_record.booking_details->>'booking_date')::date,
      (transaction_record.booking_details->>'booking_time')::time,
      transaction_record.amount,
      transaction_record.booking_details->>'special_instructions',
      (transaction_record.booking_details->>'emergency_booking')::boolean,
      (transaction_record.booking_details->>'duration_minutes')::integer,
      transaction_record.booking_details->>'location_town',
      'pending'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Transaction approved successfully',
    'transaction_type', transaction_record.transaction_type
  );
END;
$$;

-- Create function to track service usage when booking with packages
CREATE OR REPLACE FUNCTION public.use_package_service(
  p_user_id uuid,
  p_service_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  package_record RECORD;
  entitlement_record RECORD;
  usage_count INTEGER;
  result jsonb;
BEGIN
  -- Get user's active package
  SELECT uap.*, sp.name as package_name
  INTO package_record
  FROM public.user_active_packages uap
  JOIN public.subscription_packages sp ON uap.package_id = sp.id
  WHERE uap.user_id = p_user_id 
  AND uap.status = 'active'
  AND uap.expiry_date >= CURRENT_DATE
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active package found');
  END IF;
  
  -- Check if service is entitled in package
  SELECT * INTO entitlement_record
  FROM public.package_entitlements
  WHERE package_id = package_record.package_id
  AND allowed_service_id = p_service_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Service not included in your package');
  END IF;
  
  -- Check current usage in cycle
  SELECT COUNT(*) INTO usage_count
  FROM public.service_usage_logs
  WHERE user_id = p_user_id
  AND package_id = package_record.package_id
  AND allowed_service_id = p_service_id
  AND used_at >= (CURRENT_DATE - INTERVAL '1 day' * entitlement_record.cycle_days);
  
  -- Check if user has remaining quota
  IF usage_count >= entitlement_record.quantity_per_cycle THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'You have used all allocated services for this cycle',
      'used_count', usage_count,
      'allowed_count', entitlement_record.quantity_per_cycle
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Service available for booking',
    'used_count', usage_count,
    'allowed_count', entitlement_record.quantity_per_cycle,
    'remaining', entitlement_record.quantity_per_cycle - usage_count
  );
END;
$$;
