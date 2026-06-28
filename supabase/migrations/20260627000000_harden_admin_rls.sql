-- ============================================================================
-- Harden admin authorization at the database (RLS) layer
-- ----------------------------------------------------------------------------
-- Context: the front-end AdminRoute only hides UI. The Supabase REST API is
-- reachable directly with any authenticated JWT, so several earlier policies
-- that granted `authenticated -> using(true)` effectively gave every logged-in
-- member full admin data access, and two policies allowed self-escalation to
-- is_admin. This migration moves authorization into RLS.
--
-- ⚠️  BEFORE DEPLOYING: every real admin MUST have profiles.is_admin = true,
--     otherwise the admin panel will lock them out. See the BACKFILL block at
--     the bottom and fill in your admin emails.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Canonical admin check (SECURITY DEFINER so it bypasses RLS and cannot
--    recurse when used inside profiles' own policies/triggers).
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.user_id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. profiles — close BOTH self-escalation paths.
--    RLS decides which ROWS a user may update; a trigger guards which COLUMNS.
-- ─────────────────────────────────────────────────────────────────────────

-- The dangerous "any authenticated user may update any profile" policy.
drop policy if exists "Admins can update any profile" on public.profiles;

-- Admins may update any profile (incl. privileged columns).
create policy "Admins update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Column-level guard for updates that arrive through the application.
-- SECURITY INVOKER so auth.role() reflects the caller; service_role and direct
-- DB access (no request JWT) are trusted and skip these guards entirely.
create or replace function public.protect_privileged_profile_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Trust service_role / direct DB connections (Supabase SQL editor, psql).
  -- Only requests carrying an anon/authenticated JWT (i.e. the website) are guarded.
  if coalesce(auth.role(), 'direct') not in ('authenticated', 'anon') then
    return new;
  end if;

  -- The admin flag can NEVER be granted or revoked from the website — not even
  -- by an existing admin. It is set only directly in the database.
  if new.is_admin is distinct from old.is_admin then
    raise exception 'Admin role cannot be changed from the application; set profiles.is_admin directly in the database.';
  end if;

  -- status / portal_access stay admin-manageable from the app (member approval,
  -- suspension, etc.); regular members cannot change their own.
  if (new.status is distinct from old.status
   or new.portal_access is distinct from old.portal_access)
   and not public.is_admin() then
    raise exception 'Not authorized to modify status or portal_access.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_privileged_profile_columns on public.profiles;
create trigger trg_protect_privileged_profile_columns
  before update on public.profiles
  for each row execute function public.protect_privileged_profile_columns();

-- ─────────────────────────────────────────────────────────────────────────
-- 3. service_applications — admins only (owners already covered by the
--    pre-existing "Users can view/insert/update own applications" policies).
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can view all applications"   on public.service_applications;
drop policy if exists "Authenticated users can update all applications" on public.service_applications;

create policy "Admins view all applications"
  on public.service_applications for select
  to authenticated
  using (public.is_admin());

create policy "Admins update all applications"
  on public.service_applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 4. notifications — only admins may create notifications for arbitrary users.
--    (Edge Functions use the service role and bypass RLS, so they are
--    unaffected. Members keep own-row select/update from the original policies.)
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can insert notifications" on public.notifications;

create policy "Admins insert notifications"
  on public.notifications for insert
  to authenticated
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 5. audit_logs — admin-only read; only admins may write (action is attributed
--    to the acting admin).
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can view audit logs"   on public.audit_logs;
drop policy if exists "Authenticated users can insert audit logs" on public.audit_logs;

create policy "Admins read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

create policy "Admins insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- 6. contact_messages — public may still submit; only admins read / update.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can read contact messages"   on public.contact_messages;
drop policy if exists "Authenticated users can update contact messages" on public.contact_messages;

create policy "Admins read contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "Admins update contact messages"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 7. dues_items / dues_payments — restore admin-only management
--    (20260531000001 had re-opened these to all authenticated users).
--    Members keep: read active dues_items, manage own dues_payments.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users manage dues items"      on public.dues_items;
drop policy if exists "Authenticated users read all dues payments" on public.dues_payments;

create policy "Admins manage dues items"
  on public.dues_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read all dues payments"
  on public.dues_payments for select
  to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 8. storage: uploads bucket — admins (not every member) may read all files.
--    Owners keep their own-file policies from 20260318134654.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can view all uploads" on storage.objects;

create policy "Admins view all uploads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'uploads' and public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 9. BACKFILL — REQUIRED. Grant is_admin to the real admins BEFORE relying on
--    the policies above, or they will lose access. Uncomment and set emails.
--    (Run as a one-off; safe to keep commented in the committed migration.)
-- ─────────────────────────────────────────────────────────────────────────
-- update public.profiles
--   set is_admin = true
--   where lower(email) in (
--     'superadmin@example.com',
--     'anaocha-admin@example.com'
--   );
