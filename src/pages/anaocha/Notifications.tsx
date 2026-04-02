import { useState, useEffect } from "react";
import { CheckCheck, Circle, Bell } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setNotifications(data || []);
        setLoading(false);
      });
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : 'You\'re all caught up.'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : notifications.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Notifications</h3>
              <p className="text-sm text-muted-foreground">You'll be notified when there are updates to your applications or account.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`shadow-card transition-colors cursor-pointer ${!n.read ? 'border-l-4 border-l-accent bg-accent/5' : ''}`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-1">
                    {n.read ? (
                      <CheckCheck className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Circle className="h-4 w-4 fill-accent text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-card-foreground">{n.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
