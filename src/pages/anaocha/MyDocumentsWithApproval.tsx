import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import { VersionHistoryViewer } from "@/components/VersionHistoryViewer";
import { submitDocumentForApproval } from "@/lib/documentUtils";
import { FileText, Loader2, Send, Edit2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyDocumentsAnaocha = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (docId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSubmittingId(docId);
    try {
      const { success, error } = await submitDocumentForApproval(docId, user.id);
      
      if (success) {
        toast({
          title: "Document Submitted",
          description: "Your document has been submitted for admin approval",
        });
        loadDocuments();
      } else {
        toast({
          title: "Error",
          description: error || "Failed to submit document",
          variant: "destructive",
        });
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100";
      case "submitted":
        return "bg-blue-50";
      case "approved":
        return "bg-green-50";
      case "rejected":
        return "bg-red-50";
      default:
        return "bg-slate-50";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Documents</h2>
        <p className="text-muted-foreground mt-2">
          View and manage your submitted documents
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
              <h3 className="font-semibold text-lg mb-2">No Documents Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any documents yet. Start by preparing a new document.
              </p>
              <Button onClick={() => navigate("/anaocha/remuneration/prepare")}>
                Create Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className={getStatusColor(doc.approval_status)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{doc.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="font-semibold text-foreground">Reference:</span> {doc.reference_number}
                    </CardDescription>
                  </div>
                  <DocumentStatusBadge status={doc.approval_status} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(doc.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{doc.document_type}</p>
                    </div>
                  </div>

                  {doc.approval_status === "submitted" && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm text-blue-900">
                      Your document is pending admin review. You'll be notified once it's approved or requires revisions.
                    </div>
                  )}

                  {doc.approval_status === "rejected" && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-red-900">Rejection Reason:</p>
                      <p className="text-red-900 mt-1">{doc.rejection_reason}</p>
                    </div>
                  )}

                  {doc.approval_status === "approved" && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-sm text-green-900">
                      This document has been approved and is ready for use.
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/anaocha/remuneration/review/${doc.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>

                    {doc.approval_status === "draft" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/anaocha/remuneration/prepare/${doc.id}`)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitForApproval(doc.id)}
                          disabled={submittingId === doc.id}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {submittingId === doc.id ? "Submitting..." : "Submit for Approval"}
                        </Button>
                      </>
                    )}

                    {doc.approval_status === "rejected" && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/anaocha/remuneration/prepare/${doc.id}`)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Revise
                      </Button>
                    )}

                    <VersionHistoryViewer
                      documentId={doc.id}
                      onRestore={loadDocuments}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDocumentsAnaocha;
