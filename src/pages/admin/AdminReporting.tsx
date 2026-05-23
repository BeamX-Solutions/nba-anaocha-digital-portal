import { useEffect, useState } from "react";
import { TrendingUp, ClipboardList, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS } from "@/lib/constants";

const AdminReporting = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("service_applications")
      .select("id, service_type, status, created_at")
      .then(({ data }) => {
        setApps(data || []);
        setLoading(false);
      });
  }, []);

  const total = apps.length;
  const pending = apps.filter((a) => a.status === "pending").length;
  const approved = apps.filter((a) => a.status === "approved").length;
  const rejected = apps.filter((a) => a.status === "rejected").length;

  const byType: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {};
  apps.forEach((a) => {
    const t = a.service_type || "unknown";
    if (!byType[t]) byType[t] = { total: 0, pending: 0, approved: 0, rejected: 0 };
    byType[t].total++;
    if (a.status === "pending" || a.status === "approved" || a.status === "rejected") {
      byType[t][a.status as "pending" | "approved" | "rejected"]++;
    }
  });

  const monthlyMap: Record<string, number> = {};
  apps.forEach((a) => {
    const key = new Date(a.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
    monthlyMap[key] = (monthlyMap[key] || 0) + 1;
  });
  const monthlyEntries = Object.entries(monthlyMap).slice(-12).reverse();

  const handleExportCSV = () => {
    const rows = [
      ["Service Type", "Total", "Pending", "Approved", "Rejected"],
      ...Object.entries(byType).map(([type, counts]) => [
        SERVICE_LABELS[type] || type,
        String(counts.total),
        String(counts.pending),
        String(counts.approved),
        String(counts.rejected),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reporting-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Reporting</h1>
            <p className="text-muted-foreground mt-1">Aggregate overview of applications and service activity.</p>
          </div>
          {apps.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Rejected</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-heading text-base font-semibold text-foreground">Status Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Status</th>
                    <th className="text-right px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/20">
                    <td className="px-5 py-3 text-foreground">Pending</td>
                    <td className="px-5 py-3 text-muted-foreground text-right">{pending}</td>
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="px-5 py-3 text-foreground">Approved</td>
                    <td className="px-5 py-3 text-muted-foreground text-right">{approved}</td>
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="px-5 py-3 text-foreground">Rejected</td>
                    <td className="px-5 py-3 text-muted-foreground text-right">{rejected}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* By service type */}
        {Object.keys(byType).length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-heading text-base font-semibold text-foreground">Breakdown by Service Type</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Service</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Total</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Pending</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Approved</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Rejected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(byType)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([type, counts]) => (
                        <tr key={type} className="hover:bg-muted/20">
                          <td className="px-5 py-3 text-foreground font-medium">
                            {SERVICE_LABELS[type] || type}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground text-right font-semibold">{counts.total}</td>
                          <td className="px-5 py-3 text-yellow-600 text-right">{counts.pending}</td>
                          <td className="px-5 py-3 text-green-600 text-right">{counts.approved}</td>
                          <td className="px-5 py-3 text-red-600 text-right">{counts.rejected}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly trend */}
        {monthlyEntries.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-base font-semibold text-foreground">Monthly Trend — Applications Submitted</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Month</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Applications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthlyEntries.map(([month, count]) => (
                      <tr key={month} className="hover:bg-muted/20">
                        <td className="px-5 py-3 text-foreground">{month}</td>
                        <td className="px-5 py-3 font-semibold text-foreground text-right">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {apps.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No application data yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReporting;
