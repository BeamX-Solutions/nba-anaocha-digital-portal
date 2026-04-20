import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPendingDocuments } from "@/lib/documentUtils";
import { toast } from "@/components/ui/use-toast";
import { DocumentApprovalPanel } from "@/components/DocumentApprovalPanel";
import { AlertCircle, FileText, Loader2 } from "lucide-react";

const AdminApprovalQueue = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    setLoading(true);
    try {
      const { success, documents: docs, error } = await getPendingDocuments();
      
      if (success && docs) {
        setDocuments(docs);
      } else {
        toast({
          title: "Error",
          description: error || "Failed to load pending documents",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = () => {
    setSelectedDocId(null);
    loadPendingDocuments();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Approval Queue</h2>
        <p className="text-muted-foreground mt-2">
          Review and approve documents submitted by members
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Pending Documents</h3>
              <p className="text-muted-foreground">
                All documents have been reviewed. Great job staying on top of approvals!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className={`cursor-pointer transition hover:shadow-md ${
                selectedDocId === doc.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedDocId(doc.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{doc.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="font-semibold text-foreground">Reference:</span> {doc.reference_number}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Submitted By</p>
                      <p className="font-medium">
                        {doc.created_by_profile?.first_name} {doc.created_by_profile?.surname}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted On</p>
                      <p className="font-medium">{formatDate(doc.submitted_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Document Type</p>
                      <p className="font-medium capitalize">{doc.document_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{doc.approval_status}</p>
                    </div>
                  </div>

                  {selectedDocId === doc.id && (
                    <div className="pt-4 border-t mt-4">
                      <DocumentApprovalPanel
                        documentId={doc.id}
                        title={doc.title}
                        status={doc.approval_status}
                        onApprovalChange={handleApprovalChange}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApprovalQueue;
