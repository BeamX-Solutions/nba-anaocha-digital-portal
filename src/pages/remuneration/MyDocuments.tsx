import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FolderOpen, FileText, ChevronDown, ChevronUp, Copy, Trash2, Check } from "lucide-react";
import RemunerationLayout from "@/components/RemunerationLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { remunerationSidebarItems } from "@/lib/sidebarItems";
import { useToast } from "@/hooks/use-toast";

const MyDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDoc, setConfirmDoc] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setDocuments(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleCopy = (doc: any) => {
    const ref = doc.reference_number || doc.id;
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(doc.id);
      toast({ title: "Copied", description: "Reference number copied to clipboard." });
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const confirmDelete = async () => {
    if (!confirmDoc) return;
    setDeleting(true);
    const { error: err } = await supabase.from("documents").delete().eq("id", confirmDoc.id).eq("user_id", user!.id);
    setDeleting(false);
    setConfirmDoc(null);
    if (err) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== confirmDoc.id));
    if (expanded === confirmDoc.id) setExpanded(null);
    toast({ title: "Document deleted" });
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  const docTypeLabel = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <RemunerationLayout sidebarItems={remunerationSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">View and manage your prepared legal documents.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Documents Yet</h3>
              <p className="text-sm text-muted-foreground">
                Visit{" "}
                <a href="/remuneration/prepare" className="text-accent hover:underline">
                  Prepare a Document
                </a>{" "}
                to create your first document.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-card">
                <CardContent className="p-4">
                  {/* Header row — tap to expand */}
                  <button
                    className="w-full text-left flex items-start gap-3"
                    onClick={() => toggleExpand(doc.id)}
                  >
                    <FileText className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground leading-snug">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {docTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={doc.status === "draft" ? "secondary" : "default"}
                        className="capitalize text-xs"
                      >
                        {doc.status}
                      </Badge>
                      {expanded === doc.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {expanded === doc.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {doc.reference_number && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Reference:</span> {doc.reference_number}
                        </p>
                      )}

                      {doc.content && (
                        <div className="bg-muted/40 rounded-lg p-4 max-h-72 overflow-y-auto prose prose-sm max-w-none text-foreground">
                          <ReactMarkdown>{doc.content}</ReactMarkdown>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => handleCopy(doc)}>
                          {copied === doc.id ? (
                            <><Check className="h-3.5 w-3.5 mr-1 text-green-600" />Copied</>
                          ) : (
                            <><Copy className="h-3.5 w-3.5 mr-1" />Copy Reference</>
                          )}
                        </Button>
                        {doc.status === "draft" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmDoc(doc)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />Delete Draft
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* In-app delete confirmation dialog */}
      <Dialog open={!!confirmDoc} onOpenChange={(open) => { if (!open) setConfirmDoc(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">"{confirmDoc?.title}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDoc(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RemunerationLayout>
  );
};

export default MyDocuments;
