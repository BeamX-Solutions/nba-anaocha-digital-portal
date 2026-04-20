-- Enhance approval workflow with additional fields
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update the check constraint to include 'submitted' and 'draft' statuses
ALTER TABLE public.documents
DROP CONSTRAINT IF EXISTS documents_approval_status_check,
ADD CONSTRAINT documents_approval_status_check CHECK (approval_status IN ('draft', 'submitted', 'approved', 'rejected'));

-- Add indexes for submitted documents (for admin to see pending approvals)
CREATE INDEX IF NOT EXISTS idx_documents_submitted_at ON public.documents(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_status_submitted ON public.documents(approval_status) WHERE approval_status = 'submitted';

-- Add comments for documentation
COMMENT ON COLUMN public.documents.approval_status IS 'Document approval status: draft, submitted, approved, or rejected';
COMMENT ON COLUMN public.documents.submitted_at IS 'Timestamp when document was submitted for approval';
COMMENT ON COLUMN public.documents.submitted_by IS 'User ID who submitted the document';
COMMENT ON COLUMN public.documents.rejected_at IS 'Timestamp when document was rejected';
COMMENT ON COLUMN public.documents.rejected_by IS 'Admin ID who rejected the document';
COMMENT ON COLUMN public.documents.rejection_reason IS 'Reason for document rejection';
