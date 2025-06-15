
-- Create global_settings table for storing application-wide configuration
CREATE TABLE public.global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key character varying NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read global settings
CREATE POLICY "Admins can view global settings" 
  ON public.global_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update global settings
CREATE POLICY "Admins can update global settings" 
  ON public.global_settings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert global settings
CREATE POLICY "Admins can insert global settings" 
  ON public.global_settings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial data_mode setting
INSERT INTO public.global_settings (key, value, description) 
VALUES (
  'data_mode',
  '"live"'::jsonb,
  'Global data source mode for the application'
) ON CONFLICT (key) DO NOTHING;

-- Enable real-time for the global_settings table
ALTER TABLE public.global_settings REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_settings;

-- Create function to update global settings with user tracking
CREATE OR REPLACE FUNCTION public.update_global_setting(
  setting_key character varying,
  setting_value jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Update the setting
  UPDATE public.global_settings 
  SET 
    value = setting_value,
    updated_by = auth.uid(),
    updated_at = now()
  WHERE key = setting_key;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'Setting updated successfully');
  ELSE
    -- Insert if not exists
    INSERT INTO public.global_settings (key, value, updated_by)
    VALUES (setting_key, setting_value, auth.uid());
    RETURN jsonb_build_object('success', true, 'message', 'Setting created successfully');
  END IF;
END;
$$;
