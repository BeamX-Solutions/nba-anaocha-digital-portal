import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const SERVICE_LABELS: Record<string, string> = {
  nba_diary: "NBA Diary",
  nba_id_card: "NBA ID Card",
  bain: "Bar Identification Number",
  stamp_seal: "Stamp & Seal",
  title_document_front_page: "Title Document Front Page",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const AnaochaPayments = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("service_applications")
      .select("*")
      .eq("user_id", user.id)
      .not("file_urls", "is", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Payment Receipts</h1>
          <p className="text-muted-foreground mt-1">
            Applications where you uploaded a proof of payment. Online payments will be available soon.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Payment Records</h3>
              <p className="text-sm text-muted-foreground">
                Your payment receipts will appear here once you submit applications with proof of payment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id} className="shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Receipt className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground">
                        {SERVICE_LABELS[app.service_type] || app.service_type}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted: {new Date(app.created_at).toLocaleDateString("en-NG", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                      {app.file_urls?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {app.file_urls.length} document{app.file_urls.length !== 1 ? "s" : ""} uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>
                    {app.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnaochaPayments;
