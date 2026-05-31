import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Users, CheckCircle, Clock, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DUES_CATEGORY_LABELS, BPF_TIERS, getDueAmount } from "@/lib/constants";

type DuesItem = {
  id: string; title: string; description: string | null; category: string;
  year: number; deadline: string | null; is_tiered: boolean;
  amount_0_4: number | null; amount_5_9: number | null;
  amount_10_14: number | null; amount_15_plus: number | null;
  flat_amount: number | null; requires_upload: boolean;
  upload_label: string | null; is_active: boolean; created_at: string;
};

type DuesPayment = {
  user_id: string; status: string; amount: number | null;
  paid_at: string | null; receipt_url: string | null;
  profiles: { first_name: string | null; surname: string | null; email: string | null; year_of_call: string | null } | null;
};

const formatWithCommas = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-NG") : "";
};

const CurrencyInput = ({ value, onChange, placeholder, className }: {
  value: string; onChange: (raw: string) => void;
  placeholder?: string; className?: string;
}) => {
  const displayed = formatWithCommas(value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw);
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayed}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

const EMPTY_FORM = {
  title: "", description: "", category: "branch_dues", year: new Date().getFullYear(),
  deadline: "", is_tiered: true,
  amount_0_4: "", amount_5_9: "", amount_10_14: "", amount_15_plus: "", flat_amount: "",
  requires_upload: false, upload_label: "",
};

