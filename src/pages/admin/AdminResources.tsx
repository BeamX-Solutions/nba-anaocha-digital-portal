import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, Check, X, BookMarked, Upload } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Legal Compliance", "Branch Documents", "Practice Guides", "General"];
const TYPES = ["PDF", "Guide", "Link"];
const PORTAL_OPTIONS = [
  { value: "both", label: "Both Portals" },
  { value: "anaocha", label: "Anaocha Only" },
  { value: "remuneration", label: "Remuneration Only" },
];

const emptyForm = { title: "", description: "", category: "General", type: "PDF", portal: "both", file_url: "", external_url: "" };

const AdminResources = () => {
  const [resources, setResources] = useState<any[]>([]);
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
    const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setResources(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error } = await supabase.storage.from("resources").upload(fileName, file, { upsert: false });
    setUploading(false);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("resources").getPublicUrl(data.path);
    setForm((p) => ({ ...p, file_url: publicUrl }));
    toast({ title: "File uploaded" });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const url = form.type === "Link" ? form.external_url : form.file_url;
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      type: form.type,
      portal: form.portal,
      file_url: url || null,
    };
    if (editing) {
      const { error } = await supabase.from("resources").update(payload).eq("id", editing);
      if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("resources").insert(payload);
      if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    toast({ title: editing ? "Resource updated" : "Resource added" });
    load();
  };

  const startEdit = (r: any) => {
    setForm({
      title: r.title || "",
      description: r.description || "",
      category: r.category || "General",
      type: r.type || "PDF",
      portal: r.portal || "both",
      file_url: r.type !== "Link" ? (r.file_url || "") : "",
      external_url: r.type === "Link" ? (r.file_url || "") : "",
    });
    setEditing(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) { toast({ title: "Failed to delete", description: error.message, variant: "destructive" }); return; }
    setResources((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Resource deleted" });
  };

  const cancel = () => { setShowForm(false); setEditing(null); setForm({ ...emptyForm }); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground mt-1">Manage downloadable documents and guides for members.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Resource
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="shadow-card border-primary/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading font-semibold text-foreground">{editing ? "Edit Resource" : "Add Resource"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Resource title" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value, file_url: "", external_url: "" }))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Show on</label>
                  <select value={form.portal} onChange={(e) => setForm((p) => ({ ...p, portal: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {PORTAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  {form.type === "Link" ? (
                    <>
                      <label className="text-sm font-medium text-foreground">External URL</label>
                      <input type="url" value={form.external_url} onChange={(e) => setForm((p) => ({ ...p, external_url: e.target.value }))}
                        placeholder="https://..." className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </>
                  ) : (
                    <>
                      <label className="text-sm font-medium text-foreground">File</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg" className="hidden" onChange={handleFileUpload} />
                        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                          <Upload className="h-4 w-4 mr-1" />{uploading ? "Uploading..." : "Upload File"}
                        </Button>
                        {form.file_url && <span className="text-xs text-green-600 font-medium">File uploaded</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || uploading}>
                  <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : editing ? "Update" : "Add Resource"}
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
        ) : resources.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No resources yet. Add your first one.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <Card key={r.id} className="shadow-card">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-card-foreground">{r.title}</p>
                      <Badge variant="outline">{r.type}</Badge>
                      <Badge variant="secondary">{r.category}</Badge>
                      <Badge variant="outline" className="text-xs">{PORTAL_OPTIONS.find((o) => o.value === r.portal)?.label || r.portal}</Badge>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default AdminResources;
