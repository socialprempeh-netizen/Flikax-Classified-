"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { updateListingStatusAction } from "@/app/admin/listings/actions";
import { ADMIN_MODERATION_STATUSES } from "@/lib/admin-moderation";
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

function revalidateModeration() {
  revalidatePath("/admin/moderation");
  revalidatePath("/admin");
}

/** Approve, dismiss, or escalate flags. Rejecting also hides the underlying listing. */
export async function updateModerationFlagStatusAction(ids: string[], status: string) {
  if (ids.length === 0) return;
  if (!ADMIN_MODERATION_STATUSES.includes(status as (typeof ADMIN_MODERATION_STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const { supabase, actorId } = await requireAdminActor();

  const { data: flags } = await supabase.from("listing_moderation_flags").select("id, listing_id").in("id", ids);

  const { error } = await supabase
    .from("listing_moderation_flags")
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: actorId })
    .in("id", ids);
  if (error) throw new Error(error.message);

  if (status === "rejected" && flags && flags.length > 0) {
    const listingIds = Array.from(new Set(flags.map((f) => f.listing_id)));
    await updateListingStatusAction(listingIds, "removed");
  }

  for (const id of ids) {
    await logAdminAction({ actorId, action: "moderation.flag_status_change", targetType: "moderation_flag", targetId: id, detail: { status } });
  }
  revalidateModeration();
}
