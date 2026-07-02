import { useEffect, useState, useRef } from "react";
import { Scale, ChevronDown, ChevronUp, Ban, CheckCircle, UserCheck, UserX, Shield, Download, Trash2, Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/auditLog";
import { csvCell } from "@/lib/utils";
import { RANK_LABELS } from "@/lib/constants";

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

  // Deny registration dialog
  const [denyTarget, setDenyTarget] = useState<any | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [denying, setDenying] = useState(false);

  // Delete account dialog
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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
      ["Name", "LBIAN", "Email", "SCN", "Year of Call", "Phone", "Status", "Joined"],
      ...members.map((m) => [
        [m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "-",
        m.lbian || "-",
        m.email || "-", m.scn || "-",
        m.year_of_call || "-", m.phone || "-", m.status || "-",
        new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `members-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const approveAccount = async (m: any) => {
    // The DB trigger assigns the LBIAN on this status change; read it back.
    const { data, error } = await supabase.from("profiles").update({ status: "active" }).eq("id", m.id).select("lbian").single();
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    await supabase.from("notifications").insert({
      user_id: m.user_id,
      title: "Account Approved",
      message: "Your NBA Anaocha portal account has been approved. You can now access all member features.",
      type: "account",
    });
    if (m.email) await supabase.functions.invoke("send-email", { body: { type: "account_approved", to: m.email, name: memberName } });
    if (user) logAudit(user.id, "member_approved", "profile", m.id, { member_email: m.email, member_name: memberName, lbian: data?.lbian });
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: "active", lbian: data?.lbian ?? mem.lbian } : mem);
    setMembers(updated); setFiltered(updated);
    toast({ title: "Account approved", description: data?.lbian ? `${memberName} approved · LBIAN ${data.lbian}` : `${memberName} can now access the portal.` });
  };

  const setMemberRank = async (m: any, rank: string) => {
    const { error } = await supabase.from("profiles").update({ rank }).eq("id", m.id);
    if (error) { toast({ title: "Failed to update seniority", description: error.message, variant: "destructive" }); return; }
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, rank } : mem);
    setMembers(updated); setFiltered(updated);
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    if (user) logAudit(user.id, "member_rank_updated", "profile", m.id, { rank, member_email: m.email });
    toast({ title: "Seniority updated", description: `${memberName} set to ${RANK_LABELS[rank] ?? rank}.` });
  };

  const confirmDeny = async () => {
    if (!denyTarget) return;
    const m = denyTarget;
    setDenying(true);
    const { error } = await supabase.from("profiles").update({ status: "denied" }).eq("id", m.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); setDenying(false); return; }
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    const reason = denyReason.trim();
    await supabase.from("notifications").insert({
      user_id: m.user_id,
      title: "Registration Not Approved",
      message: `Your NBA Anaocha portal registration could not be approved.${reason ? ` Reason: ${reason}.` : ""} Please contact the branch secretariat for assistance.`,
      type: "account",
    });
    let emailFailed = false;
    if (m.email) {
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: { type: "account_denied", to: m.email, name: memberName, reason: reason || undefined },
      });
      if (emailError) emailFailed = true;
    }
    if (user) logAudit(user.id, "member_denied", "profile", m.id, { member_email: m.email, member_name: memberName, reason: reason || null });
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: "denied" } : mem);
    setMembers(updated); setFiltered(updated);
    setDenying(false); setDenyTarget(null); setDenyReason("");
    toast({
      title: "Registration denied",
      description: emailFailed ? "Denied. In-app notification sent but email failed." : `${memberName} has been notified by email.`,
      variant: emailFailed ? "destructive" : "default",
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const m = deleteTarget;
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: m.user_id },
    });
    setDeleting(false);
    if (error || data?.error) {
      toast({ title: "Delete failed", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    setMembers((prev) => prev.filter((mem) => mem.id !== m.id));
    setFiltered((prev) => prev.filter((mem) => mem.id !== m.id));
    setDeleteTarget(null); setDeleteConfirm("");
    toast({ title: "Account deleted", description: `${memberName}'s account and records have been permanently removed.` });
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
                          {m.rank && m.rank !== "regular" && <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px]">{m.rank === "san" ? "SAN" : "Bencher"}</Badge>}
                          {m.status === "pending"   && <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pending</Badge>}
                          {m.status === "denied"    && <Badge className="bg-red-100 text-red-700 border-red-300">Denied</Badge>}
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
                          <div><span className="text-muted-foreground">LBIAN:</span> {m.lbian || <span className="italic text-muted-foreground/70">issued on approval</span>}</div>
                          <div><span className="text-muted-foreground">Year of Call:</span> {m.year_of_call || "-"}</div>
                          <div><span className="text-muted-foreground">SCN:</span> {m.scn || "-"}</div>
                          <div><span className="text-muted-foreground">Phone:</span> {m.phone || "-"}</div>
                          <div><span className="text-muted-foreground">Office:</span> {m.office_address || "-"}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Seniority:</span>
                          <select
                            value={m.rank || "regular"}
                            onChange={(e) => setMemberRank(m, e.target.value)}
                            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {Object.entries(RANK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <span className="text-xs text-muted-foreground">Determines tiered dues (e.g. Welfare Levy).</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(m.status === "pending" || m.status === "denied") ? (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => approveAccount(m)}>
                                <UserCheck className="h-4 w-4" /> Approve Account
                              </Button>
                              {m.status === "pending" && (
                                <Button size="sm" variant="destructive" className="gap-1" onClick={() => { setDenyTarget(m); setDenyReason(""); }}>
                                  <UserX className="h-4 w-4" /> Deny
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button size="sm" variant={m.status === "suspended" ? "default" : "destructive"} onClick={() => toggleSuspend(m)} className="gap-1">
                              {m.status === "suspended"
                                ? <><CheckCircle className="h-4 w-4" /> Reinstate</>
                                : <><Ban className="h-4 w-4" /> Suspend</>}
                            </Button>
                          )}
                          {!m.is_admin && m.user_id !== user?.id && (
                            <Button
                              size="sm" variant="outline"
                              className="gap-1 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 ml-auto"
                              onClick={() => { setDeleteTarget(m); setDeleteConfirm(""); }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete Account
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

      {/* Deny registration dialog */}
      <Dialog open={!!denyTarget} onOpenChange={(open) => { if (!open) setDenyTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deny Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Denying the registration of{" "}
              <span className="font-semibold text-foreground">
                {[denyTarget?.surname, denyTarget?.first_name].filter(Boolean).join(" ") || denyTarget?.email}
              </span>. They will be notified by email and in-app. You can still approve the account later.
            </p>
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={3}
              placeholder="e.g. We could not verify your Supreme Court Number. Please contact the secretariat."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">Optional, but strongly recommended.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyTarget(null)} disabled={denying}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeny} disabled={denying}>
              {denying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserX className="h-4 w-4 mr-1" />}
              Confirm Denial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirm(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Permanently Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              This permanently deletes{" "}
              <span className="font-semibold text-foreground">
                {[deleteTarget?.surname, deleteTarget?.first_name].filter(Boolean).join(" ") || deleteTarget?.email}
              </span>
              's login, profile, applications, notifications, payment records and uploaded files.{" "}
              <span className="font-semibold text-destructive">This cannot be undone.</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteConfirm(""); }} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting || deleteConfirm !== "DELETE"}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMembers;
