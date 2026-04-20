-- Create document_versions table to track document revisions
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  content TEXT,
  form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(user_id),
  UNIQUE(document_id, version_number)
);

-- Create index on document_id for faster queries
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);

-- Create index on document_id and version_number for version lookup
CREATE INDEX idx_document_versions_lookup ON public.document_versions(document_id, version_number DESC);

-- Enable RLS on document_versions table
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view versions of their own documents
CREATE POLICY "Users can view versions of their own documents"
  ON public.document_versions FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM public.documents
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all document versions
CREATE POLICY "Admins can view all document versions"
  ON public.document_versions FOR SELECT
  TO authenticated
  USING (true);
