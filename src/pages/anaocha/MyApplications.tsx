import { useState, useEffect } from "react";
import { User, FileText, Bell, CreditCard, Info, Users, Phone, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { label: "My Profile", href: "/anaocha/profile", icon: <User className="h-4 w-4" /> },
  { label: "Apply for Services", href: "/anaocha/apply", icon: <FileText className="h-4 w-4" /> },
  { label: "My Applications", href: "/anaocha/applications", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Payments", href: "/anaocha/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "About Branch", href: "/anaocha/about", icon: <Info className="h-4 w-4" /> },
  { label: "Committees", href: "/anaocha/committees", icon: <Users className="h-4 w-4" /> },
  { label: "Find a Member", href: "/anaocha/members", icon: <Users className="h-4 w-4" /> },
  { label: "Notifications", href: "/anaocha/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "Contact Us", href: "/anaocha/contact", icon: <Phone className="h-4 w-4" /> },
];

const serviceTypeLabels: Record<string, { label: string; icon: string }> = {
  nba_diary: { label: "NBA Diary", icon: "📘" },
  nba_id_card: { label: "NBA ID Card", icon: "🪪" },
  bain: { label: "Bar Identification Number", icon: "🔖" },
  stamp_seal: { label: "Stamp & Seal", icon: "🔏" },
};

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  approved: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("service_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of your submitted service applications.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Applications Yet</h3>
              <p className="text-sm text-muted-foreground">
                Visit the <a href="/anaocha/apply" className="text-accent hover:underline">Apply for Services</a> page to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const svc = serviceTypeLabels[app.service_type] || { label: app.service_type, icon: "📄" };
              const status = statusConfig[app.status] || statusConfig.pending;
              return (
                <Card key={app.id} className="shadow-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="text-3xl">{svc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base font-semibold text-card-foreground">{svc.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(app.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="flex items-center gap-1 capitalize">
                      {status.icon} {app.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
