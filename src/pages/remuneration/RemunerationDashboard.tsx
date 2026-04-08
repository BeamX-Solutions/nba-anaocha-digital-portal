import { useEffect, useState } from "react";
import { FileText, FolderOpen, CreditCard, Megaphone } from "lucide-react";
import RemunerationLayout from "@/components/RemunerationLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { remunerationSidebarItems } from "@/lib/sidebarItems";
import { supabase } from "@/integrations/supabase/client";

const RemunerationDashboard = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, title, content, created_at")
      .or("portal.eq.remuneration,portal.eq.both")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setAnnouncements(data || []));
  }, []);

  return (
    <RemunerationLayout sidebarItems={remunerationSidebarItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Remuneration Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Prepare legal documents and ensure compliance with Remuneration Order 2023.
          </p>
        </div>

        {announcements.length > 0 && (
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-accent" /> Announcements
            </h2>
            <div className="space-y-3">
              {announcements.map((a) => (
                <Card key={a.id} className="shadow-card border-l-4 border-l-accent">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm text-card-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      {new Date(a.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card hover:shadow-lg transition-shadow border-t-4 border-t-primary">
            <CardContent className="p-6">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-heading text-lg font-semibold mb-2">Prepare a Document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate or format legal documents with AI or from your precedent.
              </p>
              <Button variant="default" asChild>
                <Link to="/remuneration/prepare">Start</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-lg transition-shadow border-t-4 border-t-accent">
            <CardContent className="p-6">
              <FolderOpen className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-heading text-lg font-semibold mb-2">My Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage your previously prepared legal documents.
              </p>
              <Button variant="accent" asChild>
                <Link to="/remuneration/documents">View</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-lg transition-shadow border-t-4 border-t-primary">
            <CardContent className="p-6">
              <CreditCard className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-heading text-lg font-semibold mb-2">Payment History</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track your remuneration payments and download receipts.
              </p>
              <Button variant="outline" asChild>
                <Link to="/remuneration/payments">View</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RemunerationLayout>
  );
};

export default RemunerationDashboard;
