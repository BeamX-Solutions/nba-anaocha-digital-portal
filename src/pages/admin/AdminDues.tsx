import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Users, CheckCircle, Clock, Trash2, ToggleLeft, ToggleRight, FileText, XCircle, Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/auditLog";
import { DUES_CATEGORY_LABELS, BPF_TIERS, getDueAmount } from "@/lib/constants";

type DuesItem = {
  id: string; title: string; description: string | null; category: string;
  year: number; deadline: string | null; is_tiered: boolean;
  amount_0_4: number | null; amount_5_9: number | null;
  amount_10_14: number | null; amount_15_plus: number | null;
  amount_san: number | null;
  flat_amount: number | null; requires_upload: boolean;
  upload_label: string | null; is_active: boolean; created_at: string;
};

type DuesPayment = {
  user_id: string; status: string; amount: number | null;
  paid_at: string | null; receipt_url: string | null; rejection_reason: string | null;
  profiles: { first_name: string | null; surname: string | null; email: string | null; year_of_call: string | null } | null;
};

type Member = { user_id: string; first_name: string | null; surname: string | null; email: string | null; year_of_call: string | null; rank: string | null };

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
  amount_0_4: "", amount_5_9: "", amount_10_14: "", amount_15_plus: "", amount_san: "", flat_amount: "",
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
  const [members, setMembers]     = useState<Member[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [itemsRes, membersRes] = await Promise.all([
      supabase.from("dues_items").select("*").order("year", { ascending: false }).order("created_at"),
      supabase.from("profiles").select("user_id, first_name, surname, email, year_of_call, rank").eq("status", "active"),
    ]);
    setItems((itemsRes.data as DuesItem[]) ?? []);
    setMembers((membersRes.data as any[]) ?? []);
    setLoading(false);
  };

  const loadCompliance = async (itemId: string, force = false) => {
    if (compliance[itemId] && !force) return;
    const { data } = await (supabase as any)
      .from("dues_payments")
      .select("user_id, status, amount, paid_at, receipt_url, rejection_reason, profiles(first_name, surname, email, year_of_call)")
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
      payload.amount_san     = form.amount_san     ? Number(form.amount_san)     : null;
      payload.flat_amount    = null;
    } else {
      payload.flat_amount    = form.flat_amount ? Number(form.flat_amount) : null;
      payload.amount_0_4 = payload.amount_5_9 = payload.amount_10_14 = payload.amount_15_plus = payload.amount_san = null;
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

  // 'uploaded' means awaiting review — only Paystack-paid and admin-verified count.
  const paidCount    = (itemId: string) => (compliance[itemId] ?? []).filter(p => p.status === "paid" || p.status === "verified").length;
  const outstanding  = (item: DuesItem) => members.length - paidCount(item.id);

  // ── Receipt review ──────────────────────────────────────────────────────
  const [reviewing, setReviewing] = useState<string | null>(null); // user_id being reviewed
  const [rejectTarget, setRejectTarget] = useState<{ item: DuesItem; member: Member } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const viewReceipt = async (path: string) => {
    const { data, error } = await supabase.storage.from("dues-receipts").createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      toast({ title: "Couldn't open receipt", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const notifyReviewOutcome = async (item: DuesItem, member: Member, verified: boolean, reason?: string) => {
    const memberName = [member.surname, member.first_name].filter(Boolean).join(" ") || "Member";
    await supabase.from("notifications").insert({
      user_id: member.user_id,
      title: verified ? `Receipt Verified: ${item.title}` : `Receipt Not Accepted: ${item.title}`,
      message: verified
        ? `Your receipt for ${item.title} has been verified by the secretariat. You are marked as compliant.`
        : `Your receipt for ${item.title} was not accepted.${reason ? ` Reason: ${reason}.` : ""} Please upload a corrected receipt.`,
      type: "dues",
    });
    if (member.email) {
      await supabase.functions.invoke("send-email", {
        body: verified
          ? { type: "dues_receipt_verified", to: member.email, name: memberName, item_title: item.title }
          : { type: "dues_receipt_rejected", to: member.email, name: memberName, item_title: item.title, reason: reason || undefined },
      });
    }
  };

  const verifyReceipt = async (item: DuesItem, member: Member) => {
    if (!user) return;
    setReviewing(member.user_id);
    const { error } = await (supabase as any)
      .from("dues_payments")
      .update({ status: "verified", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("dues_item_id", item.id)
      .eq("user_id", member.user_id);
    if (error) {
      toast({ title: "Failed to verify", description: error.message, variant: "destructive" });
      setReviewing(null);
      return;
    }
    await notifyReviewOutcome(item, member, true);
    logAudit(user.id, "dues_receipt_verified", "dues_payment", item.id, { member_email: member.email, item_title: item.title });
    await loadCompliance(item.id, true);
    setReviewing(null);
    toast({ title: "Receipt verified", description: "The member has been notified." });
  };

  const confirmRejectReceipt = async () => {
    if (!rejectTarget || !user) return;
    const { item, member } = rejectTarget;
    const reason = rejectReason.trim();
    setRejecting(true);
    const { error } = await (supabase as any)
      .from("dues_payments")
      .update({ status: "rejected", rejection_reason: reason || null, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("dues_item_id", item.id)
      .eq("user_id", member.user_id);
    if (error) {
      toast({ title: "Failed to reject", description: error.message, variant: "destructive" });
      setRejecting(false);
      return;
    }
    await notifyReviewOutcome(item, member, false, reason);
    logAudit(user.id, "dues_receipt_rejected", "dues_payment", item.id, { member_email: member.email, item_title: item.title, reason: reason || null });
    await loadCompliance(item.id, true);
    setRejecting(false);
    setRejectTarget(null);
    setRejectReason("");
    toast({ title: "Receipt rejected", description: "The member has been notified and can re-upload." });
  };

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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { key: "amount_0_4",     label: "0–4 yrs (₦)",   hint: `BPF: ₦${BPF_TIERS.amount_0_4.toLocaleString("en-NG")}` },
                      { key: "amount_5_9",     label: "5–9 yrs (₦)",   hint: `BPF: ₦${BPF_TIERS.amount_5_9.toLocaleString("en-NG")}` },
                      { key: "amount_10_14",   label: "10–14 yrs (₦)", hint: `BPF: ₦${BPF_TIERS.amount_10_14.toLocaleString("en-NG")}` },
                      { key: "amount_15_plus", label: "15+ yrs (₦)",   hint: `BPF: ₦${BPF_TIERS.amount_15_plus.toLocaleString("en-NG")}` },
                      { key: "amount_san",     label: "SAN / Bencher (₦)", hint: `BPF: ₦${BPF_TIERS.amount_san.toLocaleString("en-NG")}` },
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
                          Member Compliance: {paid} of {total} compliant
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
                                {item.requires_upload && (
                                  <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Receipt</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {members.map(member => {
                                const p = (compliance[item.id] ?? []).find(cp => cp.user_id === member.user_id);
                                const memberAmount = getDueAmount(item, member.year_of_call, member.rank);
                                const status = p?.status ?? "pending";
                                return (
                                  <tr key={member.user_id} className="hover:bg-muted/20">
                                    <td className="py-2.5 px-3">
                                      <p className="font-medium text-foreground">
                                        {[member.surname, member.first_name].filter(Boolean).join(", ") || member.email}
                                      </p>
                                      {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground">{member.year_of_call || "-"}</td>
                                    <td className="py-2.5 px-3 font-medium text-foreground">
                                      {item.requires_upload ? "-" : memberAmount > 0 ? `₦${memberAmount.toLocaleString("en-NG")}` : "-"}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {status === "paid" || status === "verified" ? (
                                        <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                                          <CheckCircle className="h-3.5 w-3.5" />
                                          {status === "verified" ? "Verified" : "Paid"}
                                        </span>
                                      ) : status === "uploaded" ? (
                                        <span className="inline-flex items-center gap-1 text-blue-700 text-xs font-semibold">
                                          <Clock className="h-3.5 w-3.5" />Awaiting review
                                        </span>
                                      ) : status === "rejected" ? (
                                        <span className="inline-flex items-center gap-1 text-red-700 text-xs font-semibold" title={p?.rejection_reason || undefined}>
                                          <XCircle className="h-3.5 w-3.5" />Rejected
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-semibold">
                                          <Clock className="h-3.5 w-3.5" />Outstanding
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground text-xs">
                                      {p?.paid_at ? new Date(p.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                    </td>
                                    {item.requires_upload && (
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {p?.receipt_url && (
                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => viewReceipt(p.receipt_url!)}>
                                              <FileText className="h-3.5 w-3.5" />View
                                            </Button>
                                          )}
                                          {status === "uploaded" && (
                                            <>
                                              <Button
                                                size="sm"
                                                className="h-7 px-2 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                                                disabled={reviewing === member.user_id}
                                                onClick={() => verifyReceipt(item, member)}
                                              >
                                                {reviewing === member.user_id
                                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                  : <CheckCircle className="h-3.5 w-3.5" />}
                                                Verify
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-7 px-2 text-xs gap-1"
                                                disabled={reviewing === member.user_id}
                                                onClick={() => { setRejectTarget({ item, member }); setRejectReason(""); }}
                                              >
                                                <XCircle className="h-3.5 w-3.5" />Reject
                                              </Button>
                                            </>
                                          )}
                                          {!p?.receipt_url && status !== "uploaded" && <span className="text-xs text-muted-foreground">-</span>}
                                        </div>
                                      </td>
                                    )}
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

      {/* Reject receipt dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Rejecting the <span className="font-semibold text-foreground">{rejectTarget?.item.title}</span> receipt from{" "}
              <span className="font-semibold text-foreground">
                {[rejectTarget?.member.surname, rejectTarget?.member.first_name].filter(Boolean).join(" ") || rejectTarget?.member.email}
              </span>. They will be marked outstanding again and asked to re-upload.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. The uploaded document is not a BPF payment receipt."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">Optional, but strongly recommended.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={rejecting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRejectReceipt} disabled={rejecting}>
              {rejecting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDues;
