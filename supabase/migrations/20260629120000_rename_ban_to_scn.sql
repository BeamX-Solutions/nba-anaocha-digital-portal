-- ============================================================================
-- Rename BAN (Bar Admission Number) → SCN (Supreme Court Number)
-- ----------------------------------------------------------------------------
--  Renames the `ban` column to `scn` on profiles and documents (data is
--  preserved — only the name changes) and renames the supporting indexes.
--  A separate BAN field may be reintroduced later.
-- ============================================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'ban'
  ) then
    alter table public.profiles rename column ban to scn;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'documents' and column_name = 'ban'
  ) then
    alter table public.documents rename column ban to scn;
  end if;
end $$;

alter index if exists idx_profiles_ban           rename to idx_profiles_scn;
alter index if exists idx_documents_ban           rename to idx_documents_scn;
alter index if exists idx_documents_ban_reference rename to idx_documents_scn_reference;
