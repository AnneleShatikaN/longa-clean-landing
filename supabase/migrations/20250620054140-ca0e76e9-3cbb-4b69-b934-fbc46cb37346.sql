
-- Clear existing data first
DELETE FROM service_usage_logs;
DELETE FROM package_entitlements;
DELETE FROM user_active_packages;
DELETE FROM pending_transactions WHERE service_id IS NOT NULL;
DELETE FROM bookings;
DELETE FROM payouts WHERE booking_id IS NOT NULL;
DELETE FROM provider_specializations;
DELETE FROM services;
DELETE FROM users WHERE role = 'provider';

-- Create service_categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name CHARACTER VARYING NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add category_id to services table
ALTER TABLE public.services 
ADD COLUMN category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL;

-- Create provider_categories junction table
CREATE TABLE public.provider_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id, category_id)
);

-- Enable RLS on new tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_categories
CREATE POLICY "Anyone can view active service categories"
  ON public.service_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage service categories"
  ON public.service_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for provider_categories
CREATE POLICY "Providers can view their own categories"
  ON public.provider_categories
  FOR SELECT
  USING (
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'client')
    )
  );

CREATE POLICY "Providers can manage their own categories"
  ON public.provider_categories
  FOR ALL
  USING (
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default service categories
INSERT INTO public.service_categories (name, description) VALUES
('Cleaning', 'Residential and commercial cleaning services'),
('Car Washing', 'Vehicle cleaning and detailing services'),
('Maintenance', 'General maintenance and repair services'),
('Gardening', 'Landscaping and garden maintenance services'),
('Plumbing', 'Plumbing repairs and installations'),
('Electrical', 'Electrical repairs and installations'),
('Painting', 'Interior and exterior painting services'),
('Appliance Repair', 'Home appliance repair and maintenance');
