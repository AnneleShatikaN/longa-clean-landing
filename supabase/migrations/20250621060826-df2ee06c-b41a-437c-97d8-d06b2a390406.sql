
-- Create table to track provider learning progress
CREATE TABLE public.provider_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  service_type service_type_enum NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER DEFAULT 0,
  quiz_attempts INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, module_id)
);

-- Create table for provider certificates
CREATE TABLE public.provider_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_type service_type_enum NOT NULL,
  certificate_id VARCHAR(50) NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for quiz attempts/results
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer CHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.provider_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_learning_progress
CREATE POLICY "Providers can view their own progress"
  ON public.provider_learning_progress
  FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can update their own progress"
  ON public.provider_learning_progress
  FOR ALL
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all progress"
  ON public.provider_learning_progress
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS policies for provider_certificates
CREATE POLICY "Providers can view their own certificates"
  ON public.provider_certificates
  FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Admins can manage all certificates"
  ON public.provider_certificates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS policies for quiz_attempts
CREATE POLICY "Providers can manage their own quiz attempts"
  ON public.quiz_attempts
  FOR ALL
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_provider_learning_progress_provider ON public.provider_learning_progress(provider_id);
CREATE INDEX idx_provider_learning_progress_service_type ON public.provider_learning_progress(service_type);
CREATE INDEX idx_provider_certificates_provider ON public.provider_certificates(provider_id);
CREATE INDEX idx_quiz_attempts_provider ON public.quiz_attempts(provider_id);
CREATE INDEX idx_quiz_attempts_module ON public.quiz_attempts(module_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_provider_learning_progress_updated_at 
    BEFORE UPDATE ON public.provider_learning_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate certificate ID
CREATE OR REPLACE FUNCTION generate_certificate_id(p_service_type service_type_enum)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
  cert_id VARCHAR(50);
  service_prefix VARCHAR(3);
BEGIN
  -- Generate service type prefix
  service_prefix := CASE p_service_type
    WHEN 'cleaning' THEN 'CLN'
    WHEN 'gardening' THEN 'GRD'
    WHEN 'plumbing' THEN 'PLM'
    WHEN 'electrical' THEN 'ELC'
    WHEN 'carpentry' THEN 'CRP'
    WHEN 'painting' THEN 'PNT'
    WHEN 'maintenance' THEN 'MNT'
    ELSE 'GEN'
  END;
  
  -- Generate certificate ID: SERVICE-YEAR-RANDOM
  cert_id := service_prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  RETURN cert_id;
END;
$$;

-- Function to check if provider has completed all modules for their service type
CREATE OR REPLACE FUNCTION check_service_completion(p_provider_id UUID, p_service_type service_type_enum)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  total_modules INTEGER;
  completed_modules INTEGER;
BEGIN
  -- Count total published modules for service type
  SELECT COUNT(*) INTO total_modules
  FROM public.learning_modules
  WHERE service_type = p_service_type AND is_published = true;
  
  -- Count completed modules for provider
  SELECT COUNT(*) INTO completed_modules
  FROM public.provider_learning_progress
  WHERE provider_id = p_provider_id 
    AND service_type = p_service_type 
    AND is_completed = true;
  
  RETURN total_modules > 0 AND completed_modules = total_modules;
END;
$$;
