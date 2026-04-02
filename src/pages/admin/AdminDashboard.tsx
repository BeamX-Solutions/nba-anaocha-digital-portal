import { useEffect, useState } from "react";
import { Users, ClipboardList, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { SERVICE_LABELS } from "@/lib/constants";

interface Stats {
  totalMembers: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalDocuments: number;
}


const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalDocuments: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [members, applications, documents] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("service_applications").select("id, status, service_type, created_at"),
          supabase.from("documents").select("id", { count: "exact", head: true }),
        ]);

        if (members.error || applications.error || documents.error) {
          setError("Failed to load dashboard data. Please refresh.");
          setLoading(false);
          return;
        }

        const apps = applications.data || [];
        setStats({
          totalMembers: members.count || 0,
          totalApplications: apps.length,
          pendingApplications: apps.filter((a) => a.status === "pending").length,
          approvedApplications: apps.filter((a) => a.status === "approved").length,
          rejectedApplications: apps.filter((a) => a.status === "rejected").length,
          totalDocuments: documents.count || 0,
        });

        const { data: recent } = await supabase
          .from("service_applications")
          .select("id, service_type, status, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentApplications(recent || []);
        setLoading(false);
      } catch {
        setError("Failed to load dashboard data. Please refresh.");
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Members", value: stats.totalMembers, icon: <Users className="h-6 w-6 text-primary" />, href: "/admin/members" },
    { label: "Total Applications", value: stats.totalApplications, icon: <ClipboardList className="h-6 w-6 text-accent" />, href: "/admin/applications" },
    { label: "Pending", value: stats.pendingApplications, icon: <Clock className="h-6 w-6 text-yellow-600" />, href: "/admin/applications" },
    { label: "Approved", value: stats.approvedApplications, icon: <CheckCircle className="h-6 w-6 text-green-600" />, href: "/admin/applications" },
    { label: "Rejected", value: stats.rejectedApplications, icon: <XCircle className="h-6 w-6 text-red-600" />, href: "/admin/applications" },
    { label: "Documents", value: stats.totalDocuments, icon: <FileText className="h-6 w-6 text-primary" />, href: "/admin/documents" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of NBA Anaocha Portal activity.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((s) => (
                <Link key={s.label} to={s.href}>
                  <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                      {s.icon}
                      <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Recent Applications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">Recent Applications</h2>
                <Link to="/admin/applications" className="text-sm text-primary hover:underline">View all →</Link>
              </div>
              {recentApplications.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center text-muted-foreground">No applications yet.</CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {recentApplications.map((app) => (
                    <Card key={app.id} className="shadow-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">
                            {SERVICE_LABELS[app.service_type] || app.service_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                          app.status === "approved" ? "bg-green-100 text-green-800" :
                          app.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {app.status}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
