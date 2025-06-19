
-- Create email verification tokens table
CREATE TABLE public.email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create password reset tokens table
CREATE TABLE public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enhance support_faqs table with visibility controls
ALTER TABLE public.support_faqs ADD COLUMN IF NOT EXISTS visibility_rules jsonb DEFAULT '{"show_all": true, "user_roles": ["client", "provider", "admin"], "pages": ["all"]}'::jsonb;
ALTER TABLE public.support_faqs ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;
ALTER TABLE public.support_faqs ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES public.users(id);

-- Create FAQ views tracking table
CREATE TABLE IF NOT EXISTS public.faq_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id uuid REFERENCES public.support_faqs(id) ON DELETE CASCADE,
  user_id uuid,
  viewed_at timestamp with time zone DEFAULT now(),
  user_role text,
  page_context text
);

-- Create content management audit log
CREATE TABLE public.content_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  action text NOT NULL, -- 'create', 'update', 'delete'
  changes jsonb,
  performed_by uuid REFERENCES public.users(id),
  performed_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;

-- Email verification tokens policies
CREATE POLICY "Users can view own verification tokens" ON public.email_verification_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage verification tokens" ON public.email_verification_tokens
  FOR ALL USING (true);

-- Password reset tokens policies  
CREATE POLICY "Users can view own reset tokens" ON public.password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage reset tokens" ON public.password_reset_tokens
  FOR ALL USING (true);

-- FAQ analytics policies
CREATE POLICY "Users can view own FAQ analytics" ON public.faq_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert FAQ analytics" ON public.faq_analytics
  FOR INSERT WITH CHECK (true);

-- Content audit log policies
CREATE POLICY "Admins can view audit log" ON public.content_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert audit log" ON public.content_audit_log
  FOR INSERT WITH CHECK (true);

-- Enhanced FAQ visibility function
CREATE OR REPLACE FUNCTION public.get_faqs_for_context(
  p_user_role text DEFAULT NULL,
  p_page_context text DEFAULT 'all',
  p_category text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  question text,
  answer text,
  category character varying,
  views integer,
  priority integer,
  visibility_rules jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.question,
    f.answer,
    f.category,
    f.views,
    f.priority,
    f.visibility_rules,
    f.created_at
  FROM public.support_faqs f
  WHERE 
    f.is_active = true
    AND (p_category IS NULL OR f.category = p_category)
    AND (
      (f.visibility_rules->>'show_all')::boolean = true
      OR (
        p_user_role IS NOT NULL 
        AND f.visibility_rules->'user_roles' ? p_user_role
      )
      OR (
        f.visibility_rules->'pages' ? p_page_context
        OR f.visibility_rules->'pages' ? 'all'
      )
    )
  ORDER BY f.priority DESC, f.views DESC, f.created_at DESC;
END;
$$;

-- Function to log content changes
CREATE OR REPLACE FUNCTION public.log_content_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.content_audit_log (
    content_type,
    content_id,
    action,
    changes,
    performed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers
CREATE TRIGGER audit_support_faqs
  AFTER INSERT OR UPDATE OR DELETE ON public.support_faqs
  FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

CREATE TRIGGER audit_subscription_packages
  AFTER INSERT OR UPDATE OR DELETE ON public.subscription_packages
  FOR EACH ROW EXECUTE FUNCTION public.log_content_change();

-- Function to clean expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.email_verification_tokens 
  WHERE expires_at < now() OR used = true;
  
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_verification_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token text;
BEGIN
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'hex');
  
  -- Store the token
  INSERT INTO public.email_verification_tokens (user_id, token, expires_at)
  VALUES (p_user_id, token, now() + interval '24 hours');
  
  RETURN token;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_reset_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token text;
BEGIN
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'hex');
  
  -- Store the token
  INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
  VALUES (p_user_id, token, now() + interval '1 hour');
  
  RETURN token;
END;
$$;
