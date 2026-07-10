"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { logWarningAction } from "@/app/admin/users/actions";
import { logAdminAction } from "@/lib/admin-audit-log";

const FEEDBACK_REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;

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

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

export async function updateFeedbackReportStatusAction(ids: string[], status: string) {
  if (ids.length === 0) return;
  if (!FEEDBACK_REPORT_STATUSES.includes(status as (typeof FEEDBACK_REPORT_STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("feedback_reports").update({ status }).in("id", ids);
  if (error) throw new Error(error.message);

  for (const id of ids) {
    await logAdminAction({ actorId, action: "feedback_report.status_change", targetType: "feedback_report", targetId: id, detail: { status } });
  }
  revalidateReviews();
}

/** Deletes the reported feedback entry (its replies cascade), then marks the report resolved. */
export async function deleteFeedbackAction(reportId: string, feedbackId: string) {
  const { supabase, actorId } = await requireAdminActor();

  const { error: deleteError } = await supabase.from("profile_feedback").delete().eq("id", feedbackId);
  if (deleteError) throw new Error(deleteError.message);

  const { error } = await supabase.from("feedback_reports").update({ status: "resolved" }).eq("id", reportId);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "feedback.delete", targetType: "feedback", targetId: feedbackId });
  revalidateReviews();
}

/** Warns the feedback's author (reusing the existing warning system), then marks the report resolved. */
export async function warnFeedbackAuthorAction(reportId: string, authorId: string, message: string) {
  const { supabase, actorId } = await requireAdminActor();

  await logWarningAction(authorId, message);

  const { error } = await supabase.from("feedback_reports").update({ status: "resolved" }).eq("id", reportId);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "feedback.warn_author", targetType: "feedback_report", targetId: reportId, detail: { authorId } });
  revalidateReviews();
  revalidatePath(`/admin/users/${authorId}`);
}
