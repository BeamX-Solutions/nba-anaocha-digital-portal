import { useEffect, useState } from "react";
import { Search, User, Scale, ChevronDown, ChevronUp, Edit2, Check, X, Ban, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMembers(data || []);
        setFiltered(data || []);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) { setFiltered(members); return; }
    setFiltered(
      members.filter((m) =>
        [m.first_name, m.surname, m.middle_name, m.email, m.year_of_call, m.branch, m.phone]
          .some((v) => v?.toLowerCase().includes(q))
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
    if (editing === id) setEditing(null);
  };

  const startEdit = (m: any) => {
    setEditForm({
      surname: m.surname || "",
      first_name: m.first_name || "",
      middle_name: m.middle_name || "",
      year_of_call: m.year_of_call || "",
      phone: m.phone || "",
      office_address: m.office_address || "",
      branch: m.branch || "Anaocha",
    });
    setEditing(m.id);
  };

  const handleSave = async (m: any) => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(editForm).eq("id", m.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, ...editForm } : mem);
    setMembers(updated);
    setFiltered(updated);
    setEditing(null);
    toast({ title: "Profile updated" });
  };

  const toggleSuspend = async (m: any) => {
    const newStatus = m.status === "suspended" ? "active" : "suspended";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", m.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    const memberName = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";

    // In-app notification
    await supabase.from("notifications").insert({
      user_id: m.user_id,
      title: newStatus === "suspended" ? "Account Suspended" : "Account Reinstated",
      message: newStatus === "suspended"
        ? "Your NBA Anaocha portal account has been suspended. Please contact the secretariat for assistance."
        : "Your NBA Anaocha portal account has been reinstated. You can now access all portal features.",
      type: "account",
    });

    // Email notification
    if (m.email) {
      await supabase.functions.invoke("send-email", {
        body: {
          type: newStatus === "suspended" ? "account_suspended" : "account_reinstated",
          to: m.email,
          name: memberName,
        },
      });
    }

    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: newStatus } : mem);
    setMembers(updated);
    setFiltered(updated);
    toast({ title: newStatus === "suspended" ? "Member suspended" : "Member reinstated" });
  };

  const editFields = [
    { key: "surname", label: "Surname" },
    { key: "first_name", label: "First Name" },
    { key: "middle_name", label: "Middle Name" },
    { key: "year_of_call", label: "Year of Call" },
    { key: "phone", label: "Phone" },
    { key: "branch", label: "Branch" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground mt-1">
            {members.length} registered member{members.length !== 1 ? "s" : ""} in the portal.
          </p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setFiltered(members); }}
                placeholder="Search by name, email, year of call, branch..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit"><Search className="h-4 w-4 mr-1" /> Search</Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No members found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <Card key={m.id} className={`shadow-card transition-shadow ${m.status === "suspended" ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(m.id)}>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
                      <div>
                        <p className="font-semibold text-card-foreground text-sm">
                          {[m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.email || "No email"}</p>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {m.year_of_call && <p>Called: {m.year_of_call}</p>}
                        {m.phone && <p>Phone: {m.phone}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {m.status === "suspended" && <Badge variant="destructive">Suspended</Badge>}
                        <p className="text-xs text-muted-foreground ml-auto">
                          Joined: {new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {expanded === m.id
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  </div>

                  {/* Expanded section */}
                  {expanded === m.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {editing === m.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {editFields.map((f) => (
                            <div key={f.key}>
                              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                              <input
                                type="text"
                                value={editForm[f.key]}
                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          ))}
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Office Address</label>
                            <input
                              type="text"
                              value={editForm.office_address}
                              onChange={(e) => setEditForm((prev: any) => ({ ...prev, office_address: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div className="md:col-span-2 flex gap-2">
                            <Button size="sm" onClick={() => handleSave(m)} disabled={saving}>
                              <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                              <X className="h-4 w-4 mr-1" />Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Branch:</span> {m.branch || "—"}</div>
                          <div><span className="text-muted-foreground">Year of Call:</span> {m.year_of_call || "—"}</div>
                          <div><span className="text-muted-foreground">Phone:</span> {m.phone || "—"}</div>
                          <div><span className="text-muted-foreground">Office:</span> {m.office_address || "—"}</div>
                        </div>
                      )}

                      {editing !== m.id && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" onClick={() => startEdit(m)}>
                            <Edit2 className="h-4 w-4 mr-1" />Edit Profile
                          </Button>
                          <Button
                            size="sm"
                            variant={m.status === "suspended" ? "default" : "destructive"}
                            onClick={() => toggleSuspend(m)}
                          >
                            {m.status === "suspended"
                              ? <><CheckCircle className="h-4 w-4 mr-1" />Reinstate</>
                              : <><Ban className="h-4 w-4 mr-1" />Suspend</>}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMembers;
