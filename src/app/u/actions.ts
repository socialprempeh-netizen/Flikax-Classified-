"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { FEEDBACK_REPORT_REASONS, type FeedbackReportReason } from "@/lib/feedback-report-reasons";

export type Sentiment = "positive" | "neutral" | "negative";

export async function submitFeedbackAction(
  profileId: string,
  sentiment: Sentiment,
  message: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) return { error: "You must be logged in to leave feedback." };
  if (user.id === profileId) return { error: "You can't leave feedback on your own profile." };
  if (!message.trim()) return { error: "Feedback message can't be empty." };

  const { error } = await supabase.from("profile_feedback").insert({
    profile_id: profileId,
    author_id: user.id,
    sentiment,
    message: message.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/u/${profileId}`);
  revalidatePath("/dashboard/feedback");
  return {};
}

export async function reportFeedbackAction(
  feedbackId: string,
  reason: FeedbackReportReason
): Promise<{ error?: string }> {
  if (!FEEDBACK_REPORT_REASONS.includes(reason)) return { error: "Invalid report reason" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) return { error: "You must be logged in to report feedback." };

  const { error } = await supabase
    .from("feedback_reports")
    .insert({ feedback_id: feedbackId, reporter_id: user.id, reason });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reported this feedback. We'll review it soon." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  return {};
}

export async function replyToFeedbackAction(
  feedbackId: string,
  profileId: string,
  message: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) return { error: "You must be logged in to reply." };
  if (!message.trim()) return { error: "Reply can't be empty." };

  const { error } = await supabase.from("profile_feedback_replies").insert({
    feedback_id: feedbackId,
    author_id: user.id,
    message: message.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/u/${profileId}`);
  revalidatePath("/dashboard/feedback");
  return {};
}
