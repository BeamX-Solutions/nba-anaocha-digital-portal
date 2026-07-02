-- ============================================================================
-- Security hardening: payment replay + change-request field whitelist
-- ----------------------------------------------------------------------------
--  * dues_payments.reference gets a unique index so a single Paystack
--    reference cannot be replayed to mark multiple dues items (or multiple
--    members) as paid. payments.reference was already unique.
--  * profile_change_requests.changes is constrained to the five identity
--    fields the feature covers, so a crafted request cannot smuggle other
--    profile columns (rank, lbian, ...) past an admin's one-click approval.
-- ============================================================================

-- A Paystack reference records at most one dues payment, ever.
create unique index if not exists dues_payments_reference_key
  on public.dues_payments(reference)
  where reference is not null;

-- Only identity fields may appear in a change request. (jsonb `-` text[]
-- strips the allowed keys; anything left over means a disallowed field.)
alter table public.profile_change_requests
  drop constraint if exists profile_change_requests_allowed_keys;
alter table public.profile_change_requests
  add constraint profile_change_requests_allowed_keys
  check (
    changes - array['first_name','surname','middle_name','scn','year_of_call'] = '{}'::jsonb
    and changes <> '{}'::jsonb
  );
