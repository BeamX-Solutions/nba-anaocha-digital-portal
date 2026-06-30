-- ============================================================================
-- Let admins read all payments (for branch revenue reporting)
-- ----------------------------------------------------------------------------
--  The payments ledger was previously owner-only. Reporting needs aggregate
--  totals, so add an admin-only SELECT policy. Members still see only their own.
-- ============================================================================

drop policy if exists "Admins read all payments" on public.payments;
create policy "Admins read all payments"
  on public.payments for select
  to authenticated
  using (public.is_admin());
