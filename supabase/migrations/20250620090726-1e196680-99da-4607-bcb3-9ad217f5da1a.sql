
-- Add provider_category column to users table
ALTER TABLE public.users 
ADD COLUMN provider_category VARCHAR(100);

-- Create index for better performance on provider category filtering
CREATE INDEX idx_users_provider_category ON public.users(provider_category);

-- Insert some default service categories into the existing service_categories table
INSERT INTO public.service_categories (name, description) VALUES
('House Cleaner', 'Residential cleaning services including general cleaning, deep cleaning, and maintenance'),
('Car Washer', 'Vehicle cleaning and detailing services for cars, trucks, and motorcycles'),
('Carpet Cleaner', 'Specialized carpet and upholstery cleaning services'),
('Garden Maintenance', 'Landscaping, lawn care, and general garden maintenance services'),
('Appliance Repair', 'Repair and maintenance of household appliances'),
('Plumber', 'Plumbing installation, repair, and maintenance services'),
('Electrician', 'Electrical installation, repair, and maintenance services'),
('Painter', 'Interior and exterior painting services')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();
