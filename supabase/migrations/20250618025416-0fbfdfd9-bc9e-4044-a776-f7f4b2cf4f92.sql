
-- Create analytics views for financial calculations (Fixed syntax)
CREATE OR REPLACE VIEW analytics_financial_overview AS
WITH monthly_revenue AS (
  SELECT 
    DATE_TRUNC('month', booking_date) as month,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as revenue,
    SUM(CASE WHEN status = 'completed' THEN provider_payout ELSE 0 END) as provider_payouts,
    AVG(CASE WHEN status = 'completed' THEN total_amount END) as avg_booking_value
  FROM bookings 
  GROUP BY DATE_TRUNC('month', booking_date)
),
provider_metrics AS (
  SELECT 
    p.provider_id,
    u.full_name as provider_name,
    COUNT(*) as total_jobs,
    AVG(p.amount) as avg_payout,
    SUM(p.amount) as total_earnings,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payouts
  FROM payouts p
  JOIN users u ON p.provider_id = u.id
  GROUP BY p.provider_id, u.full_name
)
SELECT 
  mr.month,
  mr.total_bookings,
  mr.completed_bookings,
  mr.revenue,
  mr.provider_payouts,
  mr.avg_booking_value,
  (mr.revenue - mr.provider_payouts) as platform_commission
FROM monthly_revenue mr
ORDER BY mr.month DESC;

-- Create view for service profitability analysis (Fixed syntax)
CREATE OR REPLACE VIEW analytics_service_profitability AS
SELECT 
  s.id as service_id,
  s.name as service_name,
  s.service_type,
  s.coverage_areas,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
  SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN b.status = 'completed' THEN b.provider_payout ELSE 0 END) as total_payouts,
  SUM(CASE WHEN b.status = 'completed' THEN (b.total_amount - COALESCE(b.provider_payout, 0)) ELSE 0 END) as profit_margin,
  AVG(b.rating) as avg_rating,
  AVG(CASE WHEN b.status = 'completed' THEN b.total_amount END) as avg_price
FROM services s
LEFT JOIN bookings b ON s.id = b.service_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.service_type, s.coverage_areas
ORDER BY profit_margin DESC NULLS LAST;

-- Create provider performance analytics view (Fixed syntax)
CREATE OR REPLACE VIEW analytics_provider_rankings AS
SELECT 
  u.id as provider_id,
  u.full_name as provider_name,
  u.rating as overall_rating,
  u.total_jobs,
  u.service_coverage_areas,
  COUNT(b.id) as bookings_30_days,
  COUNT(CASE WHEN b.status = 'completed' THEN b.id END) as completed_30_days,
  SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END) as revenue_30_days,
  AVG(CASE WHEN b.rating IS NOT NULL THEN b.rating END) as recent_rating,
  (COUNT(CASE WHEN b.status = 'completed' THEN b.id END)::float / NULLIF(COUNT(b.id), 0)) * 100 as completion_rate
FROM users u
LEFT JOIN bookings b ON u.id = b.provider_id AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
WHERE u.role = 'provider' AND u.is_active = true
GROUP BY u.id, u.full_name, u.rating, u.total_jobs, u.service_coverage_areas
ORDER BY completion_rate DESC, recent_rating DESC NULLS LAST;

-- Create automated payout rules table
CREATE TABLE payout_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES users(id),
  rule_name VARCHAR(255) NOT NULL,
  minimum_payout_amount NUMERIC(10,2) DEFAULT 50.00,
  payout_frequency VARCHAR(20) DEFAULT 'weekly',
  payout_day INTEGER DEFAULT 5,
  auto_approve_under_amount NUMERIC(10,2) DEFAULT 500.00,
  performance_bonus_enabled BOOLEAN DEFAULT false,
  performance_bonus_threshold NUMERIC(3,2) DEFAULT 4.5,
  performance_bonus_percentage NUMERIC(5,2) DEFAULT 5.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automated payout batches table
CREATE TABLE automated_payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR(255) NOT NULL,
  batch_type VARCHAR(50) DEFAULT 'scheduled',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payout_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_date DATE,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  processed_by UUID REFERENCES users(id),
  approval_notes TEXT,
  processing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create customer analytics table
CREATE TABLE customer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id) UNIQUE,
  first_booking_date DATE,
  last_booking_date DATE,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  avg_booking_value NUMERIC(10,2) DEFAULT 0,
  avg_rating_given NUMERIC(3,2) DEFAULT 0,
  preferred_services TEXT[],
  preferred_locations TEXT[],
  customer_lifetime_value NUMERIC(12,2) DEFAULT 0,
  churn_risk_score NUMERIC(3,2) DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create revenue forecasts table
