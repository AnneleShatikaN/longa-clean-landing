
-- Create subscription_packages table for proper package management
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

-- Create package_service_inclusions table to define what services are in each package
CREATE TABLE IF NOT EXISTS public.package_service_inclusions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid NOT NULL REFERENCES public.subscription_packages(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity_per_package integer NOT NULL DEFAULT 1,
  provider_fee_per_job numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(package_id, service_id)
);

-- Update package_entitlements to reference the new packages table
ALTER TABLE public.package_entitlements 
DROP CONSTRAINT IF EXISTS package_entitlements_package_id_fkey;

ALTER TABLE public.package_entitlements 
ADD CONSTRAINT package_entitlements_package_id_fkey 
FOREIGN KEY (package_id) REFERENCES public.subscription_packages(id) ON DELETE CASCADE;

-- Update user_active_packages to reference the new packages table
ALTER TABLE public.user_active_packages 
DROP CONSTRAINT IF EXISTS user_active_packages_package_id_fkey;

ALTER TABLE public.user_active_packages 
ADD CONSTRAINT user_active_packages_package_id_fkey 
FOREIGN KEY (package_id) REFERENCES public.subscription_packages(id) ON DELETE CASCADE;

-- Update pending_transactions to reference the new packages table
ALTER TABLE public.pending_transactions 
DROP CONSTRAINT IF EXISTS pending_transactions_package_id_fkey;

ALTER TABLE public.pending_transactions 
ADD CONSTRAINT pending_transactions_package_id_fkey 
FOREIGN KEY (package_id) REFERENCES public.subscription_packages(id) ON DELETE CASCADE;

-- Add RLS policies for the new tables
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_service_inclusions ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all packages
CREATE POLICY "Admins can manage packages" ON public.subscription_packages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Everyone can view active packages
CREATE POLICY "Anyone can view active packages" ON public.subscription_packages
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Admins can manage package inclusions
CREATE POLICY "Admins can manage package inclusions" ON public.package_service_inclusions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Everyone can view package inclusions for active packages
CREATE POLICY "Anyone can view package inclusions" ON public.package_service_inclusions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.subscription_packages 
      WHERE id = package_id AND is_active = true
    )
  );

-- Insert default banking settings if they don't exist
INSERT INTO public.global_settings (key, value, description) VALUES
  ('banking_details', '{"businessName":"Longa Services","bankName":"","accountNumber":"","branchCode":"","swiftCode":"","accountType":"Business Current"}', 'Business banking details for payments')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.global_settings (key, value, description) VALUES
  ('payment_instructions', '{"payoutInstructions":"Please transfer funds to the account below within 2 business days of service completion.","clientPaymentInstructions":"Please deposit payment to our business account and send proof of payment via WhatsApp.","whatsappNumber":"+264 XX XXX XXXX"}', 'Payment instructions for clients and providers')
ON CONFLICT (key) DO NOTHING;

-- Create function to get financial overview with real data
CREATE OR REPLACE FUNCTION public.get_enhanced_financial_overview(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE(
  total_revenue numeric,
  total_provider_payouts numeric,
  total_expenses numeric,
  admin_profit numeric,
  total_bookings bigint,
  completed_bookings bigint,
  total_packages_sold bigint,
  avg_booking_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  date_filter_start date;
  date_filter_end date;
BEGIN
  -- Set default date range if not provided (current month)
  date_filter_start := COALESCE(start_date, DATE_TRUNC('month', CURRENT_DATE));
  date_filter_end := COALESCE(end_date, CURRENT_DATE);

  RETURN QUERY
  WITH booking_data AS (
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
      COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as revenue,
      COALESCE(SUM(provider_payout) FILTER (WHERE status = 'completed'), 0) as payouts,
      COALESCE(AVG(total_amount) FILTER (WHERE status = 'completed'), 0) as avg_value
    FROM public.bookings
    WHERE booking_date BETWEEN date_filter_start AND date_filter_end
  ),
  expense_data AS (
    SELECT COALESCE(SUM(amount), 0) as expenses
    FROM public.business_expenses
    WHERE expense_date BETWEEN date_filter_start AND date_filter_end
  ),
  package_data AS (
    SELECT COUNT(*) as packages_sold
    FROM public.pending_transactions pt
    WHERE pt.transaction_type = 'subscription'
      AND pt.status = 'approved'
      AND pt.created_at::date BETWEEN date_filter_start AND date_filter_end
  )
  SELECT 
    bd.revenue,
    bd.payouts,
    ed.expenses,
    (bd.revenue - bd.payouts - ed.expenses) as profit,
    bd.total_bookings,
    bd.completed_bookings,
    pd.packages_sold,
    bd.avg_value
  FROM booking_data bd, expense_data ed, package_data pd;
END;
$$;
