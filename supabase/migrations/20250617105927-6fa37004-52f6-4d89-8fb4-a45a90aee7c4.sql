
-- Add verification fields to users table
ALTER TABLE public.users 
ADD COLUMN verification_status character varying DEFAULT 'pending',
ADD COLUMN verification_submitted_at timestamp with time zone,
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN verification_documents jsonb DEFAULT '{}',
ADD COLUMN verification_notes text,
ADD COLUMN background_check_consent boolean DEFAULT false,
ADD COLUMN banking_details_verified boolean DEFAULT false;

-- Create provider_documents table for document storage
CREATE TABLE public.provider_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type character varying NOT NULL,
  document_name character varying NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type character varying,
  verification_status character varying DEFAULT 'pending',
  uploaded_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES public.users(id),
  rejection_reason text,
  is_active boolean DEFAULT true
);

-- Create provider_banking_details table
CREATE TABLE public.provider_banking_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_name character varying NOT NULL,
  account_number character varying NOT NULL,
  account_holder_name character varying NOT NULL,
  routing_number character varying,
  account_type character varying DEFAULT 'checking',
  swift_code character varying,
  verification_status character varying DEFAULT 'pending',
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES public.users(id),
  is_primary boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create provider_references table
CREATE TABLE public.provider_references (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reference_name character varying NOT NULL,
  reference_phone character varying NOT NULL,
  reference_email character varying,
  relationship character varying NOT NULL,
  company_name character varying,
  years_known integer,
  verification_status character varying DEFAULT 'pending',
  contacted_at timestamp with time zone,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES public.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_banking_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_references ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_documents
CREATE POLICY "Providers can view their own documents" 
  ON public.provider_documents 
  FOR SELECT 
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can insert their own documents" 
  ON public.provider_documents 
  FOR INSERT 
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their own documents" 
  ON public.provider_documents 
  FOR UPDATE 
  USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all documents" 
  ON public.provider_documents 
  FOR ALL 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for provider_banking_details
CREATE POLICY "Providers can manage their own banking details" 
  ON public.provider_banking_details 
  FOR ALL 
  USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all banking details" 
  ON public.provider_banking_details 
  FOR SELECT 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for provider_references
CREATE POLICY "Providers can manage their own references" 
  ON public.provider_references 
  FOR ALL 
  USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all references" 
  ON public.provider_references 
  FOR SELECT 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf', 'image/webp']
);

-- Storage policies for verification documents
CREATE POLICY "Providers can upload their verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Providers can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all verification documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents' 
    AND EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to check if provider is verified
CREATE OR REPLACE FUNCTION public.is_provider_verified(provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = provider_id 
    AND role = 'provider'
    AND verification_status = 'verified'
    AND verified_at IS NOT NULL
  );
END;
$$;

-- Function to update verification status
CREATE OR REPLACE FUNCTION public.update_provider_verification_status(
  provider_id uuid,
  new_status character varying,
  admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  provider_record RECORD;
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get provider details
  SELECT * INTO provider_record
  FROM public.users
  WHERE id = provider_id AND role = 'provider';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Provider not found');
  END IF;

  -- Update verification status
  UPDATE public.users
  SET 
    verification_status = new_status,
    verified_at = CASE WHEN new_status = 'verified' THEN now() ELSE NULL END,
    verification_notes = COALESCE(admin_notes, verification_notes),
    updated_at = now()
  WHERE id = provider_id;

  -- Send notification to provider
  PERFORM send_notification(
    provider_id,
    'verification_status_updated',
    'Verification Status Updated',
    'Your provider verification status has been updated to: ' || new_status,
    jsonb_build_object('status', new_status, 'notes', admin_notes),
    NULL,
    CASE WHEN new_status = 'verified' THEN 'normal' ELSE 'high' END
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Verification status updated successfully',
    'status', new_status
  );
END;
$$;

-- Trigger to prevent unverified providers from receiving bookings
CREATE OR REPLACE FUNCTION public.check_provider_verification_for_booking()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only check when a provider is being assigned to a booking
  IF NEW.provider_id IS NOT NULL AND (OLD.provider_id IS NULL OR OLD.provider_id != NEW.provider_id) THEN
    IF NOT public.is_provider_verified(NEW.provider_id) THEN
      RAISE EXCEPTION 'Provider must be verified before accepting bookings';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to bookings table
CREATE TRIGGER check_provider_verification_trigger
  BEFORE UPDATE OF provider_id ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_provider_verification_for_booking();
