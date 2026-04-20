-- Add admin policy to allow superadmins to update any profile
-- Admin emails are checked via app logic using VITE_ADMIN_EMAILS
-- This policy allows authenticated users to update profiles
-- The app layer enforces admin-only operations

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
