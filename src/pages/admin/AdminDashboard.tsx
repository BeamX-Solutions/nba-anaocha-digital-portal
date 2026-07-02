import { useEffect, useState } from "react";
import { Users, ClipboardList, UserPlus, UserCog, FileCheck, Mail, Landmark, CreditCard } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { SERVICE_LABELS } from "@/lib/constants";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const AdminDashboard = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const yearStart = `${new Date().getFullYear()}-01-01`;
        const sb = supabase as any;
        const [
          members, pendingRegs, applications, profileChanges,
          receipts, contacts, duesPaid, servicePaid,
        ] = await Promise.all([
          sb.from("profiles").select("id", { count: "exact", head: true }).eq("portal_access", "anaocha"),
          sb.from("profiles").select("id", { count: "exact", head: true }).eq("portal_access", "anaocha").eq("status", "pending"),
          sb.from("service_applications").select("id, status, service_type, created_at").order("created_at", { ascending: false }),
          sb.from("profile_change_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
          sb.from("dues_payments").select("id", { count: "exact", head: true }).eq("status", "uploaded"),
          sb.from("contact_messages").select("id", { count: "exact", head: true }).is("replied_at", null),
          sb.from("dues_payments").select("amount").eq("status", "paid").gte("paid_at", yearStart),
          sb.from("payments").select("amount").eq("status", "success").gte("created_at", yearStart),
        ]);
        const apps = applications.data || [];
        setStats({
          members:          members.count || 0,
          pendingRegs:      pendingRegs.count || 0,
          totalApplications: apps.length,
          pendingApps:      apps.filter((a: any) => a.status === "pending").length,
          profileChanges:   profileChanges.count || 0,
          receipts:         receipts.count || 0,
          contacts:         contacts.count || 0,
          duesRevenue:      (duesPaid.data || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
          serviceRevenue:   (servicePaid.data || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0),
        });
        setRecentApplications(apps.slice(0, 5));
        setLoading(false);
      } catch {
        setError("Failed to load dashboard data. Please refresh.");
        setLoading(false);
      }
    };
    load();
  }, []);

  // Queues that need admin action light up amber when non-empty.
  const queueCards = [
    { label: "Pending Registrations", value: stats.pendingRegs,    icon: UserPlus,      href: "/admin/members" },
    { label: "Pending Applications",  value: stats.pendingApps,    icon: ClipboardList, href: "/admin/applications" },
    { label: "Profile Changes",       value: stats.profileChanges, icon: UserCog,       href: "/admin/profile-changes" },
    { label: "Receipts to Verify",    value: stats.receipts,       icon: FileCheck,     href: "/admin/dues" },
    { label: "Unreplied Messages",    value: stats.contacts,       icon: Mail,          href: "/admin/contacts" },
  ];

  const infoCards = [
    { label: "Anaocha Members",              value: `${stats.members ?? 0}`,               icon: Users,      href: "/admin/members" },
    { label: "Applications (All Time)",      value: `${stats.totalApplications ?? 0}`,     icon: ClipboardList, href: "/admin/applications" },
    { label: `Dues Collected (${new Date().getFullYear()})`,   value: naira(stats.duesRevenue ?? 0),    icon: Landmark,   href: "/admin/reporting" },
    { label: `Service Payments (${new Date().getFullYear()})`, value: naira(stats.serviceRevenue ?? 0), icon: CreditCard, href: "/admin/reporting" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of NBA Anaocha Branch activity.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : (
          <>
            {/* Action queues */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Needs Attention</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {queueCards.map((s) => {
                  const active = (s.value ?? 0) > 0;
                  const Icon = s.icon;
                  return (
                    <Link key={s.label} to={s.href}>
                      <Card className={`shadow-card hover:shadow-lg transition-shadow cursor-pointer h-full ${active ? "border-amber-200 bg-amber-50/40" : ""}`}>
                        <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center ${active ? "bg-amber-100" : "bg-primary/10"}`}>
                            <Icon className={`h-5 w-5 ${active ? "text-amber-600" : "text-primary"}`} />
                          </div>
                          <p className={`text-2xl font-bold ${active ? "text-amber-700" : "text-foreground"}`}>{s.value ?? 0}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Branch at a glance */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">At a Glance</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {infoCards.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link key={s.label} to={s.href}>
                      <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-2xl font-bold text-foreground">{s.value}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {recentApplications.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-foreground">Recent Applications</h2>
                  <Link to="/admin/applications" className="text-sm text-primary hover:underline">View all →</Link>
                </div>
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
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
