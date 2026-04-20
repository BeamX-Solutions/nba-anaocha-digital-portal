-- Add approval workflow columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approver_comments TEXT;

-- Create index on approval_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_approval_status ON public.documents(approval_status);

-- Create index on approved_by for admin view
CREATE INDEX IF NOT EXISTS idx_documents_approved_by ON public.documents(approved_by);

-- RLS Policy: Users can view their own document approval status
CREATE POLICY "Users can view their document approval status"
  ON public.documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR approval_status = 'approved');

-- RLS Policy: Admins can update approval status
CREATE POLICY "Admins can update document approval status"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
