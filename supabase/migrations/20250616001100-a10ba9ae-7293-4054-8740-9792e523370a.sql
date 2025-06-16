
-- Create pending transactions table for both subscriptions and bookings
CREATE TABLE public.pending_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_type character varying NOT NULL CHECK (transaction_type IN ('subscription', 'booking')),
  service_id uuid,
  package_id uuid,
  amount numeric NOT NULL,
  reference_number character varying,
  payment_proof_url text,
  whatsapp_number character varying,
  booking_details jsonb DEFAULT '{}',
  status character varying NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pending transactions"
  ON public.pending_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pending transactions"
  ON public.pending_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending transactions"
  ON public.pending_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update pending transactions"
  ON public.pending_transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to approve pending transactions
CREATE OR REPLACE FUNCTION public.approve_pending_transaction(
  transaction_id uuid,
  admin_notes_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get the transaction
  SELECT * INTO transaction_record
  FROM public.pending_transactions
  WHERE id = transaction_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found or already processed');
  END IF;

  -- Update transaction status
  UPDATE public.pending_transactions
  SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = now(),
    admin_notes = admin_notes_param,
    updated_at = now()
  WHERE id = transaction_id;

  -- Handle subscription activation
  IF transaction_record.transaction_type = 'subscription' THEN
    INSERT INTO public.user_active_packages (
      user_id,
      package_id,
      start_date,
      expiry_date,
      status
    ) VALUES (
      transaction_record.user_id,
      transaction_record.package_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days', -- Default 30 days, adjust as needed
      'active'
    );
  END IF;

  -- Handle booking creation
  IF transaction_record.transaction_type = 'booking' THEN
    INSERT INTO public.bookings (
      client_id,
      service_id,
      booking_date,
      booking_time,
      total_amount,
      special_instructions,
      emergency_booking,
      duration_minutes,
      status
    ) VALUES (
      transaction_record.user_id,
      transaction_record.service_id,
      (transaction_record.booking_details->>'booking_date')::date,
      (transaction_record.booking_details->>'booking_time')::time,
      transaction_record.amount,
      transaction_record.booking_details->>'special_instructions',
      (transaction_record.booking_details->>'emergency_booking')::boolean,
      (transaction_record.booking_details->>'duration_minutes')::integer,
      'pending'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Transaction approved successfully',
    'transaction_type', transaction_record.transaction_type
  );
END;
$$;

-- Create function to decline pending transactions
CREATE OR REPLACE FUNCTION public.decline_pending_transaction(
  transaction_id uuid,
  admin_notes_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Update transaction status
  UPDATE public.pending_transactions
  SET 
    status = 'declined',
    approved_by = auth.uid(),
    approved_at = now(),
    admin_notes = admin_notes_param,
    updated_at = now()
  WHERE id = transaction_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found or already processed');
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Transaction declined successfully'
  );
END;
$$;

-- Create trigger to send notifications when transactions are approved/declined
CREATE OR REPLACE FUNCTION public.notify_transaction_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  user_name character varying;
  notification_title character varying;
  notification_message text;
BEGIN
  -- Only trigger on status changes to approved or declined
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'declined') THEN
    -- Get user name
    SELECT full_name INTO user_name
    FROM public.users
    WHERE id = NEW.user_id;

    -- Set notification content based on status and type
    IF NEW.status = 'approved' THEN
      IF NEW.transaction_type = 'subscription' THEN
        notification_title := 'Subscription Activated!';
        notification_message := 'Your subscription package has been activated. You can now book services.';
      ELSE
        notification_title := 'Booking Confirmed!';
        notification_message := 'Your service booking has been confirmed and is now active.';
      END IF;
    ELSE -- declined
      IF NEW.transaction_type = 'subscription' THEN
        notification_title := 'Subscription Payment Issue';
        notification_message := 'There was an issue with your subscription payment. Please contact support.';
      ELSE
        notification_title := 'Booking Payment Issue';
        notification_message := 'There was an issue with your booking payment. Please contact support.';
      END IF;
    END IF;

    -- Send notification
    PERFORM send_notification(
      NEW.user_id,
      CASE WHEN NEW.status = 'approved' THEN 'payment_approved' ELSE 'payment_declined' END,
      notification_title,
      notification_message,
      jsonb_build_object('transaction_id', NEW.id, 'transaction_type', NEW.transaction_type),
      NULL,
      CASE WHEN NEW.status = 'declined' THEN 'high' ELSE 'normal' END
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_transaction_status_notification
  AFTER UPDATE ON public.pending_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_status_change();
