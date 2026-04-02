import { useState, useEffect } from "react";
import { FolderOpen, FileText } from "lucide-react";
import RemunerationLayout from "@/components/RemunerationLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { remunerationSidebarItems } from "@/lib/sidebarItems";

const MyDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <RemunerationLayout sidebarItems={remunerationSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">View all your prepared legal documents.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : documents.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Documents Yet</h3>
              <p className="text-sm text-muted-foreground">
                Visit <a href="/remuneration/prepare" className="text-accent hover:underline">Prepare a Document</a> to create your first document.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <FileText className="h-8 w-8 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground truncate">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Ref: {doc.reference_number || "—"} • {doc.document_type.replace(/_/g, " ")} • {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant={doc.status === "draft" ? "secondary" : "default"} className="capitalize">{doc.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RemunerationLayout>
  );
};

export default MyDocuments;
