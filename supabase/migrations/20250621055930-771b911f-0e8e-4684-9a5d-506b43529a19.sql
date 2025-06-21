
-- Create enum for service types
CREATE TYPE service_type_enum AS ENUM (
  'cleaning',
  'gardening', 
  'plumbing',
  'electrical',
  'carpentry',
  'painting',
  'maintenance'
);

-- Create learning modules table
CREATE TABLE public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type service_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url VARCHAR(500),
  notes TEXT,
  notes_pdf_url VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on learning modules
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for learning modules (admin only for write, published modules for read)
CREATE POLICY "Admins can manage all learning modules"
  ON public.learning_modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Published modules are viewable by providers"
  ON public.learning_modules
  FOR SELECT
  TO authenticated
  USING (
    is_published = true AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'provider')
  );

-- Enable RLS on quiz questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for quiz questions (follow module permissions)
CREATE POLICY "Admins can manage all quiz questions"
  ON public.quiz_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Quiz questions viewable with published modules"
  ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      WHERE lm.id = module_id 
      AND lm.is_published = true
      AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'provider')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_learning_modules_service_type ON public.learning_modules(service_type);
CREATE INDEX idx_learning_modules_published ON public.learning_modules(is_published);
CREATE INDEX idx_quiz_questions_module_id ON public.quiz_questions(module_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_modules_updated_at 
    BEFORE UPDATE ON public.learning_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
