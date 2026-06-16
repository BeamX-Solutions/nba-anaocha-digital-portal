import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, BookOpen, Trash2, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { SERVICE_LABELS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SERVICE_ICONS: Record<string, string> = {
  nba_diary:                 "📘",
  nba_id_card:               "🪪",
  apc:                       "📜",
  letter_of_good_standing:   "✅",
  stamp_seal:                "🔏",
  title_document_front_page: "📄",
};

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
  pending:  { variant: "secondary",    icon: <Clock className="h-3 w-3" />,       label: "Pending" },
  approved: { variant: "default",      icon: <CheckCircle className="h-3 w-3" />, label: "Approved" },
  rejected: { variant: "destructive",  icon: <XCircle className="h-3 w-3" />,     label: "Rejected" },
};

const MyApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<any | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("service_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setApplications(data || []);
        setLoading(false);
      });
  }, [user]);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    const { error } = await supabase
      .from("service_applications")
      .delete()
      .eq("id", withdrawTarget.id)
      .eq("user_id", user!.id);
    setWithdrawing(false);
    if (error) {
      toast({ title: "Failed to withdraw", description: error.message, variant: "destructive" });
      return;
    }
    setApplications((prev) => prev.filter((a) => a.id !== withdrawTarget.id));
    setWithdrawTarget(null);
    toast({ title: "Application withdrawn." });
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of your submitted service applications.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : applications.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Applications Yet</h3>
              <p className="text-sm text-muted-foreground">
                Visit the <Link to="/anaocha/apply" className="text-accent hover:underline">Apply for Services</Link> page to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const svc = { label: SERVICE_LABELS[app.service_type] || app.service_type, icon: SERVICE_ICONS[app.service_type] || "📄" };
              const status = statusConfig[app.status] || statusConfig.pending;
              return (
                <Card key={app.id} className="shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl flex-shrink-0">{svc.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base font-semibold text-card-foreground">{svc.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(app.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {app.payment_status === "paid" && (
                          <p className="text-xs text-green-700 font-medium mt-0.5">Payment confirmed</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={status.variant} className="flex items-center gap-1 capitalize">
                          {status.icon} {status.label}
                        </Badge>
                        {app.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setWithdrawTarget(app)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {app.status === "rejected" && app.rejection_reason && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                        <p className="text-xs font-semibold text-red-700 mb-0.5">Reason for rejection</p>
                        <p className="text-sm text-red-800">{app.rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw confirmation dialog */}
      <Dialog open={!!withdrawTarget} onOpenChange={(open) => { if (!open) setWithdrawTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Withdraw Application?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This will permanently remove your <span className="font-semibold text-foreground">{SERVICE_LABELS[withdrawTarget?.service_type] || withdrawTarget?.service_type}</span> application. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawTarget(null)} disabled={withdrawing}>Cancel</Button>
            <Button variant="destructive" onClick={confirmWithdraw} disabled={withdrawing}>
              {withdrawing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyApplications;
