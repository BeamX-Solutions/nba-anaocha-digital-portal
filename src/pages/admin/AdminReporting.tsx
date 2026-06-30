import { useEffect, useState } from "react";
import { TrendingUp, ClipboardList, Clock, CheckCircle, XCircle, Download, Users, UserCheck, UserX, ShieldCheck, Hash, Wallet, Landmark, FileText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS } from "@/lib/constants";

const naira = (n: number) => `₦${(n || 0).toLocaleString("en-NG")}`;
const PAID = ["paid", "uploaded"];

const StatCard = ({ icon, tone, label, value }: { icon: React.ReactNode; tone: string; label: string; value: React.ReactNode }) => (
  <Card className="shadow-card">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const SectionTable = ({ title, head, children }: { title: React.ReactNode; head: React.ReactNode; children: React.ReactNode }) => (
  <Card className="shadow-card">
    <CardContent className="p-0">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">{head}</tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th className={`px-5 py-3 text-[11px] tracking-wider uppercase font-semibold text-muted-foreground ${right ? "text-right" : "text-left"}`}>{children}</th>
);

const AdminReporting = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [duesItems, setDuesItems] = useState<any[]>([]);
  const [duesPayments, setDuesPayments] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, di, dp, a, pay] = await Promise.all([
        supabase.from("profiles").select("status, rank, lbian, is_admin"),
        supabase.from("dues_items").select("id, title, year, is_active"),
        supabase.from("dues_payments").select("dues_item_id, amount, status"),
        supabase.from("service_applications").select("id, service_type, status, payment_status, created_at"),
        supabase.from("payments").select("entity_type, entity_id, amount, status"),
      ]);
      setProfiles(p.data || []);
      setDuesItems(di.data || []);
      setDuesPayments(dp.data || []);
      setApps(a.data || []);
      setPayments(pay.data || []);
      setLoading(false);
    })();
  }, []);

  // ── Members ──────────────────────────────────────────────────────────────
  const members = profiles.filter((m) => !m.is_admin);
  const totalMembers = members.length;
  const active = members.filter((m) => m.status === "active").length;
  const pending = members.filter((m) => m.status === "pending").length;
  const suspended = members.filter((m) => m.status === "suspended").length;
  const san = members.filter((m) => m.rank === "san").length;
  const bencher = members.filter((m) => m.rank === "bencher").length;
  const lbiansIssued = members.filter((m) => m.lbian).length;

  // ── Revenue (from the canonical payments ledger) ─────────────────────────
  const successPayments = payments.filter((p) => p.status === "success");
  const collectedForDuesItem = (itemId: string) =>
    successPayments
      .filter((p) => p.entity_type === "dues" && p.entity_id === itemId)
      .reduce((s, p) => s + Number(p.amount || 0), 0);

  const totalDuesCollected = successPayments.filter((p) => p.entity_type === "dues").reduce((s, p) => s + Number(p.amount || 0), 0);
  const serviceRevenue = successPayments.filter((p) => p.entity_type === "service_application").reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalRevenue = totalDuesCollected + serviceRevenue;

  // ── Dues compliance (paid counts from dues_payments; money from payments) ──
  const duesRows = duesItems.filter((d) => d.is_active).map((d) => {
    const paid = duesPayments.filter((p) => p.dues_item_id === d.id && PAID.includes(p.status)).length;
    return { id: d.id, title: d.title, year: d.year, paid, outstanding: Math.max(active - paid, 0), collected: collectedForDuesItem(d.id) };
  });

  // ── Applications ─────────────────────────────────────────────────────────
  const appTotal = apps.length;
  const appPending = apps.filter((a) => a.status === "pending").length;
  const appApproved = apps.filter((a) => a.status === "approved").length;
  const appRejected = apps.filter((a) => a.status === "rejected").length;
  const appByType: Record<string, number> = {};
  apps.forEach((a) => { const t = a.service_type || "unknown"; appByType[t] = (appByType[t] || 0) + 1; });

  const handleExportCSV = () => {
    const rows = [
      ["Section", "Metric", "Value"],
      ["Members", "Total", String(totalMembers)],
      ["Members", "Active", String(active)],
      ["Members", "Pending", String(pending)],
      ["Members", "Suspended", String(suspended)],
      ["Members", "Senior Advocates", String(san)],
      ["Members", "Honourable Benchers", String(bencher)],
      ["Members", "LBIANs Issued", String(lbiansIssued)],
      ["Revenue", "Dues Collected", String(totalDuesCollected)],
      ["Revenue", "Service Revenue", String(serviceRevenue)],
      ["Revenue", "Total", String(totalRevenue)],
      [],
      ["Dues Item", "Year", "Paid"],
      ...duesRows.map((d) => [d.title, String(d.year), `${d.paid}/${active}`]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `branch-report-${Date.now()}.csv`; link.click();
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
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Branch Overview</h1>
            <p className="text-muted-foreground mt-1">Membership, dues compliance, revenue and service activity at a glance.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Membership */}
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Membership</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="h-5 w-5 text-primary" />}      tone="bg-primary/10"   label="Total Members" value={totalMembers} />
            <StatCard icon={<UserCheck className="h-5 w-5 text-green-600" />} tone="bg-green-100"    label="Active"        value={active} />
            <StatCard icon={<Clock className="h-5 w-5 text-yellow-600" />}    tone="bg-yellow-100"   label="Pending"       value={pending} />
            <StatCard icon={<UserX className="h-5 w-5 text-red-600" />}       tone="bg-red-100"      label="Suspended"     value={suspended} />
            <StatCard icon={<ShieldCheck className="h-5 w-5 text-accent" />}  tone="bg-accent/15"    label="Senior Advocates" value={san} />
            <StatCard icon={<ShieldCheck className="h-5 w-5 text-accent" />}  tone="bg-accent/15"    label="Hon. Benchers" value={bencher} />
            <StatCard icon={<Hash className="h-5 w-5 text-primary" />}        tone="bg-primary/10"   label="LBIANs Issued" value={lbiansIssued} />
          </div>
        </div>

        {/* Revenue */}
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Revenue Collected</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={<Wallet className="h-5 w-5 text-primary" />}    tone="bg-primary/10" label="Total Collected"  value={naira(totalRevenue)} />
            <StatCard icon={<Landmark className="h-5 w-5 text-green-600" />} tone="bg-green-100"  label="Dues Collected"   value={naira(totalDuesCollected)} />
            <StatCard icon={<FileText className="h-5 w-5 text-blue-600" />}  tone="bg-blue-100"   label="Service Revenue"  value={naira(serviceRevenue)} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Totals are summed from confirmed Paystack payments. Dues paid by uploaded receipt count toward compliance but not toward collected totals.</p>
        </div>

        {/* Dues compliance */}
        {duesRows.length > 0 && (
          <SectionTable
            title={<><Landmark className="h-4 w-4 text-primary" /> Dues Compliance</>}
            head={<><Th>Levy</Th><Th right>Paid</Th><Th right>Outstanding</Th><Th right>Collected</Th></>}
          >
            {duesRows.map((d) => (
              <tr key={d.id} className="hover:bg-muted/20">
                <td className="px-5 py-3 text-foreground font-medium">{d.title} <span className="text-muted-foreground font-normal">· {d.year}</span></td>
                <td className="px-5 py-3 text-right text-green-700 font-semibold">{d.paid}/{active}</td>
                <td className="px-5 py-3 text-right text-amber-700">{d.outstanding}</td>
                <td className="px-5 py-3 text-right text-foreground">{naira(d.collected)}</td>
              </tr>
            ))}
          </SectionTable>
        )}

        {/* Applications */}
        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Service Applications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<ClipboardList className="h-5 w-5 text-primary" />} tone="bg-primary/10" label="Total"    value={appTotal} />
            <StatCard icon={<Clock className="h-5 w-5 text-yellow-600" />}      tone="bg-yellow-100" label="Pending"  value={appPending} />
            <StatCard icon={<CheckCircle className="h-5 w-5 text-green-600" />} tone="bg-green-100"  label="Approved" value={appApproved} />
            <StatCard icon={<XCircle className="h-5 w-5 text-red-600" />}       tone="bg-red-100"    label="Rejected" value={appRejected} />
          </div>
        </div>

        {Object.keys(appByType).length > 0 && (
          <SectionTable
            title={<><TrendingUp className="h-4 w-4 text-primary" /> Applications by Service</>}
            head={<><Th>Service</Th><Th right>Applications</Th></>}
          >
            {Object.entries(appByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <tr key={type} className="hover:bg-muted/20">
                <td className="px-5 py-3 text-foreground font-medium">{SERVICE_LABELS[type] || type}</td>
                <td className="px-5 py-3 text-right font-semibold text-foreground">{count}</td>
              </tr>
            ))}
          </SectionTable>
        )}

        {totalMembers === 0 && apps.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No data yet. Stats will populate as members register and use the portal.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReporting;
