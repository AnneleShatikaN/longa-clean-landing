
-- Add emergency contact types to support_contacts table
INSERT INTO public.support_contacts (contact_type, contact_value, display_name, description, availability_hours, is_verified) VALUES
('emergency_outage', '+264 XX XXX XXXX', 'System Outage Emergency', '24/7 emergency line for system outages and critical infrastructure issues', '24/7', false),
('emergency_security', 'security@longa.com', 'Security Emergency', 'Immediate response for security breaches and suspicious activities', '24/7', true),
('emergency_payment', 'payments@longa.com', 'Payment Emergency', 'Critical payment processing issues and disputes', 'Business hours + on-call', true)
ON CONFLICT (contact_type) DO NOTHING;

-- Add a column to mark contacts as emergency if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_contacts' AND column_name = 'is_emergency') THEN
        ALTER TABLE public.support_contacts ADD COLUMN is_emergency BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update the new emergency contacts to be marked as emergency
UPDATE public.support_contacts 
SET is_emergency = true 
WHERE contact_type IN ('emergency_outage', 'emergency_security', 'emergency_payment');

-- Update the update_support_contact function to handle the new is_emergency field
CREATE OR REPLACE FUNCTION public.update_support_contact(
  p_contact_type VARCHAR(50),
  p_contact_value TEXT,
  p_display_name VARCHAR(100) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_availability_hours VARCHAR(100) DEFAULT NULL,
  p_is_emergency BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  is_valid BOOLEAN := false;
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Basic validation based on contact type
  CASE 
    WHEN p_contact_type LIKE '%email%' OR p_contact_type = 'emergency_security' OR p_contact_type = 'emergency_payment' THEN
      is_valid := p_contact_value ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    WHEN p_contact_type LIKE '%phone%' OR p_contact_type = 'emergency_outage' THEN
      is_valid := p_contact_value ~* '^\+264\s\d{2}\s\d{3}\s\d{4}$' OR p_contact_value = '+264 XX XXX XXXX';
    ELSE
      is_valid := length(trim(p_contact_value)) > 0;
  END CASE;

  -- Update the contact
  UPDATE public.support_contacts 
  SET 
    contact_value = p_contact_value,
    display_name = COALESCE(p_display_name, display_name),
    description = COALESCE(p_description, description),
    availability_hours = COALESCE(p_availability_hours, availability_hours),
    is_emergency = COALESCE(p_is_emergency, is_emergency),
    is_verified = is_valid,
    updated_at = now()
  WHERE contact_type = p_contact_type;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Contact updated successfully',
      'is_verified', is_valid
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Contact type not found');
  END IF;
END;
$function$
