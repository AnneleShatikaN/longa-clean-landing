
-- Ensure global_settings table exists and has proper constraints
CREATE TABLE IF NOT EXISTS public.global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key character varying NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all global settings"
  ON public.global_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update global settings"
  ON public.global_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default settings if they don't exist
INSERT INTO public.global_settings (key, value, description) VALUES
  ('data_mode', '"production"', 'Current data mode for the application')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.global_settings (key, value, description) VALUES
  ('weekend_provider_bonus_amount', '50', 'Weekend bonus amount for providers in NAD')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.global_settings (key, value, description) VALUES
  ('platform_commission_rate', '0.15', 'Default platform commission rate (15%)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.global_settings (key, value, description) VALUES
  ('tax_withholding_rate', '0.28', 'Combined tax withholding rate for Namibia (28%)')
ON CONFLICT (key) DO NOTHING;

