"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { ADMIN_TICKET_STATUSES } from "@/lib/admin-support";
import { logAdminAction } from "@/lib/admin-audit-log";

async function requireAdminActor() {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile?.role || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }

  return { supabase, actorId: user.id };
}

export async function updateTicketStatusAction(ids: string[], status: string) {
  if (ids.length === 0) return;
  if (!ADMIN_TICKET_STATUSES.includes(status as (typeof ADMIN_TICKET_STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(error.message);

  for (const id of ids) {
    await logAdminAction({ actorId, action: "support_ticket.status_change", targetType: "support_ticket", targetId: id, detail: { status } });
  }
  revalidatePath("/admin/support");
  revalidatePath("/admin");
}
