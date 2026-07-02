-- ============================================================================
-- Profile change approval workflow + account denial support
-- ----------------------------------------------------------------------------
--  * profile_change_requests: an ACTIVE member's edits to identity fields
--    (first_name, surname, middle_name, scn, year_of_call) no longer apply
--    directly — they are queued here and take effect only when an admin
--    approves the request (admin review page applies the update on profiles).
--    Contact fields (phone, office_address, avatar) still save instantly.
--  * The privileged-column guard on profiles is extended so an active member
--    cannot bypass the queue by calling the REST API directly. Members whose
--    account is still pending (completing their profile) are unaffected.
--  * Account denial reuses profiles.status (TEXT, unconstrained): admins may
--    set status = 'denied' on a pending registration. No schema change needed;
--    documented here for the record.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Change request queue
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profile_change_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  changes     jsonb not null,           -- { field: requested_value }
  previous    jsonb not null default '{}'::jsonb, -- snapshot of the old values
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  reason      text,                     -- admin's note on rejection
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

-- One open request per member keeps review and the member UI unambiguous.
create unique index if not exists profile_change_requests_one_pending
  on public.profile_change_requests(user_id)
  where status = 'pending';

create index if not exists idx_profile_change_requests_status
  on public.profile_change_requests(status);

alter table public.profile_change_requests enable row level security;

create policy "Members insert own change requests"
  on public.profile_change_requests for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

create policy "Members view own change requests"
  on public.profile_change_requests for select
  to authenticated
  using (auth.uid() = user_id);

-- Members may withdraw a request that has not been reviewed yet.
create policy "Members cancel own pending requests"
  on public.profile_change_requests for delete
  to authenticated
  using (auth.uid() = user_id and status = 'pending');

create policy "Admins view all change requests"
  on public.profile_change_requests for select
  to authenticated
  using (public.is_admin());

create policy "Admins review change requests"
  on public.profile_change_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Guard identity columns for ACTIVE members (approval required).
--    Full redefinition: keeps every existing rule from 20260630140000 and
--    appends the identity-field block at the end.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.protect_privileged_profile_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), 'direct') not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Admin role cannot be changed from the application; set profiles.is_admin directly in the database.';
  end if;

  if (new.status is distinct from old.status
   or new.portal_access is distinct from old.portal_access
   or new.rank is distinct from old.rank)
   and not public.is_admin() then
    raise exception 'Not authorized to modify status, portal_access or rank.';
  end if;

  if new.lbian is distinct from old.lbian and not public.is_admin() then
    raise exception 'LBIAN is system-issued and cannot be changed from the application.';
  end if;

  -- Identity fields of an approved member change only via an approved
  -- profile_change_request (which an admin applies). Pending members are
  -- still completing their profile and may edit freely.
  if old.status = 'active'
     and not public.is_admin()
     and (new.first_name   is distinct from old.first_name
       or new.surname      is distinct from old.surname
       or new.middle_name  is distinct from old.middle_name
       or new.scn          is distinct from old.scn
       or new.year_of_call is distinct from old.year_of_call)
  then
    raise exception 'Identity details require secretariat approval. Please submit a change request from My Profile.';
  end if;

  return new;
end;
$$;
