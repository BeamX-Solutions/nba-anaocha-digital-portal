import { useEffect, useState, useRef } from "react";
import { ScrollText, Search, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const ACTION_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  application_approved:  { label: "Approved",        variant: "default" },
  application_rejected:  { label: "Rejected",        variant: "destructive" },
  member_approved:       { label: "Member Approved", variant: "default" },
  member_suspended:      { label: "Suspended",       variant: "destructive" },
  member_reinstated:     { label: "Reinstated",      variant: "outline" },
  admin_granted:         { label: "Admin Granted",   variant: "default" },
  admin_revoked:         { label: "Admin Revoked",   variant: "destructive" },
  announcement_created:  { label: "Announcement",    variant: "secondary" },
  resource_added:        { label: "Resource Added",  variant: "secondary" },
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    const entries = data || [];
    setLogs(entries);
    setFiltered(entries);

    const adminIds = [...new Set(entries.map((e: any) => e.admin_id).filter(Boolean))] as string[];
    if (adminIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, first_name, surname, email")
        .in("user_id", adminIds);
      const map: Record<string, any> = {};
      (profileData || []).forEach((p) => { map[p.user_id] = p; });
      setAdminProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase().trim();
      setFiltered(!q ? logs : logs.filter((l) =>
        [l.action, l.entity_type, l.entity_id, JSON.stringify(l.details)].some((v) =>
          v?.toLowerCase().includes(q)
        )
      ));
    }, 200);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">Complete history of administrative actions taken in the portal.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by action, entity, or details..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="button" onClick={() => handleSearchChange(query)}>
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No audit log entries found.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Action</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">Admin</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground hidden md:table-cell">Details</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground whitespace-nowrap">Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((log) => {
                      const profile = adminProfiles[log.admin_id];
                      const adminName = profile
                        ? [profile.surname, profile.first_name].filter(Boolean).join(" ") || profile.email
                        : log.admin_id?.slice(0, 8) ?? "—";
                      const cfg = ACTION_CONFIG[log.action] ?? { label: log.action, variant: "secondary" as const };
                      const details = log.details
                        ? Object.entries(log.details).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(" · ")
                        : "";
                      return (
                        <tr key={log.id} className="hover:bg-muted/20">
                          <td className="px-5 py-3">
                            <Badge variant={cfg.variant} className="text-[10px] whitespace-nowrap capitalize">
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground text-xs">{adminName}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">{details}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(log.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                            {" · "}
                            {new Date(log.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
