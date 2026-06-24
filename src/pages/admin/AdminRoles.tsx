import { useEffect, useState } from "react";
import { Shield, ShieldOff, UserCog } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/auditLog";

const AdminRoles = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const toggleAdmin = async (m: any) => {
    const newVal = !m.is_admin;
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ is_admin: newVal })
      .eq("id", m.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    const name = [m.surname, m.first_name].filter(Boolean).join(" ") || m.email || "Member";
    if (user) {
      logAudit(user.id, newVal ? "admin_granted" : "admin_revoked", "profile", m.id, {
        member_email: m.email,
        member_name: name,
      });
    }
    setMembers((prev) => prev.map((p) => p.id === m.id ? { ...p, is_admin: newVal } : p));
    toast({
      title: newVal ? "Admin access granted" : "Admin access revoked",
      description: `${name} ${newVal ? "is now an admin" : "is no longer an admin"}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Admin Roles</h1>
          <p className="text-muted-foreground mt-1">Manage which members have administrative access to this portal.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No members found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {members.map((m) => {
              const name = [m.surname, m.first_name].filter(Boolean).join(" ") || "-";
              return (
                <Card
                  key={m.id}
                  className={`shadow-card transition-colors ${m.is_admin ? "border-accent/40 bg-accent/5" : ""}`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {m.is_admin
                        ? <Shield className="h-4 w-4 text-accent" />
                        : <UserCog className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{m.email || "No email"}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {m.is_admin && (
                        <Badge className="bg-accent/20 text-accent border border-accent/40 text-[10px]">Admin</Badge>
                      )}
                      <Badge
                        variant={
                          m.status === "active" ? "default" :
                          m.status === "suspended" ? "destructive" : "secondary"
                        }
                        className="capitalize text-[10px]"
                      >
                        {m.status || "pending"}
                      </Badge>
                      <Button
                        size="sm"
                        variant={m.is_admin ? "destructive" : "default"}
                        onClick={() => toggleAdmin(m)}
                        className="gap-1.5"
                      >
                        {m.is_admin
                          ? <><ShieldOff className="h-3.5 w-3.5" />Revoke</>
                          : <><Shield className="h-3.5 w-3.5" />Grant</>}
                      </Button>
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
