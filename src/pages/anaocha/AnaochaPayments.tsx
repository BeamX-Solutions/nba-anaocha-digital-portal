import { useState, useEffect } from "react";
import { Receipt, CheckCircle, Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { csvCell } from "@/lib/utils";
import { SERVICE_LABELS } from "@/lib/constants";

const CHANNEL_LABELS: Record<string, string> = {
  card:         "Card",
  bank:         "Bank Transfer",
  ussd:         "USSD",
  mobile_money: "Mobile Money",
  paystack:     "Paystack",
};

type UnifiedPayment = {
  id:          string;
  type:        "service" | "dues";
  description: string;
  amount:      number | null;
  reference:   string | null;
  channel:     string | null;
  status:      string;
  created_at:  string;
};

const AnaochaPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    const [serviceRes, duesRes] = await Promise.all([
      (supabase as any)
        .from("payments")
        .select("id, amount, reference, channel, status, created_at, entity_id")
        .eq("user_id", user.id),
      supabase
        .from("dues_payments")
        .select("id, amount, reference, status, paid_at, dues_items(title)")
        .eq("user_id", user.id)
        .not("paid_at", "is", null)
        .neq("status", "rejected"),
    ]);

    if (serviceRes.error && !duesRes.error) {
      setError(serviceRes.error.message);
      setLoading(false);
      return;
    }

    // Resolve service_type labels for service payments
    const serviceRows: any[] = serviceRes.data || [];
    const appIds = serviceRows.map((r: any) => r.entity_id).filter(Boolean);
    let appMap: Record<string, string> = {};
    if (appIds.length > 0) {
      const { data: apps } = await supabase
        .from("service_applications")
        .select("id, service_type")
        .in("id", appIds);
      (apps || []).forEach((a: any) => { appMap[a.id] = a.service_type; });
    }

    const servicePayments: UnifiedPayment[] = serviceRows.map((r: any) => ({
      id:          r.id,
      type:        "service",
      description: SERVICE_LABELS[appMap[r.entity_id]] || "Service Payment",
      amount:      Number(r.amount),
      reference:   r.reference,
      channel:     r.channel,
      status:      r.status,
      created_at:  r.created_at,
    }));

    const duesRows: any[] = duesRes.data || [];
    const duesPayments: UnifiedPayment[] = duesRows.map((r: any) => ({
      id:          r.id,
      type:        "dues",
      description: r.dues_items?.title || "Dues Payment",
      amount:      r.status === "uploaded" ? null : Number(r.amount),
      reference:   r.reference,
      channel:     r.status === "uploaded" ? null : "paystack",
      status:      r.status,
      created_at:  r.paid_at,
    }));

    const all = [...servicePayments, ...duesPayments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setPayments(all);
    setLoading(false);
  };

  const cashPayments = payments.filter(p => p.amount !== null);
  const total = cashPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const handleExportCSV = () => {
    const rows = [
      ["Type", "Description", "Amount (₦)", "Reference", "Channel", "Status", "Date"],
      ...payments.map((p) => [
        p.type === "dues" ? "Dues" : "Service",
        p.description,
        p.amount !== null ? Number(p.amount).toFixed(2) : "Receipt Upload",
        p.reference || "-",
        p.channel ? (CHANNEL_LABELS[p.channel] || p.channel) : "-",
        p.status,
        new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
      ]),
    ];
    const csv  = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `payment-history-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Payment History</h1>
            <p className="text-muted-foreground mt-1">All payments and dues made through the portal.</p>
          </div>
          {payments.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )}
        </div>

        {cashPayments.length > 0 && (
          <Card className="shadow-card border-green-100 bg-green-50/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-bold text-foreground">
                  ₦{total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Payments Yet</h3>
              <p className="text-sm text-muted-foreground">
                Payments for services and dues will appear here once made.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Type</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Description</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground hidden sm:table-cell">Reference</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground hidden md:table-cell">Channel</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={`text-[10px] ${p.type === "dues" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-primary/30 text-primary bg-primary/5"}`}>
                            {p.type === "dues" ? "Dues" : "Service"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-medium text-foreground">
                          {p.description}
                        </td>
                        <td className="px-5 py-4 font-semibold text-foreground">
                          {p.amount !== null
                            ? `₦${Number(p.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
                            : <span className="text-xs text-blue-600 font-medium">Receipt Submitted</span>}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground hidden sm:table-cell font-mono">
                          {p.reference || "-"}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                          {p.channel ? (CHANNEL_LABELS[p.channel] || p.channel) : "-"}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnaochaPayments;
