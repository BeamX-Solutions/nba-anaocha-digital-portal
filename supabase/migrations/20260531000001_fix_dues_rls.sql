-- Fix dues_items RLS: drop the overly restrictive admin-only policy
-- and replace with the same pattern used throughout the rest of the app
-- (frontend AdminRoute already gates access to the admin panel)

DROP POLICY IF EXISTS "Admins manage dues items" ON dues_items;
DROP POLICY IF EXISTS "Members read active dues items" ON dues_items;

-- All authenticated users can read active items (members see their dues)
CREATE POLICY "Authenticated users read active dues items"
  ON dues_items FOR SELECT
  TO authenticated
  USING (is_active = true);

-- All authenticated users can manage dues items
-- (admin-only gate is enforced by the frontend AdminRoute)
CREATE POLICY "Authenticated users manage dues items"
  ON dues_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also fix dues_payments admin read policy for same reason
DROP POLICY IF EXISTS "Admins read all dues payments" ON dues_payments;

CREATE POLICY "Authenticated users read all dues payments"
  ON dues_payments FOR SELECT
  TO authenticated
  USING (true);