CREATE TABLE revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  forecast_type VARCHAR(50) NOT NULL,
  service_id UUID REFERENCES services(id),
  location VARCHAR(100),
  predicted_revenue NUMERIC(12,2) NOT NULL,
  predicted_bookings INTEGER NOT NULL,
  confidence_level NUMERIC(3,2) DEFAULT 0.75,
  factors JSONB DEFAULT '{}',
  actual_revenue NUMERIC(12,2),
  actual_bookings INTEGER,
  accuracy_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stored procedure for revenue forecasting
CREATE OR REPLACE FUNCTION calculate_revenue_forecast(
  forecast_months INTEGER DEFAULT 3,
  service_id_filter UUID DEFAULT NULL
) RETURNS TABLE(
  month DATE,
  predicted_revenue NUMERIC,
  predicted_bookings INTEGER,
  confidence_level NUMERIC,
  growth_trend NUMERIC
) 
LANGUAGE plpgsql AS $$
DECLARE
  historical_data RECORD;
  seasonal_factor NUMERIC;
  trend_factor NUMERIC;
BEGIN
  FOR historical_data IN
    SELECT 
      DATE_TRUNC('month', booking_date) as booking_month,
      COUNT(*) as bookings,
      SUM(total_amount) as revenue,
      EXTRACT(MONTH FROM booking_date) as month_num
    FROM bookings 
    WHERE status = 'completed'
      AND booking_date >= CURRENT_DATE - INTERVAL '12 months'
      AND (service_id_filter IS NULL OR service_id = service_id_filter)
    GROUP BY DATE_TRUNC('month', booking_date), EXTRACT(MONTH FROM booking_date)
    ORDER BY booking_month
  LOOP
    seasonal_factor := 1.0 + (RANDOM() - 0.5) * 0.2;
    trend_factor := 1.05;
    
    RETURN QUERY SELECT
      historical_data.booking_month + INTERVAL '1 month' * forecast_months,
      (historical_data.revenue * seasonal_factor * trend_factor)::NUMERIC,
      (historical_data.bookings * seasonal_factor * trend_factor)::INTEGER,
      0.75::NUMERIC,
      ((trend_factor - 1) * 100)::NUMERIC;
  END LOOP;
END;
$$;

-- Create stored procedure for customer lifetime value calculation
CREATE OR REPLACE FUNCTION calculate_customer_ltv(client_id_param UUID)
RETURNS NUMERIC
LANGUAGE plpgsql AS $$
DECLARE
  total_spent NUMERIC;
  booking_frequency NUMERIC;
  avg_lifespan_days NUMERIC;
  predicted_ltv NUMERIC;
BEGIN
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COUNT(*),
    EXTRACT(DAYS FROM (MAX(booking_date) - MIN(booking_date)))
  INTO total_spent, booking_frequency, avg_lifespan_days
  FROM bookings 
  WHERE client_id = client_id_param AND status = 'completed';
  
  IF avg_lifespan_days > 0 AND booking_frequency > 0 THEN
    predicted_ltv := (total_spent / booking_frequency) * (365.0 / (avg_lifespan_days / booking_frequency)) * 2;
  ELSE
    predicted_ltv := total_spent;
  END IF;
  
  RETURN predicted_ltv;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX IF NOT EXISTS idx_payouts_provider_status ON payouts(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_calculations ON bookings(booking_date, service_id, status) WHERE status = 'completed';

-- Create trigger to update customer analytics
CREATE OR REPLACE FUNCTION update_customer_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_analytics (client_id, first_booking_date, last_booking_date, total_bookings, completed_bookings, total_spent)
  VALUES (NEW.client_id, NEW.booking_date, NEW.booking_date, 1, 
          CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
          CASE WHEN NEW.status = 'completed' THEN NEW.total_amount ELSE 0 END)
  ON CONFLICT (client_id) DO UPDATE SET
    last_booking_date = GREATEST(customer_analytics.last_booking_date, NEW.booking_date),
    total_bookings = customer_analytics.total_bookings + 1,
    completed_bookings = customer_analytics.completed_bookings + 
                        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    total_spent = customer_analytics.total_spent + 
                  CASE WHEN NEW.status = 'completed' THEN NEW.total_amount ELSE 0 END,
    avg_booking_value = (customer_analytics.total_spent + 
                        CASE WHEN NEW.status = 'completed' THEN NEW.total_amount ELSE 0 END) / 
                       NULLIF(customer_analytics.completed_bookings + 
                              CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END, 0),
    customer_lifetime_value = calculate_customer_ltv(NEW.client_id),
    last_calculated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_analytics
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_analytics();
