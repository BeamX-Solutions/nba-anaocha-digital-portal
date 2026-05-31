import { useState, useEffect, useRef } from "react";
import { CheckCircle, Clock, Upload, CreditCard, AlertCircle, FileText, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { DUES_CATEGORY_LABELS, getDueAmount } from "@/lib/constants";

declare global { interface Window { PaystackPop: any; } }

const loadPaystack = (): Promise<void> =>
  new Promise((resolve) => {
    if (window.PaystackPop) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });

const makeRef = () => `DUES-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

type DuesItem = {
  id: string; title: string; description: string | null; category: string;
  year: number; deadline: string | null; is_tiered: boolean;
  amount_0_4: number | null; amount_5_9: number | null;
  amount_10_14: number | null; amount_15_plus: number | null;
  flat_amount: number | null; requires_upload: boolean; upload_label: string | null;
};

type Payment = {
  dues_item_id: string; amount: number | null; status: string;
  reference: string | null; receipt_url: string | null; paid_at: string | null;
};

const STATUS_CONFIG = {
  paid:     { label: "Paid",      icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50 border-green-100"  },
  uploaded: { label: "Submitted", icon: CheckCircle, color: "text-blue-600",   bg: "bg-blue-50 border-blue-100"    },
  pending:  { label: "Outstanding", icon: Clock,     color: "text-amber-600",  bg: "bg-amber-50 border-amber-100"  },
};

const MyDues = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems]       = useState<DuesItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile]   = useState<{ year_of_call: string | null } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState<string | null>(null); // dues_item_id being paid
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [itemsRes, paymentsRes, profileRes] = await Promise.all([
      supabase.from("dues_items").select("*").eq("is_active", true).order("year", { ascending: false }).order("created_at"),
      supabase.from("dues_payments").select("dues_item_id, amount, status, reference, receipt_url, paid_at").eq("user_id", user.id),
      supabase.from("profiles").select("year_of_call").eq("user_id", user.id).maybeSingle(),
    ]);
    setItems((itemsRes.data as DuesItem[]) ?? []);
    setPayments((paymentsRes.data as Payment[]) ?? []);
    setProfile(profileRes.data);
    setLoading(false);
  };

  const paymentFor = (itemId: string) => payments.find(p => p.dues_item_id === itemId);

  const handlePay = async (item: DuesItem) => {
    if (!user) return;
    const amount = getDueAmount(item, profile?.year_of_call);
    if (!amount) {
      toast({ title: "Amount unavailable", description: "Your year of call is not set. Please update your profile.", variant: "destructive" });
      return;
    }
    await loadPaystack();
    setPaying(item.id);
    window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email:    user.email!,
      amount:   amount * 100,
      currency: "NGN",
      ref:      makeRef(),
      metadata: {
        custom_fields: [
          { display_name: "Due",    variable_name: "dues_title",    value: item.title },
          { display_name: "Portal", variable_name: "portal",        value: "NBA Anaocha" },
        ],
      },
      callback: async (res: any) => {
        setPaying(null);
        const { error } = await supabase.from("dues_payments").upsert({
          user_id: user.id, dues_item_id: item.id,
          amount, reference: res.reference, status: "paid",
          paid_at: new Date().toISOString(),
        }, { onConflict: "user_id,dues_item_id" });
        if (error) {
          toast({ title: "Payment recorded but save failed", description: `Keep your reference: ${res.reference}`, variant: "destructive" });
        } else {
          toast({ title: "Payment confirmed", description: `₦${amount.toLocaleString("en-NG")} paid for ${item.title}.` });
          load();
        }
      },
      onClose: () => setPaying(null),
    }).openIframe();
  };

  const handleUpload = async (item: DuesItem, file: File) => {
    if (!user) return;
    setUploading(item.id);
    const ext  = file.name.split(".").pop();
    const path = `${user.id}/${item.id}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("dues-receipts").upload(path, file, { upsert: true });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(null);
      return;
    }
    const { error } = await supabase.from("dues_payments").upsert({
      user_id: user.id, dues_item_id: item.id,
      receipt_url: path, status: "uploaded",
      paid_at: new Date().toISOString(),
    }, { onConflict: "user_id,dues_item_id" });
    setUploading(null);
    if (error) {
      toast({ title: "Record failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Receipt submitted", description: `Your ${item.title} receipt has been recorded.` });
      load();
    }
  };

  const years = Object.keys(
    items.reduce((acc, i) => ({ ...acc, [i.year]: true }), {} as Record<number, boolean>)
  ).map(Number).sort((a, b) => b - a);

  const outstanding = items.filter(i => {
    const p = paymentFor(i.id);
    return !p || p.status === "pending";
  }).length;

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Dues</h1>
            <p className="text-muted-foreground mt-1">
              Track and pay your annual dues and branch levies.
            </p>
          </div>
          {!loading && outstanding > 0 && (
            <Badge variant="destructive" className="mt-1">{outstanding} outstanding</Badge>
          )}
        </div>

        {!profile?.year_of_call && (
          <Card className="border-amber-200 bg-amber-50/60 shadow-card">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Year of Call not set</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Tiered dues amounts depend on your year of call.{" "}
                  <a href="/anaocha/profile" className="underline font-medium">Update your profile</a> to see your personalised amounts.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Dues Yet</h3>
              <p className="text-sm text-muted-foreground">
                The secretariat hasn't published any dues items yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {years.map(year => (
              <div key={year}>
                <h2 className="font-heading text-base font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {year}
                </h2>
                <div className="space-y-3">
                  {items.filter(i => i.year === year).map(item => {
                    const payment   = paymentFor(item.id);
                    const status    = payment?.status ?? "pending";
                    const cfg       = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                    const Icon      = cfg.icon;
                    const amount    = getDueAmount(item, profile?.year_of_call);
                    const isPaying  = paying === item.id;
                    const isUploading = uploading === item.id;
                    const done      = status === "paid" || status === "uploaded";

                    return (
                      <Card key={item.id} className={`shadow-card border ${done ? cfg.bg : "border-border"}`}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground text-sm">{item.title}</p>
                                <Badge variant="outline" className="text-[10px]">
                                  {DUES_CATEGORY_LABELS[item.category] ?? item.category}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {!item.requires_upload && (
                                  <span className="text-sm font-bold text-foreground">
                                    ₦{amount > 0 ? amount.toLocaleString("en-NG") : "—"}
                                    {item.is_tiered && profile?.year_of_call && (
                                      <span className="text-xs font-normal text-muted-foreground ml-1">(tiered)</span>
                                    )}
                                  </span>
                                )}
                                {item.deadline && (
                                  <span className="text-xs text-muted-foreground">
                                    Due: {new Date(item.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                )}
                                {payment?.paid_at && (
                                  <span className="text-xs text-muted-foreground">
                                    {status === "uploaded" ? "Submitted" : "Paid"}: {new Date(payment.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                                <Icon className="h-4 w-4" />
                                {cfg.label}
                              </div>

                              {!done && (
                                item.requires_upload ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isUploading}
                                      onClick={() => fileRefs.current[item.id]?.click()}
                                      className="gap-1.5"
                                    >
                                      {isUploading
                                        ? <><span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />Uploading...</>
                                        : <><Upload className="h-3.5 w-3.5" />{item.upload_label ?? "Upload Receipt"}</>}
                                    </Button>
                                    <input
                                      ref={el => { fileRefs.current[item.id] = el; }}
                                      type="file"
                                      accept="image/*,.pdf"
                                      className="hidden"
                                      onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUpload(item, f);
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={isPaying || amount === 0}
                                    onClick={() => handlePay(item)}
                                    className="gap-1.5"
                                  >
                                    {isPaying
                                      ? <><span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />Processing...</>
                                      : <><CreditCard className="h-3.5 w-3.5" />Pay Now</>}
                                  </Button>
                                )
                              )}

                              {done && status === "uploaded" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1.5 text-xs text-muted-foreground"
                                  onClick={() => fileRefs.current[item.id]?.click()}
                                >
                                  <FileText className="h-3.5 w-3.5" />Re-upload
                                </Button>
                              )}
                              {done && status === "uploaded" && (
                                <input
                                  ref={el => { fileRefs.current[item.id] = el; }}
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) handleUpload(item, f);
                                    e.target.value = "";
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyDues;
