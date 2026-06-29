-- ============================================================================
-- Storage hardening
-- ----------------------------------------------------------------------------
--  * Restrict allowed MIME types per bucket so users can't upload HTML/SVG/JS
--    that would be served from the Supabase domain (XSS / phishing risk),
--    especially on the public buckets. SVG is intentionally excluded from the
--    image buckets because it can carry script.
--  * Apply sensible per-file size limits (default was unset → 50 MB).
--  * Tighten the dues-receipts policies from the `public` role to
--    `authenticated` (functionally equivalent thanks to the uid checks, but
--    cleaner) and route the admin check through public.is_admin().
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Bucket limits  (5 MB = 5242880, 10 MB = 10485760)
-- ─────────────────────────────────────────────────────────────────────────

-- Image-only buckets (no SVG).
update storage.buckets
   set file_size_limit    = 5242880,
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
 where id in ('avatars', 'people');

-- Resources: documents.
update storage.buckets
   set file_size_limit    = 10485760,
       allowed_mime_types = array[
         'application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
       ]
 where id = 'resources';

-- Dues receipts: photo or PDF of a bank teller / proof of payment.
update storage.buckets
   set file_size_limit    = 10485760,
       allowed_mime_types = array['image/png', 'image/jpeg', 'application/pdf']
 where id = 'dues-receipts';

-- Service-application uploads: documents or images.
update storage.buckets
   set file_size_limit    = 10485760,
       allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
 where id = 'uploads';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. dues-receipts policies → restrict to the authenticated role.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Members upload their own dues receipts" on storage.objects;
create policy "Members upload their own dues receipts"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dues-receipts' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Members read their own dues receipts" on storage.objects;
create policy "Members read their own dues receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'dues-receipts' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Admins read all dues receipts" on storage.objects;
create policy "Admins read all dues receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'dues-receipts' and public.is_admin());
