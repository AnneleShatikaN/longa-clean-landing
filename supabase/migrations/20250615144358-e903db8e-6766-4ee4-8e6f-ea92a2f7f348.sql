
-- Create support_faqs table for FAQ management
CREATE TABLE IF NOT EXISTS public.support_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create docs_links table for documentation management
CREATE TABLE IF NOT EXISTS public.docs_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  file_type VARCHAR(50) DEFAULT 'external', -- 'external', 'pdf', 'markdown'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_faqs
CREATE POLICY "Anyone can view active FAQs" ON public.support_faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON public.support_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for docs_links
CREATE POLICY "Anyone can view active docs" ON public.docs_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage docs" ON public.docs_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert some sample documentation links
INSERT INTO public.docs_links (title, description, url, category, file_type) VALUES
('Getting Started Guide', 'Complete guide for new users', '/docs/getting-started.pdf', 'User Guides', 'pdf'),
('Booking Tutorial', 'Step-by-step booking process', '/docs/booking-tutorial.md', 'User Guides', 'markdown'),
('Payment Guide', 'How to handle payments', '/docs/payments.pdf', 'User Guides', 'pdf'),
('Account Management', 'Managing your account settings', '/docs/account-management.md', 'User Guides', 'markdown'),
('How to Book a Service', 'Video walkthrough of booking', 'https://youtube.com/watch?v=booking-demo', 'Video Tutorials', 'external'),
('Provider Registration', 'Becoming a service provider', 'https://youtube.com/watch?v=provider-demo', 'Video Tutorials', 'external'),
('Using the Mobile App', 'Mobile app features overview', 'https://youtube.com/watch?v=mobile-demo', 'Video Tutorials', 'external'),
('Troubleshooting', 'Common issues and solutions', 'https://youtube.com/watch?v=troubleshooting', 'Video Tutorials', 'external'),
('Authentication API', 'API documentation for auth', '/api-docs/auth', 'API Documentation', 'external'),
('Booking API', 'Booking system API reference', '/api-docs/booking', 'API Documentation', 'external'),
('Payment API', 'Payment processing API', '/api-docs/payment', 'API Documentation', 'external'),
('Webhook Reference', 'Webhook implementation guide', '/api-docs/webhooks', 'API Documentation', 'external');

-- Insert some sample FAQs
INSERT INTO public.support_faqs (question, answer, category, views) VALUES
('How do I cancel a booking?', 'You can cancel a booking by going to your booking history and clicking the cancel button. Please note our cancellation policy applies.', 'Bookings', 245),
('How do payments work?', 'Payments are processed securely through our payment gateway. You can pay with credit card, debit card, or mobile money.', 'Payments', 189),
('How do I become a service provider?', 'To become a service provider, register on our platform, complete your profile, and wait for verification. The process usually takes 24-48 hours.', 'Providers', 156),
('What should I do if my payment fails?', 'If your payment fails, please check your payment details and try again. Contact support if the issue persists.', 'Payments', 98),
('Can I modify my booking after confirmation?', 'You can modify certain booking details up to 2 hours before the scheduled time. Changes may incur additional fees.', 'Bookings', 87);
