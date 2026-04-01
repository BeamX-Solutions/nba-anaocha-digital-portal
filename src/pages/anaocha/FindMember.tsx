import { useState } from "react";
import { Search, Scale, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
}

const FindMember = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

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
      .select("id, first_name, surname, middle_name, year_of_call, office_address, branch")
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
                <Card key={member.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground">
                        {[member.surname, member.first_name, member.middle_name].filter(Boolean).join(" ")}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {member.year_of_call && <span>Called to Bar: {member.year_of_call}</span>}
                        {member.branch && <span>Branch: {member.branch}</span>}
                        {member.office_address && <span className="truncate max-w-xs">{member.office_address}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindMember;
