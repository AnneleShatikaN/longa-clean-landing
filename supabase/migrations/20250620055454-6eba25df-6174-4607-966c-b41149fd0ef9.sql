
-- Clear existing package data safely
DELETE FROM service_usage_logs WHERE package_id IS NOT NULL;
DELETE FROM user_active_packages;
DELETE FROM pending_transactions WHERE package_id IS NOT NULL;

-- Clear subscription packages (this will cascade to package_service_inclusions due to foreign key)
DELETE FROM subscription_packages;

-- Update subscription_packages table structure if columns don't exist
DO $$ 
BEGIN
    -- Add total_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_packages' AND column_name = 'total_price') THEN
        ALTER TABLE public.subscription_packages ADD COLUMN total_price NUMERIC NOT NULL DEFAULT 0;
    END IF;
    
    -- Add total_provider_payout column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_packages' AND column_name = 'total_provider_payout') THEN
        ALTER TABLE public.subscription_packages ADD COLUMN total_provider_payout NUMERIC DEFAULT 0;
    END IF;
    
    -- Add gross_profit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_packages' AND column_name = 'gross_profit') THEN
        ALTER TABLE public.subscription_packages ADD COLUMN gross_profit NUMERIC DEFAULT 0;
    END IF;
    
    -- Drop created_by column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_packages' AND column_name = 'created_by') THEN
        ALTER TABLE public.subscription_packages DROP COLUMN created_by;
    END IF;
END $$;

-- Ensure package_service_inclusions table has the right structure
-- Drop and recreate to ensure clean structure
DROP TABLE IF EXISTS public.package_service_inclusions CASCADE;

CREATE TABLE public.package_service_inclusions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.subscription_packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity_per_package INTEGER NOT NULL DEFAULT 1,
  provider_fee_per_job NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(package_id, service_id)
);

-- Enable RLS on the table
ALTER TABLE public.package_service_inclusions ENABLE ROW LEVEL SECURITY;

-- RLS policies for package_service_inclusions
CREATE POLICY "Anyone can view package service inclusions"
  ON public.package_service_inclusions
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage package service inclusions"
  ON public.package_service_inclusions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
