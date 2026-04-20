-- Add missing status and portal_access columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS portal_access TEXT NOT NULL DEFAULT 'anaocha';

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Create index on portal_access for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_portal_access ON public.profiles(portal_access);
