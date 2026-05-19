-- Allow all authenticated users to read all service applications
-- (admins need this to see the full applications list)
create policy "Authenticated users can view all applications"
  on public.service_applications for select
  to authenticated
  using (true);

-- Allow authenticated users to update application status (approve / reject)
create policy "Authenticated users can update all applications"
  on public.service_applications for update
  to authenticated
  using (true);

-- Allow authenticated users to insert notifications for any user_id
-- (admins send notifications to applicants when approving / rejecting)
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Allow admins to view uploaded files from any user
create policy "Authenticated users can view all uploads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'uploads');
