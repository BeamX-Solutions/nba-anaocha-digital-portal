import { supabase } from "@/integrations/supabase/client";

export const logAudit = (
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) => {
  (supabase as any).from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details: details ?? null,
  }).then(({ error }: { error: any }) => {
    if (error) console.error("Audit log error:", error.message);
  });
};
