import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, Check, X, Users, Upload } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { COMMITTEE_NAMES } from "@/lib/constants";

// The generated Supabase types don't yet include the `people` table.
const db = supabase as any;

const CATEGORIES = [
  { value: "executive", label: "Branch Executive" },
  { value: "committee", label: "Committee Member" },
  { value: "patron",    label: "Grand Patron / Founder" },
];

const emptyForm = {
  name: "",
  position: "",
  category: "executive",
  committee: COMMITTEE_NAMES[0] as string,
  photo_url: "",
  display_order: 0,
};

const AdminLeadership = () => {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data, error } = await db
      .from("people")
      .select("*")
      .order("category", { ascending: true })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setPeople(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error } = await supabase.storage.from("people").upload(fileName, file, { upsert: false });
    setUploading(false);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("people").getPublicUrl(data.path);
    setForm((p) => ({ ...p, photo_url: publicUrl }));
    toast({ title: "Photo uploaded" });
  };

  const isPatron = form.category === "patron";

  const handleSave = async () => {
    if (!form.name.trim())     { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (!isPatron && !form.position.trim()) { toast({ title: "Position is required", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      // The Grand Patron's role is conveyed by the category, so the position
      // field is hidden — fall back to a sensible value for the NOT NULL column.
      position: isPatron ? (form.position.trim() || "Grand Patron / Founder") : form.position.trim(),
      category: form.category,
      committee: form.category === "committee" ? form.committee : null,
      photo_url: form.photo_url || null,
      display_order: Number(form.display_order) || 0,
    };
    const { error } = editing
      ? await db.from("people").update(payload).eq("id", editing)
      : await db.from("people").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    cancel();
    toast({ title: editing ? "Updated" : "Added" });
    load();
  };

  const startEdit = (p: any) => {
    setForm({
      name: p.name || "",
      position: p.position || "",
      category: p.category || "executive",
      committee: p.committee || COMMITTEE_NAMES[0],
      photo_url: p.photo_url || "",
      display_order: p.display_order ?? 0,
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await db.from("people").delete().eq("id", id);
    if (error) { toast({ title: "Failed to delete", description: error.message, variant: "destructive" }); return; }
    setPeople((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Removed" });
  };

  const cancel = () => { setShowForm(false); setEditing(null); setForm({ ...emptyForm }); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Leadership</h1>
            <p className="text-muted-foreground mt-1">Manage branch executives and committee members shown on the homepage.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Person
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="shadow-card border-primary/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading font-semibold text-foreground">{editing ? "Edit Person" : "Add Person"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Barr. John Doe" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {!isPatron && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Position / Role</label>
                    <input type="text" value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                      placeholder="e.g. Chairman, Secretary, Member" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                {form.category === "committee" && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Committee</label>
                    <select value={form.committee} onChange={(e) => setForm((p) => ({ ...p, committee: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {COMMITTEE_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground">Display Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: Number(e.target.value) }))}
                    placeholder="0" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Photo</label>
                  <div className="mt-1 flex items-center gap-3">
                    {form.photo_url && <img src={form.photo_url} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <Upload className="h-4 w-4 mr-1" />{uploading ? "Uploading..." : form.photo_url ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || uploading}>
                  <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : editing ? "Update" : "Add Person"}
                </Button>
                <Button variant="outline" onClick={cancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : people.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No people added yet. Add your first executive or committee member.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {people.map((p) => (
              <Card key={p.id} className="shadow-card">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="h-11 w-11 rounded-full object-cover border border-border flex-shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-card-foreground truncate">{p.name}</p>
                        <Badge variant={p.category === "committee" ? "secondary" : "default"}>
                          {p.category === "executive" ? "Executive" : p.category === "patron" ? "Grand Patron" : (p.committee || "Committee")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeadership;
