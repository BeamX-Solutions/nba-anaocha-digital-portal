import { useEffect, useState, useRef } from "react";
import { Scale, ChevronDown, ChevronUp, Ban, CheckCircle, UserCheck, Shield, Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/auditLog";

const AdminMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("portal_access", "anaocha")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setMembers(data || []);
        setFiltered(data || []);
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase().trim();
      setFiltered(!q ? members : members.filter((m) =>
        [m.first_name, m.surname, m.middle_name, m.email, m.year_of_call, m.phone]
          .some((v) => v?.toLowerCase().includes(q))
      ));
    }, 200);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Name", "Email", "BAN", "Year of Call", "Phone", "Status", "Joined"],
      ...members.map((m) => [
        [m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "-",
        m.email || "-", m.ban || "-",
        m.year_of_call || "-", m.phone || "-", m.status || "-",
        new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `members-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const approveAccount = async (m: any) => {
    const { error } = await supabase.from("profiles").update({ status: "active" }).eq("id", m.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    await supabase.from("notifications").insert({
      user_id: m.user_id,
      title: "Account Approved",
      message: "Your NBA Anaocha portal account has been approved. You can now access all member features.",
      type: "account",
    });
    if (m.email) await supabase.functions.invoke("send-email", { body: { type: "account_approved", to: m.email, name: memberName } });
    if (user) logAudit(user.id, "member_approved", "profile", m.id, { member_email: m.email, member_name: memberName });
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: "active" } : mem);
    setMembers(updated); setFiltered(updated);
    toast({ title: "Account approved", description: `${memberName} can now access the portal.` });
  };

  const toggleSuspend = async (m: any) => {
    const newStatus = m.status === "suspended" ? "active" : "suspended";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", m.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    await supabase.from("notifications").insert({
      user_id: m.user_id,
      title: newStatus === "suspended" ? "Account Suspended" : "Account Reinstated",
      message: newStatus === "suspended"
        ? "Your NBA Anaocha portal account has been suspended. Please contact the secretariat for assistance."
        : "Your NBA Anaocha portal account has been reinstated. You can now access all portal features.",
      type: "account",
    });
    if (m.email) await supabase.functions.invoke("send-email", { body: { type: newStatus === "suspended" ? "account_suspended" : "account_reinstated", to: m.email, name: memberName } });
    if (user) logAudit(user.id, newStatus === "suspended" ? "member_suspended" : "member_reinstated", "profile", m.id, { member_email: m.email, member_name: memberName });
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: newStatus } : mem);
    setMembers(updated); setFiltered(updated);
    toast({ title: newStatus === "suspended" ? "Member suspended" : "Member reinstated" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground mt-1">{members.length} registered member{members.length !== 1 ? "s" : ""} in the portal.</p>
          </div>
          {members.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )}
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <input
              type="text" value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, year of call..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{query ? "No members match your search." : "No members found."}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => {
              const isExpanded = expanded === m.id;
              return (
                <Card key={m.id} className={`shadow-card transition-shadow ${m.status === "suspended" ? "opacity-60" : ""} ${m.status === "pending" ? "border-amber-300" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : m.id)}>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {m.is_admin ? <Shield className="h-5 w-5 text-accent" /> : <Scale className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
                        <div>
                          <p className="font-semibold text-card-foreground text-sm">
                            {[m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.email || "No email"}</p>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          {m.year_of_call && <p>Called {m.year_of_call}</p>}
                          {m.phone && <p>{m.phone}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {m.is_admin    && <Badge className="bg-accent/20 text-accent border border-accent/40 text-[10px]">Admin</Badge>}
                          {m.status === "pending"   && <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pending</Badge>}
                          {m.status === "suspended" && <Badge variant="destructive">Suspended</Badge>}
                          <p className="text-xs text-muted-foreground ml-auto">
                            {new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Year of Call:</span> {m.year_of_call || "-"}</div>
                          <div><span className="text-muted-foreground">BAN:</span> {m.ban || "-"}</div>
                          <div><span className="text-muted-foreground">Phone:</span> {m.phone || "-"}</div>
                          <div><span className="text-muted-foreground">Office:</span> {m.office_address || "-"}</div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {m.status === "pending" ? (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => approveAccount(m)}>
                              <UserCheck className="h-4 w-4" /> Approve Account
                            </Button>
                          ) : (
                            <Button size="sm" variant={m.status === "suspended" ? "default" : "destructive"} onClick={() => toggleSuspend(m)} className="gap-1">
                              {m.status === "suspended"
                                ? <><CheckCircle className="h-4 w-4" /> Reinstate</>
                                : <><Ban className="h-4 w-4" /> Suspend</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
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

export default AdminMembers;
