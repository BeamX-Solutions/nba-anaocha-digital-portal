-- People: branch executives and committee members.
-- Managed by admins, displayed publicly on the landing page.

CREATE TABLE IF NOT EXISTS public.people (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  position      text NOT NULL,
  category      text NOT NULL DEFAULT 'committee' CHECK (category IN ('executive', 'committee')),
  committee     text,                       -- committee name when category = 'committee'
  photo_url     text,
  display_order int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Public read: the landing page is visible to signed-out visitors too.
CREATE POLICY "Anyone can view people"
  ON public.people FOR SELECT
  USING (true);

-- Admins manage everything.
CREATE POLICY "Admins manage people"
  ON public.people FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Public storage bucket for member/executive photos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('people', 'people', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view people photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'people');

CREATE POLICY "Admins upload people photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'people' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins update people photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'people' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins delete people photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'people' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );
