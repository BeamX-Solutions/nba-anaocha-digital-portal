-- ============================================================================
-- Automatic dues deadline reminders
-- ----------------------------------------------------------------------------
--  * dues_reminder_log records which member got which reminder for which dues
--    item, so the daily job never emails the same person twice per stage
--    ('7d' = a week before the deadline, '1d' = the day before).
--  * Written only by the dues-reminders edge function (service role); RLS is
--    enabled with an admin-read policy for troubleshooting.
--  * The daily schedule itself is created via pg_cron — see the block at the
--    bottom (requires filling in the CRON_SECRET before running).
-- ============================================================================

create table if not exists public.dues_reminder_log (
  id           uuid primary key default gen_random_uuid(),
  dues_item_id uuid not null references public.dues_items(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  stage        text not null check (stage in ('7d', '1d')),
  sent_at      timestamptz not null default now(),
  unique (dues_item_id, user_id, stage)
);

alter table public.dues_reminder_log enable row level security;

create policy "Admins read reminder log"
  on public.dues_reminder_log for select
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- Daily schedule (07:00 Lagos = 06:00 UTC). BEFORE RUNNING:
--   1. Set a long random CRON_SECRET as an Edge Function secret, and
--   2. replace REPLACE_WITH_CRON_SECRET below with the same value.
-- ─────────────────────────────────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'dues-reminders-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://pwxahgqhtyciemqozgml.supabase.co/functions/v1/dues-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'REPLACE_WITH_CRON_SECRET'
    ),
    body    := '{}'::jsonb
  );
  $$
);
