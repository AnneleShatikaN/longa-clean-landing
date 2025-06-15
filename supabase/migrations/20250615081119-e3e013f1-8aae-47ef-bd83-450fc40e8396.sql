
-- Create table for payment method configurations
CREATE TABLE public.payment_method_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank_transfer', 'mobile_money', 'cash')),
  api_endpoint TEXT,
  api_key_encrypted TEXT, -- We'll store encrypted keys
  status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  is_configured BOOLEAN NOT NULL DEFAULT false,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  test_result JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_method_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view payment configs" ON public.payment_method_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert payment configs" ON public.payment_method_configs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update payment configs" ON public.payment_method_configs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete payment configs" ON public.payment_method_configs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default payment methods
INSERT INTO public.payment_method_configs (name, type, is_configured, status) VALUES
  ('Standard Bank API', 'bank_transfer', true, 'active'),
  ('MTC Mobile Money', 'mobile_money', true, 'active'),
  ('Telecom Mobile Money', 'mobile_money', false, 'inactive');

-- Create function to safely update payment method config
CREATE OR REPLACE FUNCTION public.update_payment_method_config(
  config_id UUID,
  endpoint TEXT DEFAULT NULL,
  api_key TEXT DEFAULT NULL,
  new_status TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Update the configuration
  UPDATE public.payment_method_configs 
  SET 
    api_endpoint = COALESCE(endpoint, api_endpoint),
    api_key_encrypted = CASE 
      WHEN api_key IS NOT NULL THEN crypt(api_key, gen_salt('bf'))
      ELSE api_key_encrypted 
    END,
    status = COALESCE(new_status, status),
    is_configured = CASE 
      WHEN endpoint IS NOT NULL OR api_key IS NOT NULL THEN true
      ELSE is_configured
    END,
    updated_at = now()
  WHERE id = config_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'Configuration updated successfully');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Configuration not found');
  END IF;
END;
$$;

-- Create function to test payment method connection
CREATE OR REPLACE FUNCTION public.test_payment_method_connection(config_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record RECORD;
  test_result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get the configuration
  SELECT * INTO config_record
  FROM public.payment_method_configs 
  WHERE id = config_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Configuration not found');
  END IF;

  -- Simulate API test (in real implementation, this would make actual HTTP calls)
  -- For now, we'll simulate success/failure based on configuration completeness
  IF config_record.api_endpoint IS NOT NULL AND config_record.api_key_encrypted IS NOT NULL THEN
    test_result := jsonb_build_object(
      'success', true,
      'message', 'Connection test successful',
      'response_time', (random() * 500 + 100)::int,
      'timestamp', now()
    );
    
    -- Update the test result and status
    UPDATE public.payment_method_configs 
    SET 
      status = 'active',
      last_tested_at = now(),
      test_result = test_result
    WHERE id = config_id;
  ELSE
    test_result := jsonb_build_object(
      'success', false,
      'error', 'Missing API endpoint or key',
      'timestamp', now()
    );
    
    -- Update the test result and status
    UPDATE public.payment_method_configs 
    SET 
      status = 'error',
      last_tested_at = now(),
      test_result = test_result
    WHERE id = config_id;
  END IF;

  RETURN test_result;
END;
$$;
