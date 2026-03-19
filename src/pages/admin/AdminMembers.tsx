import { useEffect, useState } from "react";
import { Search, User, Scale } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMembers(data || []);
        setFiltered(data || []);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) { setFiltered(members); return; }
    setFiltered(
      members.filter((m) =>
        [m.first_name, m.surname, m.middle_name, m.email, m.year_of_call, m.branch, m.phone]
          .some((v) => v?.toLowerCase().includes(q))
      )
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground mt-1">
              {members.length} registered member{members.length !== 1 ? "s" : ""} in the portal.
            </p>
          </div>
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
                  if (!e.target.value) setFiltered(members);
                }}
                placeholder="Search by name, email, year of call, branch..."
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
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No members found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <Card key={m.id} className="shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
                    <div>
                      <p className="font-semibold text-card-foreground text-sm">
                        {[m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.email || "No email"}</p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {m.year_of_call && <p>Called: {m.year_of_call}</p>}
                      {m.phone && <p>Phone: {m.phone}</p>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {m.branch && <p>Branch: {m.branch}</p>}
                      {m.office_address && <p className="truncate">Office: {m.office_address}</p>}
                      <p className="text-xs">
                        Joined: {new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMembers;
