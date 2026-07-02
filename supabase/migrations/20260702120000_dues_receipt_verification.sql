-- ============================================================================
-- Secretariat verification for uploaded dues receipts (BPF etc.)
-- ----------------------------------------------------------------------------
--  * Uploaded receipts no longer count as compliant on sight. New statuses:
--      'uploaded'  -> awaiting secretariat review (was: treated as compliant)
--      'verified'  -> admin approved the receipt (counts as compliant)
--      'rejected'  -> admin rejected it (member is outstanding again and may
--                     re-upload; the reason is shown to them)
--    'paid' (Paystack-verified) and 'pending' keep their meaning.
--  * Members can only ever write 'pending'/'uploaded' from the website; the
--    Paystack path uses the service role and admins set the review outcomes.
--    (Also closes a pre-existing gap where a member could set their own row
--    to 'paid' via the REST API.)
-- ============================================================================

alter table public.dues_payments
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists rejection_reason text;

-- Admins may update payment rows (to verify / reject uploads).
drop policy if exists "Admins update dues payments" on public.dues_payments;
create policy "Admins update dues payments"
  on public.dues_payments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Column/status guard: website members may only submit, never self-approve.
create or replace function public.protect_dues_payment_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Trust service_role / direct DB connections (Paystack verification,
  -- SQL editor). Only anon/authenticated website requests are guarded.
  if coalesce(auth.role(), 'direct') not in ('authenticated', 'anon') then
    return new;
  end if;

  if not public.is_admin() then
    if new.status not in ('pending', 'uploaded') then
      raise exception 'This payment status is set by the secretariat and cannot be self-assigned.';
    end if;
    -- Review fields belong to admins; a fresh submission clears any
    -- previous review outcome.
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_dues_payment_status on public.dues_payments;
create trigger trg_protect_dues_payment_status
  before insert or update on public.dues_payments
  for each row execute function public.protect_dues_payment_status();

-- Members could INSERT their receipt file but not overwrite it (upsert on
-- re-upload needs UPDATE). Required for resubmission after a rejection.
drop policy if exists "Members update their own dues receipts" on storage.objects;
create policy "Members update their own dues receipts"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dues-receipts' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'dues-receipts' and auth.uid()::text = (storage.foldername(name))[1]);
