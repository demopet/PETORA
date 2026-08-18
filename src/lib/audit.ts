import { supabase } from "./supabase/client";

export async function logAudit(params: {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}) {
  await supabase.from("audit_logs").insert({
    ...params,
    created_at: new Date().toISOString(),
  });
}
