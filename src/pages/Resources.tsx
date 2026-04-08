import { useEffect, useState } from "react";
import { FileText, BookOpen, Scale, Download, ExternalLink, BookMarked } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Legal Compliance": <Scale className="h-6 w-6 text-primary" />,
  "Branch Documents": <FileText className="h-6 w-6 text-primary" />,
  "Practice Guides": <BookOpen className="h-6 w-6 text-primary" />,
  "General": <BookMarked className="h-6 w-6 text-primary" />,
};

const Resources = () => {
  const { portalAccess } = useAuth();
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const portal = portalAccess || "anaocha";
    supabase
      .from("resources")
      .select("*")
      .or(`portal.eq.both,portal.eq.${portal}`)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const items = data || [];
        setEmpty(items.length === 0);
        const map: Record<string, any[]> = {};
        items.forEach((r) => {
          if (!map[r.category]) map[r.category] = [];
          map[r.category].push(r);
        });
        setGrouped(map);
        setLoading(false);
      });
  }, [portalAccess]);

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-10">
        <div>
          <h1 className="font-heading text-4xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Official documents, guides, and references for members.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : empty ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No resources have been uploaded yet.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-4">
                {CATEGORY_ICONS[category] || <BookMarked className="h-6 w-6 text-primary" />}
                <h2 className="font-heading text-2xl font-semibold text-foreground">{category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <Card key={item.id} className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading text-base font-semibold text-card-foreground leading-snug flex-1">{item.title}</h3>
                        <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium flex-shrink-0">{item.type}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground flex-1 mb-4">{item.description}</p>
                      )}
                      {item.file_url ? (
                        <Button variant="outline" size="sm" asChild className="w-fit mt-auto">
                          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                            {item.type === "PDF" ? (
                              <><Download className="h-3.5 w-3.5 mr-1.5" />Download</>
                            ) : (
                              <><ExternalLink className="h-3.5 w-3.5 mr-1.5" />View</>
                            )}
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground mt-auto">File not yet available</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Resources;
