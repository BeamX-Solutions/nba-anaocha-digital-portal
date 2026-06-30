-- ============================================================================
-- Auto-issue Lawyer Bar Identification Number (LBIAN)
-- ----------------------------------------------------------------------------
--  * profiles.lbian: unique, system-issued id of the form NBA-AN-011. Issued
--    automatically the first time a member's status becomes 'active' (admin
--    approval). The sequence starts at 11 → the first number is NBA-AN-011.
--  * profiles.lbian_public: member privacy preference for whether their LBIAN
--    shows in the Find a Member directory (default true).
--  * LBIAN is system-issued; a regular member cannot set or change it from the
--    website (guarded in protect_privileged_profile_columns).
-- ============================================================================

-- 1. Columns
alter table public.profiles add column if not exists lbian text;
alter table public.profiles add column if not exists lbian_public boolean not null default true;

create unique index if not exists profiles_lbian_key on public.profiles(lbian);

-- 2. Numbering sequence (first nextval = 11 → NBA-AN-011)
create sequence if not exists public.lbian_seq start with 11;

-- 3. Assign LBIAN the first time a member is approved (status -> active).
create or replace function public.assign_lbian_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active'
     and new.lbian is null
     and coalesce(old.status, '') is distinct from 'active'
     -- Temporary exclusion: this bootstrap account will be deleted. Safe to
     -- remove this clause once it is gone.
     and lower(coalesce(new.email, '')) <> 'ibehchimaobi98@gmail.com'
  then
    new.lbian := 'NBA-AN-' || lpad(nextval('public.lbian_seq')::text, 3, '0');
  end if;
  return new;
end;
$$;

-- Fires after the privileged-column guard (name order: protect < set_lbian), so
-- an invalid status change is rejected before a sequence value is consumed.
drop trigger if exists trg_set_lbian_on_approval on public.profiles;
create trigger trg_set_lbian_on_approval
  before update on public.profiles
  for each row execute function public.assign_lbian_on_approval();

-- 4. Extend the privileged-column guard so a member cannot set/alter their own
--    LBIAN from the website. Admins and direct DB access still can.
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

  return new;
end;
$$;
