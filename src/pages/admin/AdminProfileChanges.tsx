import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, UserCog, ArrowRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/auditLog";

const FIELD_LABELS: Record<string, string> = {
  first_name:   "First Name",
  surname:      "Surname",
  middle_name:  "Middle Name",
  scn:          "Supreme Court Number (SCN)",
  year_of_call: "Year of Call",
};

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const AdminProfileChanges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  // Rejection reason dialog
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: reqs } = await supabase
        .from("profile_change_requests")
        .select("*")
        .order("created_at", { ascending: false });

      const list = reqs || [];
      setRequests(list);

      const userIds = [...new Set(list.map((r: any) => r.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, first_name, surname, email, lbian")
          .in("user_id", userIds as string[]);
        const map: Record<string, any> = {};
        (profileData || []).forEach((p) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const summarize = (changes: Record<string, string>, previous: Record<string, string>) =>
    Object.entries(changes)
      .map(([k, v]) => `${FIELD_LABELS[k] || k}: "${previous?.[k] || "—"}" → "${v || "—"}"`)
      .join("; ");

  const approve = async (req: any) => {
    setUpdating(req.id);
    const profile = profiles[req.user_id];
    const memberName = [profile?.surname, profile?.first_name].filter(Boolean).join(" ") || "Member";

    // Apply only whitelisted identity fields — never other profile columns,
    // even if a crafted request smuggled them in.
    const changes = Object.fromEntries(
      Object.entries(req.changes || {}).filter(([k]) => k in FIELD_LABELS)
    );
    if (Object.keys(changes).length === 0) {
      toast({ title: "Nothing to apply", description: "This request contains no recognised identity fields.", variant: "destructive" });
      setUpdating(null);
      return;
    }
    const { error: applyErr } = await supabase
      .from("profiles").update(changes).eq("user_id", req.user_id);
    if (applyErr) {
      toast({ title: "Failed to apply changes", description: applyErr.message, variant: "destructive" });
      setUpdating(null);
      return;
    }

    const { error: reqErr } = await supabase
      .from("profile_change_requests")
      .update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
    if (reqErr) {
      toast({ title: "Changes applied but request not closed", description: reqErr.message, variant: "destructive" });
      setUpdating(null);
      return;
    }

    await supabase.from("notifications").insert({
      user_id: req.user_id,
      title: "Profile Changes Approved",
      message: "Your requested profile changes have been approved by the secretariat and are now live.",
      type: "account",
    });

    let emailFailed = false;
    if (profile?.email) {
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          type: "profile_change_approved",
          to: profile.email,
          name: memberName,
          changes_summary: summarize(req.changes, req.previous),
        },
      });
      if (emailError) emailFailed = true;
    }

    if (user) logAudit(user.id, "profile_change_approved", "profile_change_request", req.id, { member_email: profile?.email, changes: req.changes });

    setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "approved", reviewed_at: new Date().toISOString() } : r));
    setUpdating(null);
    toast({
      title: "Changes approved",
      description: emailFailed ? "Applied. In-app notification sent but email failed." : `${memberName} has been notified.`,
      variant: emailFailed ? "destructive" : "default",
    });
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    const reason = rejectReason.trim();

    const { error } = await supabase
      .from("profile_change_requests")
      .update({ status: "rejected", reason: reason || null, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", rejectTarget.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setRejecting(false);
      return;
    }

    const profile = profiles[rejectTarget.user_id];
    const memberName = [profile?.surname, profile?.first_name].filter(Boolean).join(" ") || "Member";

    await supabase.from("notifications").insert({
      user_id: rejectTarget.user_id,
      title: "Profile Changes Not Approved",
      message: `Your requested profile changes could not be approved.${reason ? ` Reason: ${reason}.` : ""} Your profile remains unchanged.`,
      type: "account",
    });

    let emailFailed = false;
    if (profile?.email) {
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: { type: "profile_change_rejected", to: profile.email, name: memberName, reason: reason || undefined },
      });
      if (emailError) emailFailed = true;
    }

    if (user) logAudit(user.id, "profile_change_rejected", "profile_change_request", rejectTarget.id, { member_email: profile?.email, reason: reason || null });

    setRequests((prev) => prev.map((r) => r.id === rejectTarget.id ? { ...r, status: "rejected", reason: reason || null } : r));
    setRejecting(false);
    setRejectTarget(null);
    setRejectReason("");
    toast({
      title: "Request rejected",
      description: emailFailed ? "Rejected. In-app notification sent but email failed." : `${memberName} has been notified.`,
      variant: emailFailed ? "destructive" : "default",
    });
  };

  const displayed = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    pending:  requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    all:      requests.length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Profile Changes</h1>
          <p className="text-muted-foreground mt-1">Review members' requested changes to identity details (name, SCN, year of call).</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f} <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {filter === "pending" ? "No change requests awaiting review." : "No change requests found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayed.map((req) => {
              const profile = profiles[req.user_id];
              return (
                <Card key={req.id} className="shadow-card">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-card-foreground text-sm">
                          {profile ? [profile.surname, profile.first_name].filter(Boolean).join(" ") || profile.email : req.user_id.slice(0, 8) + "..."}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile?.email}{profile?.lbian ? ` · ${profile.lbian}` : ""}
                          {" · "}
                          {new Date(req.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        req.status === "approved" ? "bg-green-100 text-green-800" :
                        req.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {Object.entries(req.changes || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm flex-wrap">
                          <span className="text-muted-foreground w-56 shrink-0">{FIELD_LABELS[key] || key}:</span>
                          <span className="bg-muted/60 rounded px-2 py-0.5">{(req.previous?.[key] as string) || <em className="opacity-50">empty</em>}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="bg-green-50 border border-green-200 text-green-900 rounded px-2 py-0.5 font-medium">{(value as string) || <em className="opacity-50">empty</em>}</span>
                        </div>
                      ))}
                    </div>

                    {req.status === "rejected" && req.reason && (
                      <div className="bg-red-50 border border-red-100 rounded px-3 py-2">
                        <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection Reason</p>
                        <p className="text-sm text-red-800">{req.reason}</p>
                      </div>
                    )}

                    {req.status === "pending" && (
                      <div className="flex gap-3 pt-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={!!updating}
                          onClick={() => approve(req)}
                        >
                          {updating === req.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          Approve & Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={!!updating}
                          onClick={() => { setRejectTarget(req); setRejectReason(""); }}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection reason dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Profile Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              The member's profile will remain unchanged. Provide a reason so they know what to fix.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. The SCN provided does not match our records."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">Optional, but strongly recommended.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={rejecting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={rejecting}>
              {rejecting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProfileChanges;
