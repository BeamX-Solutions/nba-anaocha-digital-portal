-- ============================================================
-- Add is_admin flag to profiles and create audit_logs table
-- ============================================================

-- ─────────────────────────────────────────
-- ADMIN FLAG ON PROFILES
-- ─────────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid references auth.users(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  details      jsonb,
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can view audit logs"
  on public.audit_logs for select
  using (auth.role() = 'authenticated');
