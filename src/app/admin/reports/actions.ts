"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { suspendUserAction, logWarningAction } from "@/app/admin/users/actions";
import { deleteListingsAction } from "@/app/admin/listings/actions";
import { logAdminAction } from "@/lib/admin-audit-log";

const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;

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

function revalidateReports(ids: string[]) {
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  for (const id of ids) revalidatePath(`/admin/reports/${id}`);
}

export async function updateReportStatusAction(ids: string[], status: string) {
  if (ids.length === 0) return;
  if (!REPORT_STATUSES.includes(status as (typeof REPORT_STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("reports").update({ status }).in("id", ids);
  if (error) throw new Error(error.message);

  for (const id of ids) {
    await logAdminAction({ actorId, action: "report.status_change", targetType: "report", targetId: id, detail: { status } });
  }
  revalidateReports(ids);
}

export async function toggleReportPriorityAction(id: string, priority: boolean) {
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("reports").update({ priority }).eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "report.priority_toggle", targetType: "report", targetId: id, detail: { priority } });
  revalidateReports([id]);
}

/** Warn the reported listing's seller, then mark the report resolved. */
export async function warnSellerForReportAction(reportId: string, sellerId: string, message: string) {
  const { supabase, actorId } = await requireAdminActor();

  await logWarningAction(sellerId, message);

  const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "report.resolved_via_warn", targetType: "report", targetId: reportId, detail: { sellerId } });
  revalidateReports([reportId]);
  revalidatePath(`/admin/users/${sellerId}`);
}

/** Suspend the reported listing's seller, then mark the report resolved. */
export async function suspendSellerForReportAction(reportId: string, sellerId: string, days: number) {
  const { supabase, actorId } = await requireAdminActor();

  await suspendUserAction(sellerId, days);

  const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "report.resolved_via_suspend", targetType: "report", targetId: reportId, detail: { sellerId, days } });
  revalidateReports([reportId]);
  revalidatePath(`/admin/users/${sellerId}`);
}

/** Delete the reported listing, then mark the report resolved. */
export async function deleteListingForReportAction(reportId: string, listingId: string) {
  const { supabase, actorId } = await requireAdminActor();

  await deleteListingsAction([listingId]);

  const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "report.resolved_via_delete", targetType: "report", targetId: reportId, detail: { listingId } });
  revalidateReports([reportId]);
}
