-- ============================================================
-- Payments table + payment tracking on service_applications
-- ============================================================

create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  entity_type text not null default 'service_application',
  entity_id   text,
  amount      numeric(15, 2) not null,
  reference   text not null unique,
  channel     text,
  status      text not null default 'success',
  created_at  timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Users can view their own payments
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Service role inserts (from Edge Function); block direct client inserts
create policy "Authenticated users can insert payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Add payment tracking columns to service_applications
alter table public.service_applications
  add column if not exists payment_status    text not null default 'unpaid',
  add column if not exists payment_reference text;
