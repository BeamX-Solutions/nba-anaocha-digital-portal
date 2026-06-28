-- ============================================================================
-- Schema & policy cleanup (run AFTER 20260627000000_harden_admin_rls.sql)
-- ----------------------------------------------------------------------------
--  * Drops unused tables (documents, document_versions) — no .from() references
--    exist anywhere in the app; they survive only in auto-generated types.
--  * Brings the dashboard-created tables (announcements, resources), which had
--    no migration of their own, under a coherent RLS set consistent with
--    is_admin(): public read where appropriate, admin-only writes.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Drop unused tables (document_versions FKs documents → drop it first).
-- ─────────────────────────────────────────────────────────────────────────
drop table if exists public.document_versions cascade;
drop table if exists public.documents cascade;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. announcements — public may read PUBLISHED items; admins manage all.
--    Wipe whatever ad-hoc policies exist, then install the canonical pair.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.announcements enable row level security;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies
             where schemaname = 'public' and tablename = 'announcements'
  loop execute format('drop policy if exists %I on public.announcements', pol.policyname); end loop;
end $$;

create policy "Anyone reads published announcements"
  on public.announcements for select
  using (published = true);

create policy "Admins manage announcements"
  on public.announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 3. resources — the /resources page is public, so anyone may read; admins
--    manage. (Files live in the public 'resources' storage bucket.)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.resources enable row level security;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies
             where schemaname = 'public' and tablename = 'resources'
  loop execute format('drop policy if exists %I on public.resources', pol.policyname); end loop;
end $$;

create policy "Anyone reads resources"
  on public.resources for select
  using (true);

create policy "Admins manage resources"
  on public.resources for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 4. storage: 'resources' bucket — public read, admin-only writes.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Anyone can view resources" on storage.objects;
create policy "Anyone can view resources"
  on storage.objects for select
  using (bucket_id = 'resources');

drop policy if exists "Admins upload resources" on storage.objects;
create policy "Admins upload resources"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists "Admins update resources" on storage.objects;
create policy "Admins update resources"
  on storage.objects for update to authenticated
  using (bucket_id = 'resources' and public.is_admin());

drop policy if exists "Admins delete resources" on storage.objects;
create policy "Admins delete resources"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());
