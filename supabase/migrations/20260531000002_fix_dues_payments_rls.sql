-- Fix dues_payments member policy: FOR ALL without WITH CHECK blocks inserts/upserts
DROP POLICY IF EXISTS "Members manage own dues payments" ON dues_payments;

CREATE POLICY "Members manage own dues payments"
  ON dues_payments FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
