import { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, Loader2, ClipboardList } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SERVICE_LABELS: Record<string, string> = {
  nba_diary: "NBA Diary",
  nba_id_card: "NBA ID Card",
  bain: "Bar Identification Number",
  stamp_seal: "Stamp & Seal",
  title_document_front_page: "Title Document Front Page",
};

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<{ id: string; action: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: apps } = await supabase
        .from("service_applications")
        .select("*")
        .order("created_at", { ascending: false });

      const appList = apps || [];
      setApplications(appList);

      // Fetch profiles for all user_ids
      const userIds = [...new Set(appList.map((a) => a.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, first_name, surname, email, phone")
          .in("user_id", userIds);
        const map: Record<string, any> = {};
        (profileData || []).forEach((p) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (appId: string, userId: string, status: "approved" | "rejected", serviceType: string) => {
    setUpdating({ id: appId, action: status });
    const { error } = await supabase
      .from("service_applications")
      .update({ status })
      .eq("id", appId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setUpdating(null);
      return;
    }

    const profile = profiles[userId];
    const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;
    const memberName = [profile?.surname, profile?.first_name].filter(Boolean).join(" ") || "Member";

    // In-app notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Application ${status === "approved" ? "Approved" : "Rejected"} — ${serviceLabel}`,
      message: status === "approved"
        ? `Your application for ${serviceLabel} has been approved by the branch secretariat. Please collect at the branch office.`
        : `Your application for ${serviceLabel} has been reviewed and could not be approved at this time. Please contact the branch secretariat for details.`,
      type: "application_update",
    });

    // Email notification
    if (profile?.email) {
      await supabase.functions.invoke("send-email", {
        body: {
          type: status === "approved" ? "application_approved" : "application_rejected",
          to: profile.email,
          name: memberName,
          service_type: serviceLabel,
        },
      });
    }

    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    setUpdating(null);

    toast({ title: `Application ${status}`, description: `The applicant has been notified.` });
  };

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Review, approve, or reject member service applications.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
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
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No {filter === "all" ? "" : filter} applications found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const profile = profiles[app.user_id];
              const isExpanded = expanded === app.id;
              const formData = app.form_data || {};

              return (
                <Card key={app.id} className="shadow-card">
                  <CardContent className="p-0">
                    {/* Header row */}
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : app.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-card-foreground text-sm">
                            {SERVICE_LABELS[app.service_type] || app.service_type}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                            app.status === "approved" ? "bg-green-100 text-green-800" :
                            app.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {profile
                            ? `${profile.surname || ""} ${profile.first_name || ""}`.trim() || profile.email
                            : app.user_id.slice(0, 8) + "..."
                          }
                          {" · "}
                          {new Date(app.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                        {/* Member info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {profile?.email && <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{profile.email}</p></div>}
                          {profile?.phone && <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{profile.phone}</p></div>}
                        </div>

                        {/* Form data */}
                        {Object.keys(formData).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Submitted Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(formData).map(([key, val]) => (
                                <div key={key} className="bg-muted/50 rounded px-3 py-2">
                                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                                  <p className="text-sm font-medium text-foreground">{String(val)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Uploaded files */}
                        {app.file_urls?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Uploaded Files</p>
                            <div className="flex flex-wrap gap-2">
                              {app.file_urls.map((url: string, i: number) => (
                                <a
                                  key={i}
                                  href={`${supabase.storage.from("uploads").getPublicUrl(url).data.publicUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-accent/10 text-primary border border-accent/30 px-3 py-1.5 rounded hover:bg-accent/20 transition-colors"
                                >
                                  <FileText className="h-3 w-3" />
                                  File {i + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        {app.status === "pending" && (
                          <div className="flex gap-3 pt-1">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={updating?.id === app.id}
                              onClick={() => updateStatus(app.id, app.user_id, "approved", app.service_type)}
                            >
                              {updating?.id === app.id && updating.action === "approved" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={updating?.id === app.id}
                              onClick={() => updateStatus(app.id, app.user_id, "rejected", app.service_type)}
                            >
                              {updating?.id === app.id && updating.action === "rejected" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                              Reject
                            </Button>
                          </div>
                        )}

                        {app.status !== "pending" && (
                          <div className="flex gap-3 pt-1">
                            {app.status === "approved" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={updating?.id === app.id}
                                onClick={() => updateStatus(app.id, app.user_id, "rejected", app.service_type)}
                              >
                                {updating?.id === app.id && updating.action === "rejected" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                                Mark Rejected
                              </Button>
                            )}
                            {app.status === "rejected" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={updating?.id === app.id}
                                onClick={() => updateStatus(app.id, app.user_id, "approved", app.service_type)}
                              >
                                {updating?.id === app.id && updating.action === "approved" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                Mark Approved
                              </Button>
                            )}
                          </div>
                        )}
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

export default AdminApplications;
