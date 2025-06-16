
-- Add weekend job flag to bookings table
ALTER TABLE public.bookings 
ADD COLUMN is_weekend_job boolean DEFAULT false;

-- Add weekend bonus to payouts table
ALTER TABLE public.payouts 
ADD COLUMN weekend_bonus numeric DEFAULT 0;

-- Update existing bookings to set weekend flag based on booking_date
UPDATE public.bookings 
SET is_weekend_job = EXTRACT(DOW FROM booking_date) IN (0, 6)
WHERE booking_date IS NOT NULL;

-- Add weekend settings to global_settings
INSERT INTO public.global_settings (key, value, description) VALUES 
('weekend_client_markup_percentage', '20', 'Extra percentage charge for weekend bookings'),
('weekend_provider_bonus_amount', '50', 'Fixed bonus amount for providers on weekend jobs')
ON CONFLICT (key) DO NOTHING;

-- Create function to check if date is weekend in Namibian timezone
CREATE OR REPLACE FUNCTION public.is_weekend_in_namibian_timezone(check_date date)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Convert to Namibian timezone and check if Saturday (6) or Sunday (0)
  RETURN EXTRACT(DOW FROM check_date AT TIME ZONE 'Africa/Windhoek') IN (0, 6);
END;
$$;

-- Update the enhanced payout calculation function to include weekend bonus
CREATE OR REPLACE FUNCTION public.calculate_enhanced_payout(
  service_id uuid, 
  client_price numeric, 
  is_emergency boolean DEFAULT false,
  is_weekend boolean DEFAULT false
) 
RETURNS TABLE(
  gross_amount numeric, 
  platform_commission numeric, 
  tax_withheld numeric, 
  net_amount numeric,
  weekend_bonus numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
  service_record RECORD;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  gross_payout NUMERIC;
  tax_amount NUMERIC;
  bonus_amount NUMERIC := 0;
  weekend_bonus_setting NUMERIC;
BEGIN
  -- Get service configuration
  SELECT service_type, commission_percentage, provider_fee 
  INTO service_record
  FROM services 
  WHERE id = service_id;
  
  -- Get weekend bonus setting
  SELECT (value::text)::numeric INTO weekend_bonus_setting
  FROM global_settings 
  WHERE key = 'weekend_provider_bonus_amount';
  
  -- Set weekend bonus if applicable
  IF is_weekend THEN
    bonus_amount := COALESCE(weekend_bonus_setting, 50);
  END IF;
  
  -- Calculate commission rate
  IF service_record.service_type = 'subscription' THEN
    commission_amount := 50; -- Fixed NAD 50 for subscriptions
    gross_payout := service_record.provider_fee + bonus_amount;
  ELSE
    commission_rate := CASE 
      WHEN is_emergency THEN 0.20  -- 20% for emergency
      ELSE COALESCE(service_record.commission_percentage / 100, 0.15)  -- Default 15%
    END;
    commission_amount := client_price * commission_rate;
    gross_payout := client_price - commission_amount + bonus_amount;
  END IF;
  
  -- Calculate Namibian taxes (18% income tax + 10% withholding)
  tax_amount := gross_payout * 0.28; -- Combined 28%
  
  RETURN QUERY SELECT 
    gross_payout,
    commission_amount,
    tax_amount,
    gross_payout - tax_amount,
    bonus_amount;
END;
$$;

-- Update the automatic payout generation trigger to include weekend logic
CREATE OR REPLACE FUNCTION public.generate_automatic_payout()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  payout_calc RECORD;
  payment_method_id UUID;
  is_weekend_job BOOLEAN;
BEGIN
  -- Only generate payout when booking is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Check if this is a weekend job
    is_weekend_job := public.is_weekend_in_namibian_timezone(NEW.booking_date);
    
    -- Update the booking with weekend flag
    UPDATE bookings 
    SET is_weekend_job = is_weekend_job
    WHERE id = NEW.id;
    
    -- Calculate payout amounts including weekend bonus
    SELECT * INTO payout_calc 
    FROM calculate_enhanced_payout(NEW.service_id, NEW.total_amount, NEW.emergency_booking, is_weekend_job);
    
    -- Get provider's primary payment method
    SELECT id INTO payment_method_id
    FROM provider_payment_methods
    WHERE provider_id = NEW.provider_id AND is_primary = true
    LIMIT 1;
    
    -- Create payout record
    INSERT INTO payouts (
      provider_id,
      booking_id,
      gross_amount,
      platform_commission,
      tax_withheld,
      net_amount,
      weekend_bonus,
      amount, -- Keep for backward compatibility
      payment_method_id,
      payout_type,
      status,
      urgency_level
    ) VALUES (
      NEW.provider_id,
      NEW.id,
      payout_calc.gross_amount,
      payout_calc.platform_commission,
      payout_calc.tax_withheld,
      payout_calc.net_amount,
      payout_calc.weekend_bonus,
      payout_calc.net_amount,
      payment_method_id,
      'automatic',
      'pending',
      CASE WHEN NEW.emergency_booking THEN 'emergency' ELSE 'normal' END
    );
    
    -- Update booking with payout amount
    UPDATE bookings 
    SET provider_payout = payout_calc.net_amount
    WHERE id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set weekend flag on booking insert/update
CREATE OR REPLACE FUNCTION public.set_weekend_flag()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_weekend_job := public.is_weekend_in_namibian_timezone(NEW.booking_date);
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_weekend_flag ON public.bookings;
CREATE TRIGGER trigger_set_weekend_flag
  BEFORE INSERT OR UPDATE OF booking_date ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_weekend_flag();
