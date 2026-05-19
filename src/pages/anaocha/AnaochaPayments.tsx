import { useState, useEffect } from "react";
import { Receipt, CheckCircle, Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { anaochaSidebarItems } from "@/lib/sidebarItems";
import { SERVICE_LABELS } from "@/lib/constants";

const CHANNEL_LABELS: Record<string, string> = {
  card:         "Card",
  bank:         "Bank Transfer",
  ussd:         "USSD",
  mobile_money: "Mobile Money",
  paystack:     "Paystack",
};

const AnaochaPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("payments")
      .select("id, amount, reference, channel, status, created_at, entity_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data, error: err }: any) => {
        if (err) { setError(err.message); setLoading(false); return; }
        const rows = data || [];

        // Resolve service_type from entity_id
        const appIds = rows.map((r: any) => r.entity_id).filter(Boolean);
        let appMap: Record<string, string> = {};
        if (appIds.length > 0) {
          const { data: apps } = await supabase
            .from("service_applications")
            .select("id, service_type")
            .in("id", appIds);
          (apps || []).forEach((a: any) => { appMap[a.id] = a.service_type; });
        }

        setPayments(rows.map((r: any) => ({ ...r, service_type: appMap[r.entity_id] ?? null })));
        setLoading(false);
      });
  }, [user]);

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const handleExportCSV = () => {
    const rows = [
      ["Service", "Amount (₦)", "Reference", "Channel", "Date"],
      ...payments.map((p) => [
        SERVICE_LABELS[p.service_type] || "—",
        Number(p.amount).toFixed(2),
        p.reference,
        CHANNEL_LABELS[p.channel] || p.channel || "—",
        new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `payments-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="NBA Anaocha" sidebarItems={anaochaSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Payment History</h1>
            <p className="text-muted-foreground mt-1">All payments made through the portal via Paystack.</p>
          </div>
          {payments.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )}
        </div>

        {payments.length > 0 && (
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
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : payments.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No Payments Yet</h3>
              <p className="text-sm text-muted-foreground">
                Payments you make when applying for services will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Service</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground hidden sm:table-cell">Reference</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground hidden md:table-cell">Channel</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4 font-medium text-foreground">
                          {SERVICE_LABELS[p.service_type] || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-foreground">
                          ₦{Number(p.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground hidden sm:table-cell font-mono">
                          {p.reference}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                          {CHANNEL_LABELS[p.channel] || p.channel || "—"}
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
