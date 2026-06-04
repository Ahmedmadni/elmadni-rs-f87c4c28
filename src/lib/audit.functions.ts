import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const writeAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      action: z.string().min(1).max(64),
      entity_type: z.string().min(1).max(64),
      entity_id: z.string().uuid().nullable().optional(),
      details: z.record(z.string(), z.unknown()).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Only admins may write audit log entries — prevent any authenticated user
    // from fabricating audit records.
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Forbidden");
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id ?? null,
      details: (data.details ?? null) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });