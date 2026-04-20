-- Add BAN (Bar Admission Number) column to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS ban TEXT;

-- Create index on BAN for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_ban ON public.documents(ban);

-- Create composite index on ban and reference_number for document search
CREATE INDEX IF NOT EXISTS idx_documents_ban_reference ON public.documents(ban, reference_number);
