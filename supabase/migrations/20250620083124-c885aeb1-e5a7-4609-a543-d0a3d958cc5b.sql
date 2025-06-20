
-- Create payment_instructions table for admin-managed payment instructions
CREATE TABLE public.payment_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name CHARACTER VARYING NOT NULL,
  bank_name CHARACTER VARYING NOT NULL,
  account_number CHARACTER VARYING NOT NULL,
  branch_code CHARACTER VARYING,
  swift_code CHARACTER VARYING,
  reference_format CHARACTER VARYING NOT NULL DEFAULT 'SERVICE-{SERVICE_ID}-{USER_ID}',
  additional_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Enable RLS
ALTER TABLE public.payment_instructions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active payment instructions"
  ON public.payment_instructions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage payment instructions"
  ON public.payment_instructions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default payment instructions if none exist
INSERT INTO public.payment_instructions (
  account_name,
  bank_name,
  account_number,
  branch_code,
  swift_code,
  reference_format,
  additional_instructions,
  is_active
) VALUES (
  'Your Business Name',
  'Bank Windhoek',
  '1234567890',
  '481772',
  'BWLINANX',
  'SERVICE-{SERVICE_ID}-{USER_ID}',
  'Please use the reference number provided when making your payment and send proof of payment via WhatsApp.',
  true
);
