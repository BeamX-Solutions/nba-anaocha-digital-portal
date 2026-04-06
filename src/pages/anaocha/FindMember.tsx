import { useState } from "react";
import { Search, Scale, Users, MapPin, Calendar, Phone, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

interface MemberResult {
  id: string;
  first_name: string | null;
  surname: string | null;
  middle_name: string | null;
  year_of_call: string | null;
  office_address: string | null;
  branch: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  show_phone: boolean | null;
  show_email: boolean | null;
  show_office_address: boolean | null;
}

const FindMember = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MemberResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({ title: "Enter a search term", description: "Type a name or year of call to search.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const term = `%${query.trim()}%`;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, surname, middle_name, year_of_call, office_address, branch, phone, email, avatar_url, show_phone, show_email, show_office_address")
      .or(`first_name.ilike.${term},surname.ilike.${term},middle_name.ilike.${term},year_of_call.ilike.${term}`)
      .limit(20);

    setLoading(false);
    setSearched(true);

    if (error) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
      return;
    }
    setResults(data || []);
  };

  const fullName = (m: MemberResult) =>
    [m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ");

  const initials = (m: MemberResult) =>
    [m.first_name, m.surname].filter(Boolean).map((n) => n![0]).join("").toUpperCase() || "?";

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Find a Member</h1>
          <p className="text-muted-foreground mt-1">Search for NBA Anaocha Branch members by name or year of call.</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or year of call..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : <><Search className="h-4 w-4 mr-1" />Search</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searched && (
          results.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Members Found</h3>
                <p className="text-sm text-muted-foreground">No members match "{query}". Try a different name or year of call.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
              {results.map((member) => (
                <Card
                  key={member.id}
                  className="shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setSelected(member)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={fullName(member)} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">{initials(member)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground">{fullName(member)}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                        {member.year_of_call && <span>Called: {member.year_of_call}</span>}
                        {member.branch && <span>{member.branch} Branch</span>}
                      </div>
                    </div>
                    <span className="text-xs text-primary font-medium shrink-0">View Profile</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>

      {/* Member Profile Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Member Profile</DialogTitle>
              </DialogHeader>

              {/* Avatar + name */}
              <div className="flex flex-col items-center text-center pt-2 pb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mb-3 ring-4 ring-primary/10">
                  {selected.avatar_url ? (
                    <img src={selected.avatar_url} alt={fullName(selected)} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{initials(selected)}</span>
                  )}
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground">{fullName(selected)}</h2>
                <p className="text-sm text-muted-foreground">NBA Anaocha Branch Member</p>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t pt-4">
                {selected.year_of_call && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Year of Call</p>
                      <p className="font-medium text-foreground">{selected.year_of_call}</p>
                    </div>
                  </div>
                )}
                {selected.branch && (
                  <div className="flex items-center gap-3 text-sm">
                    <Scale className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Branch</p>
                      <p className="font-medium text-foreground">{selected.branch}</p>
                    </div>
                  </div>
                )}
                {selected.show_office_address && selected.office_address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Office Address</p>
                      <p className="font-medium text-foreground">{selected.office_address}</p>
                    </div>
                  </div>
                )}
                {selected.show_phone && selected.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${selected.phone}`} className="font-medium text-primary hover:underline">{selected.phone}</a>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full mt-2" onClick={() => setSelected(null)}>
                Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FindMember;
