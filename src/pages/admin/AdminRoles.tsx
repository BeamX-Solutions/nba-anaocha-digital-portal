import { useEffect, useState } from "react";
import { Shield, UserCog, Lock } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const AdminRoles = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("profiles")
      .select("id, user_id, first_name, surname, email, status, is_admin")
      .order("created_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (!error) setMembers(data || []);
        setLoading(false);
      });
  }, []);

  const admins = members.filter((m) => m.is_admin);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Admin Roles</h1>
          <p className="text-muted-foreground mt-1">Members with administrative access to this portal.</p>
        </div>

        <Card className="shadow-card border-muted">
          <CardContent className="p-4 flex items-start gap-3">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              For security, admin access cannot be granted or revoked from the website. It is
              managed directly in the database by a system administrator (the <code>profiles.is_admin</code> flag).
            </p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No admins found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {admins.map((m) => {
              const name = [m.surname, m.first_name].filter(Boolean).join(" ") || "-";
              return (
                <Card key={m.id} className="shadow-card border-accent/40 bg-accent/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{m.email || "No email"}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className="bg-accent/20 text-accent border border-accent/40 text-[10px]">Admin</Badge>
                      <Badge
                        variant={
                          m.status === "active" ? "default" :
                          m.status === "suspended" ? "destructive" : "secondary"
                        }
                        className="capitalize text-[10px]"
                      >
                        {m.status || "pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;
