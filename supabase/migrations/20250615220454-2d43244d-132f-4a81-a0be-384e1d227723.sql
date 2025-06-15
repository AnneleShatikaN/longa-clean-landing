
-- 1. Define which services and limits are included in each package
create table public.package_entitlements (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references services(id),
  allowed_service_id uuid not null references services(id),
  quantity_per_cycle integer not null,
  cycle_days integer not null default 30
);

-- 2. Track purchased (active) packages per user
create table public.user_active_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  package_id uuid not null references services(id),
  start_date date not null default current_date,
  expiry_date date not null,
  status text not null default 'active'
);

-- 3. Log each service usage against a package
create table public.service_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  package_id uuid not null references services(id),
  allowed_service_id uuid not null references services(id),
  booking_id uuid,
  used_at timestamp with time zone not null default now()
);

-- Add RLS so users can only view/manage their usages:
alter table user_active_packages enable row level security;
create policy "User sees their active packages" on user_active_packages for select using (user_id = auth.uid());

alter table service_usage_logs enable row level security;
create policy "User sees their usage logs" on service_usage_logs for select using (user_id = auth.uid());
