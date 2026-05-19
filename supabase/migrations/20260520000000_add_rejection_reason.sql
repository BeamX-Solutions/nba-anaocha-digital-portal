alter table public.service_applications
  add column if not exists rejection_reason text;
