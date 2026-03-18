import { useState } from "react";
import { Home, FileText, FolderOpen, CreditCard, Search, Bell, File, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { label: "Home", href: "/remuneration/dashboard", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/remuneration/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/remuneration/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/remuneration/search", icon: <Search className="h-4 w-4" /> },
  { label: "Apply", href: "/remuneration/apply", icon: <File className="h-4 w-4" /> },
  { label: "Notifications", href: "/remuneration/notifications", icon: <Bell className="h-4 w-4" /> },
];

const FindDocument = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!user || !query.trim()) return;
    setSearching(true);
    setSearched(true);

    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .or(`title.ilike.%${query}%,reference_number.ilike.%${query}%,document_type.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    setResults(data || []);
    setSearching(false);
  };

  return (
    <DashboardLayout title="Remuneration Portal" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Find a Document</h1>
          <p className="text-muted-foreground mt-1">Search your documents by name, reference number, or type.</p>
        </div>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by document name, reference number, or party name..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!searched ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Enter a search term to find documents.</p>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents found matching "{query}".</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((doc) => (
              <Card key={doc.id} className="shadow-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <FileText className="h-8 w-8 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground truncate">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Ref: {doc.reference_number || "—"} • {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{doc.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindDocument;
