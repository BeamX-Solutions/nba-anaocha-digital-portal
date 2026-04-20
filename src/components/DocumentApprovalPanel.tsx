import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { approveDocument, rejectDocument } from "@/lib/documentUtils";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface DocumentApprovalPanelProps {
  documentId: string;
  title: string;
  status: string;
  onApprovalChange?: () => void;
}

export const DocumentApprovalPanel = ({
  documentId,
  title,
  status,
  onApprovalChange,
}: DocumentApprovalPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [comments, setComments] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";
  const isSubmitted = status === "submitted";

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { success, error } = await approveDocument(documentId, currentUser.id, comments);
      
      if (success) {
        toast({
          title: "Document Approved",
          description: "The document has been successfully approved.",
        });
        setApprovalDialogOpen(false);
        setComments("");
        onApprovalChange?.();
      } else {
        toast({
          title: "Error",
          description: error || "Failed to approve document",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await rejectDocument(documentId, currentUser.id, rejectionReason);
      
      if (success) {
        toast({
          title: "Document Rejected",
          description: "The document has been returned for revision.",
        });
        setRejectionDialogOpen(false);
        setRejectionReason("");
        onApprovalChange?.();
      } else {
        toast({
          title: "Error",
          description: error || "Failed to reject document",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || !isSubmitted) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <h4 className="font-semibold text-amber-900">Awaiting Approval</h4>
            <p className="text-sm text-amber-700">This document requires admin approval before finalization.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setRejectionDialogOpen(true)}
            disabled={loading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={() => setApprovalDialogOpen(true)}
            disabled={loading}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Document</DialogTitle>
            <DialogDescription>
              This will mark "{title}" as approved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Additional Comments (Optional)</label>
              <textarea
                placeholder="Add any comments about your approval..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-2 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={loading}>
              {loading ? "Approving..." : "Approve Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{title}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Rejection *</label>
              <textarea
                placeholder="Explain why this document needs revision..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={loading} variant="destructive">
              {loading ? "Rejecting..." : "Reject Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
