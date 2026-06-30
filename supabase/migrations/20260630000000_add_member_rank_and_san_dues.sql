-- ============================================================================
-- Member seniority rank + SAN / Honourable Bencher dues tier
-- ----------------------------------------------------------------------------
--  * profiles.rank: 'regular' | 'san' | 'bencher'  (admin-set only)
--  * dues_items.amount_san: the 5th tier amount charged to Senior Advocates
--    and Honourable Benchers on tiered dues (e.g. the Welfare Levy).
--  * The privileged-column trigger is extended so a member cannot change their
--    own rank from the website — only an admin (or direct DB access) can.
-- ============================================================================

-- 1. profiles.rank
alter table public.profiles
  add column if not exists rank text not null default 'regular';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_rank_check') then
    alter table public.profiles
      add constraint profiles_rank_check check (rank in ('regular', 'san', 'bencher'));
  end if;
end $$;

-- 2. dues_items.amount_san  (SAN / Honourable Bencher tier)
alter table public.dues_items
  add column if not exists amount_san numeric;

-- 3. Extend the privileged-column guard to also cover rank.
create or replace function public.protect_privileged_profile_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Trust service_role / direct DB connections (Supabase SQL editor, psql).
  if coalesce(auth.role(), 'direct') not in ('authenticated', 'anon') then
    return new;
  end if;

  -- The admin flag can NEVER be changed from the website.
  if new.is_admin is distinct from old.is_admin then
    raise exception 'Admin role cannot be changed from the application; set profiles.is_admin directly in the database.';
  end if;

  -- status / portal_access / rank are admin-managed from the app.
  if (new.status is distinct from old.status
   or new.portal_access is distinct from old.portal_access
   or new.rank is distinct from old.rank)
   and not public.is_admin() then
    raise exception 'Not authorized to modify status, portal_access or rank.';
  end if;

  return new;
end;
$$;
