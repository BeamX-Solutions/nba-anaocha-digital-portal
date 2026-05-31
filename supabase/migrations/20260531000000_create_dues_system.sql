-- Dues items: admin creates these (annual dues, BPF tracking, special levies)
CREATE TABLE dues_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  category        text NOT NULL DEFAULT 'branch_dues',
  -- 'branch_dues' | 'bpf_compliance' | 'welfare' | 'levy'
  year            int  NOT NULL,
  deadline        date,
  is_tiered       boolean NOT NULL DEFAULT true,
  -- Tiered amounts by years of call (used when is_tiered = true)
  amount_0_4      numeric,
  amount_5_9      numeric,
  amount_10_14    numeric,
  amount_15_plus  numeric,
  -- Flat amount (used when is_tiered = false)
  flat_amount     numeric,
  -- BPF and similar: member uploads receipt rather than paying here
  requires_upload boolean NOT NULL DEFAULT false,
  upload_label    text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users
);

-- Dues payments / compliance records per member per item
CREATE TABLE dues_payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  dues_item_id   uuid NOT NULL REFERENCES dues_items(id) ON DELETE CASCADE,
  amount         numeric,
  reference      text,        -- Paystack reference (null for upload-only)
  receipt_url    text,        -- storage path for uploaded receipts (BPF etc.)
  status         text NOT NULL DEFAULT 'pending',
  -- 'paid' | 'uploaded' | 'pending'
  paid_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dues_item_id)
);

-- RLS
ALTER TABLE dues_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues_payments ENABLE ROW LEVEL SECURITY;

-- dues_items: authenticated members can read active items; admins manage all
CREATE POLICY "Members read active dues items"
  ON dues_items FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins manage dues items"
  ON dues_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- dues_payments: members manage their own; admins read all
CREATE POLICY "Members manage own dues payments"
  ON dues_payments FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all dues payments"
  ON dues_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Storage bucket for dues receipts (BPF uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dues-receipts', 'dues-receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Members upload their own dues receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dues-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Members read their own dues receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dues-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read all dues receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dues-receipts' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_admin = true
    )
  );
