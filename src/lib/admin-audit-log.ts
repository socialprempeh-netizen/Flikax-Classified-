import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

/**
 * Fire-and-forget: a logging failure must never block the actual admin action
 * it's recording. Always writes via the service-role client so every action
 * file's call looks identical regardless of whether that file's own mutation
 * used the RLS-bound or service-role client.
 */
export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  detail?: Record<string, unknown>;
}) {
  const adminClient = createAdminClient();
  if (!adminClient) return;

  await adminClient.from("admin_audit_log").insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    detail: (params.detail as Json) ?? null,
  });
}
