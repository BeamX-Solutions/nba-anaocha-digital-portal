import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export const logAudit = (
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Json
) => {
  supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details: details ?? null,
  }).then(({ error }) => {
    if (error) console.error("Audit log error:", error.message);
  });
};