const AdminDues = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems]         = useState<DuesItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [compliance, setCompliance] = useState<Record<string, DuesPayment[]>>({});
  const [members, setMembers]     = useState<{ user_id: string; first_name: string | null; surname: string | null; email: string | null; year_of_call: string | null }[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [itemsRes, membersRes] = await Promise.all([
      supabase.from("dues_items").select("*").order("year", { ascending: false }).order("created_at"),
      supabase.from("profiles").select("user_id, first_name, surname, email, year_of_call").eq("status", "approved"),
    ]);
    setItems((itemsRes.data as DuesItem[]) ?? []);
    setMembers((membersRes.data as any[]) ?? []);
    setLoading(false);
  };

  const loadCompliance = async (itemId: string) => {
    if (compliance[itemId]) return;
    const { data } = await supabase
      .from("dues_payments")
      .select("user_id, status, amount, paid_at, receipt_url, profiles(first_name, surname, email, year_of_call)")
      .eq("dues_item_id", itemId);
    setCompliance(prev => ({ ...prev, [itemId]: (data as any) ?? [] }));
  };

  const toggleExpand = async (itemId: string) => {
    if (expanded === itemId) { setExpanded(null); return; }
    setExpanded(itemId);
    await loadCompliance(itemId);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    if (!user) return;
    setSaving(true);
    const payload: any = {
      title:          form.title.trim(),
      description:    form.description.trim() || null,
      category:       form.category,
      year:           Number(form.year),
      deadline:       form.deadline || null,
      is_tiered:      form.is_tiered,
      requires_upload: form.requires_upload,
      upload_label:   form.upload_label.trim() || null,
      created_by:     user.id,
    };
    if (form.is_tiered) {
      payload.amount_0_4     = form.amount_0_4     ? Number(form.amount_0_4)     : null;
      payload.amount_5_9     = form.amount_5_9     ? Number(form.amount_5_9)     : null;
      payload.amount_10_14   = form.amount_10_14   ? Number(form.amount_10_14)   : null;
      payload.amount_15_plus = form.amount_15_plus ? Number(form.amount_15_plus) : null;
      payload.flat_amount    = null;
    } else {
      payload.flat_amount    = form.flat_amount ? Number(form.flat_amount) : null;
      payload.amount_0_4 = payload.amount_5_9 = payload.amount_10_14 = payload.amount_15_plus = null;
    }
    const { error } = await supabase.from("dues_items").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Failed to create dues item", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Dues item created" });
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    load();
  };

  const toggleActive = async (item: DuesItem) => {
    await supabase.from("dues_items").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  };

  const deleteItem = async (item: DuesItem) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    await supabase.from("dues_items").delete().eq("id", item.id);
    load();
  };

  const f = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const paidCount    = (itemId: string) => (compliance[itemId] ?? []).filter(p => p.status === "paid" || p.status === "uploaded").length;
  const outstanding  = (item: DuesItem) => members.length - paidCount(item.id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Dues Management</h1>
            <p className="text-muted-foreground mt-1">Create dues items, track member compliance.</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="gap-2">
            <Plus className="h-4 w-4" />New Dues Item
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card className="shadow-card border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading font-semibold text-foreground">New Dues Item</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
                  <input value={form.title} onChange={e => f("title", e.target.value)}
                    placeholder="e.g. Branch Dues 2026"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea value={form.description} onChange={e => f("description", e.target.value)}
                    rows={2} placeholder="Optional details..."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select value={form.category} onChange={e => f("category", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {Object.entries(DUES_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Year</label>
                  <input type="number" value={form.year} onChange={e => f("year", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Deadline (optional)</label>
                  <input type="date" value={form.deadline} onChange={e => f("deadline", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                    <input type="checkbox" checked={form.is_tiered} onChange={e => f("is_tiered", e.target.checked)} className="rounded" />
                    Tiered by years of call
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                    <input type="checkbox" checked={form.requires_upload} onChange={e => f("requires_upload", e.target.checked)} className="rounded" />
                    Receipt upload only (no payment)
                  </label>
                </div>
              </div>

              {!form.requires_upload && (
                form.is_tiered ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "amount_0_4",     label: "0–4 yrs (₦)",   hint: `BPF: ₦${BPF_TIERS.amount_0_4.toLocaleString("en-NG")}` },
                      { key: "amount_5_9",     label: "5–9 yrs (₦)",   hint: `BPF: ₦${BPF_TIERS.amount_5_9.toLocaleString("en-NG")}` },
                      { key: "amount_10_14",   label: "10–14 yrs (₦)", hint: `BPF: ₦${BPF_TIERS.amount_10_14.toLocaleString("en-NG")}` },
                      { key: "amount_15_plus", label: "15+ yrs (₦)",   hint: `BPF: ₦${BPF_TIERS.amount_15_plus.toLocaleString("en-NG")}` },
                    ].map(({ key, label, hint }) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-foreground">{label}</label>
                        <CurrencyInput
                          value={(form as any)[key]}
                          onChange={raw => f(key, raw)}
                          placeholder={hint}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-xs">
                    <label className="text-sm font-medium text-foreground">Flat Amount (₦)</label>
                    <CurrencyInput
                      value={form.flat_amount}
                      onChange={raw => f("flat_amount", raw)}
                      placeholder="e.g. 5,000"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )
              )}

              {form.requires_upload && (
                <div className="max-w-md">
                  <label className="text-sm font-medium text-foreground">Upload button label</label>
                  <input value={form.upload_label} onChange={e => f("upload_label", e.target.value)}
                    placeholder="e.g. Upload BPF Receipt"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Create Dues Item"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground">No dues items yet. Create one above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const isExpanded   = expanded === item.id;
              const paid         = paidCount(item.id);
              const total        = members.length;

              return (
                <Card key={item.id} className={`shadow-card ${!item.is_active ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{item.title}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {DUES_CATEGORY_LABELS[item.category] ?? item.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{item.year}</Badge>
                          {!item.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          {item.deadline && <span>Deadline: {new Date(item.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>}
                          {item.requires_upload
                            ? <span className="text-blue-600 font-medium">Receipt upload</span>
                            : item.is_tiered
                              ? <span>Tiered: ₦{Number(item.amount_0_4).toLocaleString("en-NG")} – ₦{Number(item.amount_15_plus).toLocaleString("en-NG")}</span>
                              : <span>₦{Number(item.flat_amount).toLocaleString("en-NG")}</span>}
                          {compliance[item.id] && (
                            <span className="font-medium text-foreground">{paid}/{total} paid</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleActive(item)} title={item.is_active ? "Deactivate" : "Activate"}
                          className="text-muted-foreground hover:text-foreground transition-colors">
                          {item.is_active
                            ? <ToggleRight className="h-5 w-5 text-primary" />
                            : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button onClick={() => deleteItem(item)} title="Delete"
                          className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.id)} className="gap-1.5 text-xs">
                          <Users className="h-3.5 w-3.5" />Compliance
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Compliance table */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Member Compliance — {paid} of {total} paid
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[500px]">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Member</th>
                                <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Year of Call</th>
                                <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Amount</th>
                                <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
                                <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {members.map(member => {
                                const p = (compliance[item.id] ?? []).find(cp => cp.user_id === member.user_id);
                                const memberAmount = getDueAmount(item, member.year_of_call);
                                const status = p?.status ?? "pending";
                                return (
                                  <tr key={member.user_id} className="hover:bg-muted/20">
                                    <td className="py-2.5 px-3">
                                      <p className="font-medium text-foreground">
                                        {[member.surname, member.first_name].filter(Boolean).join(", ") || member.email}
                                      </p>
                                      {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground">{member.year_of_call || "—"}</td>
                                    <td className="py-2.5 px-3 font-medium text-foreground">
                                      {item.requires_upload ? "—" : memberAmount > 0 ? `₦${memberAmount.toLocaleString("en-NG")}` : "—"}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {status === "paid" || status === "uploaded" ? (
                                        <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                                          <CheckCircle className="h-3.5 w-3.5" />
                                          {status === "uploaded" ? "Submitted" : "Paid"}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-semibold">
                                          <Clock className="h-3.5 w-3.5" />Outstanding
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground text-xs">
                                      {p?.paid_at ? new Date(p.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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

export default AdminDues;
