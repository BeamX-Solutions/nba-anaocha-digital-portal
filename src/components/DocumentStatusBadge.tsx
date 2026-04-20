import { Badge } from "@/components/ui/badge";

export type DocumentApprovalStatus = "draft" | "submitted" | "approved" | "rejected";

interface DocumentStatusBadgeProps {
  status: DocumentApprovalStatus;
}

export const DocumentStatusBadge = ({ status }: DocumentStatusBadgeProps) => {
  const statusConfig: Record<DocumentApprovalStatus, { label: string; variant: any; color: string }> = {
    draft: {
      label: "Draft",
      variant: "outline",
      color: "text-slate-600",
    },
    submitted: {
      label: "Submitted for Approval",
      variant: "secondary",
      color: "text-blue-600",
    },
    approved: {
      label: "Approved",
      variant: "default",
      color: "text-green-600",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
      color: "text-red-600",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.color}>
      {config.label}
    </Badge>
  );
};
