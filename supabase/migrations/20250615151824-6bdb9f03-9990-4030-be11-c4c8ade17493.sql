
-- Create support_contacts table to store editable contact information
CREATE TABLE IF NOT EXISTS public.support_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type VARCHAR(50) NOT NULL UNIQUE, -- 'email', 'phone', 'live_chat'
  contact_value TEXT NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  availability_hours VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default contact information
INSERT INTO public.support_contacts (contact_type, contact_value, display_name, description, availability_hours, is_verified) VALUES
('email', 'support@longa.com', 'Email Support', '24/7 response within 2 hours', '24/7', true),
('phone', '+264 XX XXX XXXX', 'Phone Support', 'Mon-Fri 8AM-6PM WAT', 'Mon-Fri 8AM-6PM WAT', false),
('live_chat', 'Available in app', 'Live Chat', 'Instant response during business hours', 'Business hours', true)
ON CONFLICT (contact_type) DO NOTHING;

-- Enable RLS
ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for support contacts
CREATE POLICY "Anyone can view active support contacts" ON public.support_contacts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage support contacts" ON public.support_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update contact with verification status
CREATE OR REPLACE FUNCTION public.update_support_contact(
  p_contact_type VARCHAR(50),
  p_contact_value TEXT,
  p_display_name VARCHAR(100) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_availability_hours VARCHAR(100) DEFAULT NULL
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
  CASE p_contact_type
    WHEN 'email' THEN
      is_valid := p_contact_value ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    WHEN 'phone' THEN
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
