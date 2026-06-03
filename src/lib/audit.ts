import { writeAuditLog } from "@/lib/audit.functions";

export async function logAudit(
  action: string,
  entity_type: string,
  entity_id?: string | null,
  details?: Record<string, unknown>,
) {
  try {
    await writeAuditLog({
      data: {
        action,
        entity_type,
        entity_id: entity_id ?? null,
        details: details ?? null,
      },
    });
  } catch {
    // swallow — audit logging must not break user-facing flows
  }
}