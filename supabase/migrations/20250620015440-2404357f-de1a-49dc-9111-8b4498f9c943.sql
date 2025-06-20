
-- Create banking_instructions table for admin-managed payment instructions
CREATE TABLE public.banking_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name CHARACTER VARYING NOT NULL,
  account_name CHARACTER VARYING NOT NULL,
  account_number CHARACTER VARYING NOT NULL,
  branch_code CHARACTER VARYING,
  swift_code CHARACTER VARYING,
  reference_format CHARACTER VARYING NOT NULL DEFAULT 'SERVICE-{SERVICE_ID}-{USER_ID}',
  instructions TEXT NOT NULL DEFAULT 'Please use the reference number provided when making your payment.',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banking_instructions ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage banking instructions
CREATE POLICY "Only admins can view banking instructions"
  ON public.banking_instructions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert banking instructions"
  ON public.banking_instructions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update banking instructions"
  ON public.banking_instructions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete banking instructions"
  ON public.banking_instructions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy for clients to view active banking instructions (for payment)
CREATE POLICY "Clients can view active banking instructions"
  ON public.banking_instructions
  FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'client'
    )
  );
