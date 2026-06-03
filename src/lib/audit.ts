import { supabase } from "@/integrations/supabase/client";

export async function logAudit(action: string, entity_type: string, entity_id?: string | null, details?: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action,
    entity_type,
    entity_id: entity_id ?? null,
    details: (details ?? null) as never,
  });
}