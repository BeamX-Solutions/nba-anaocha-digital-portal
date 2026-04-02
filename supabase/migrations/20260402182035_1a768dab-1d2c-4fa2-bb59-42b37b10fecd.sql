
-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (contact form is public-facing)
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can read (admin will check via app logic)
CREATE POLICY "Authenticated users can read contact messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update (mark as read)
CREATE POLICY "Authenticated users can update contact messages"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
