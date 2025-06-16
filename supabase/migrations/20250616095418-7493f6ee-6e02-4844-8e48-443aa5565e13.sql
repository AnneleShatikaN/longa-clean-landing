
-- Add foreign key constraint for pending_transactions.user_id -> users.id
ALTER TABLE public.pending_transactions 
ADD CONSTRAINT fk_pending_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraint for pending_transactions.service_id -> services.id
ALTER TABLE public.pending_transactions 
ADD CONSTRAINT fk_pending_transactions_service_id 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;

-- Add foreign key constraint for pending_transactions.package_id -> user_active_packages.id  
ALTER TABLE public.pending_transactions 
ADD CONSTRAINT fk_pending_transactions_package_id 
FOREIGN KEY (package_id) REFERENCES public.user_active_packages(id) ON DELETE SET NULL;

-- Add foreign key constraint for pending_transactions.approved_by -> users.id
ALTER TABLE public.pending_transactions 
ADD CONSTRAINT fk_pending_transactions_approved_by 
FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;
