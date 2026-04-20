-- Add BAN (Bar Admission Number) column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ban TEXT;

-- Create index on BAN for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ban ON public.profiles(ban);
