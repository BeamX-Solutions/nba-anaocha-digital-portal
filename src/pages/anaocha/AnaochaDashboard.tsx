import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { SERVICE_LABELS } from "@/lib/constants";
import {
  FileText, Scale, Users, Phone, Bell, ClipboardList, ArrowRight, BookMarked,
} from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

const quickActions = [
  { label: "Apply for Services", href: "/anaocha/apply", icon: <FileText className="h-5 w-5" />, desc: "NBA Diary, ID Card, BAIN, Stamp & Seal" },
  { label: "Prepare a Document", href: "/remuneration/prepare", icon: <Scale className="h-5 w-5" />, desc: "Deeds, POA, Tenancy and more" },
  { label: "Find a Member", href: "/anaocha/members", icon: <Users className="h-5 w-5" />, desc: "Search the member directory" },
  { label: "Notifications", href: "/anaocha/notifications", icon: <Bell className="h-5 w-5" />, desc: "View all your alerts" },
  { label: "Contact Us", href: "/anaocha/contact", icon: <Phone className="h-5 w-5" />, desc: "Reach the secretariat" },
];

const AnaochaDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ applications: 0, documents: 0, unread: 0 });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [profileRes, appsRes, docsRes, notifsRes] = await Promise.all([
        supabase.from("profiles").select("first_name, surname, year_of_call, branch").eq("user_id", user.id).single(),
        supabase.from("service_applications").select("id, service_type, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("documents").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("notifications").select("id, title, message, read, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
      ]);

      setProfile(profileRes.data);
      const apps = appsRes.data || [];
      setStats({
        applications: apps.length,
        documents: docsRes.count || 0,
        unread: (notifsRes.data || []).filter((n) => !n.read).length,
      });
      setRecentApplications(apps.slice(0, 3));
      setRecentNotifications(notifsRes.data || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const greeting = profile?.first_name
    ? `Welcome back, ${profile.first_name}`
    : "Welcome back";

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{greeting}</h1>
            <p className="text-muted-foreground mt-1">
              {[
                profile?.branch && `${profile.branch} Branch`,
                profile?.year_of_call && `Called ${profile.year_of_call}`,
              ].filter(Boolean).join(" · ") || "NBA Anaocha Member Portal"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/anaocha/applications">
            <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : stats.applications}</p>
                  <p className="text-sm text-muted-foreground">Application{stats.applications !== 1 ? "s" : ""}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/remuneration/documents">
            <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : stats.documents}</p>
                  <p className="text-sm text-muted-foreground">Document{stats.documents !== 1 ? "s" : ""} Prepared</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/anaocha/notifications">
            <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : stats.unread}</p>
                  <p className="text-sm text-muted-foreground">Unread Notification{stats.unread !== 1 ? "s" : ""}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className="shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row: recent applications + recent notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">Recent Applications</h2>
              <Link to="/anaocha/applications" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <Card className="shadow-card">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="py-10 text-center">
                    <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No applications yet.</p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link to="/anaocha/apply">Apply Now</Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recentApplications.map((app) => (
                      <li key={app.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {SERVICE_LABELS[app.service_type] || app.service_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <Badge variant={STATUS_VARIANT[app.status] || "secondary"} className="capitalize">
                          {app.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">Recent Notifications</h2>
              <Link to="/anaocha/notifications" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <Card className="shadow-card">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recentNotifications.map((n) => (
                      <li key={n.id} className={`px-5 py-3 ${!n.read ? "bg-primary/5" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnaochaDashboard;
