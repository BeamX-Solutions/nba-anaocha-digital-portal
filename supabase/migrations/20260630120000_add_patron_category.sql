-- ============================================================================
-- Add a 'patron' category to public.people
-- ----------------------------------------------------------------------------
--  Lets the branch founder be featured as "Grand Patron" in his own section on
--  the landing page, separate from the rotating executives list.
-- ============================================================================

alter table public.people drop constraint if exists people_category_check;

alter table public.people
  add constraint people_category_check
  check (category in ('executive', 'committee', 'patron'));
