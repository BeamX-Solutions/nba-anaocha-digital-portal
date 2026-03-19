import { useEffect, useState } from "react";
import { Search, FileText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const DOC_TYPE_LABELS: Record<string, string> = {
  deed_of_assignment: "Deed of Assignment",
  deed_of_gift: "Deed of Gift",
  mortgage_deed: "Mortgage Deed",
  power_of_attorney: "Power of Attorney",
  contract_of_sale: "Contract of Sale",
  tenancy_agreement: "Tenancy Agreement",
  precedent: "Precedent",
};

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      const docList = docs || [];
      setDocuments(docList);
      setFiltered(docList);

      const userIds = [...new Set(docList.map((d) => d.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, first_name, surname, email")
          .in("user_id", userIds);
        const map: Record<string, any> = {};
        (profileData || []).forEach((p) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) { setFiltered(documents); return; }
    setFiltered(
      documents.filter((d) =>
        [d.title, d.reference_number, d.document_type].some((v) => v?.toLowerCase().includes(q))
      )
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">
            {documents.length} document{documents.length !== 1 ? "s" : ""} prepared across all members.
          </p>
        </div>

        {/* Search */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value) setFiltered(documents);
                }}
                placeholder="Search by title, reference number, or document type..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No documents found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => {
              const profile = profiles[doc.user_id];
              return (
                <Card key={doc.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-card-foreground truncate">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                        {" · "}Ref: {doc.reference_number || "—"}
                        {" · "}
                        {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {profile && (
                        <p className="text-xs text-muted-foreground">
                          Member: {[profile.surname, profile.first_name].filter(Boolean).join(" ") || profile.email}
                        </p>
                      )}
                    </div>
                    <Badge variant={doc.status === "draft" ? "secondary" : "default"} className="capitalize flex-shrink-0">
                      {doc.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDocuments;
