
-- Create table for business expenses
CREATE TABLE public.business_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric NOT NULL,
  category character varying NOT NULL,
  description text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on business_expenses table
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Only admins can manage business expenses" ON public.business_expenses
  FOR ALL USING (get_current_user_role() = 'admin');

-- Create function to get financial overview
CREATE OR REPLACE FUNCTION public.get_financial_overview(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
) RETURNS TABLE(
  total_revenue numeric,
  total_provider_payouts numeric,
  total_expenses numeric,
  admin_profit numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  date_filter_start date;
  date_filter_end date;
BEGIN
  -- Set default date range if not provided
  date_filter_start := COALESCE(start_date, DATE_TRUNC('month', CURRENT_DATE));
  date_filter_end := COALESCE(end_date, CURRENT_DATE);

  RETURN QUERY
  WITH revenue_data AS (
    SELECT 
      COALESCE(SUM(total_amount), 0) as revenue,
      COALESCE(SUM(provider_payout), 0) as payouts
    FROM public.bookings
    WHERE status = 'completed'
      AND booking_date BETWEEN date_filter_start AND date_filter_end
  ),
  expense_data AS (
    SELECT COALESCE(SUM(amount), 0) as expenses
    FROM public.business_expenses
    WHERE expense_date BETWEEN date_filter_start AND date_filter_end
  )
  SELECT 
    rd.revenue,
    rd.payouts,
    ed.expenses,
    (rd.revenue - rd.payouts - ed.expenses) as profit
  FROM revenue_data rd, expense_data ed;
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_business_expenses_date ON public.business_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_business_expenses_category ON public.business_expenses(category);
