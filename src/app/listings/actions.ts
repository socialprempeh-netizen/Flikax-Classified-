"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { REPORT_REASONS, type ReportReason } from "@/lib/report-reasons";

export async function toggleSavedListingAction(listingId: string): Promise<{ saved: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("saved_listings")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_listings").delete().eq("id", existing.id);
    revalidatePath("/[category]/[slug]", "page");
    revalidatePath("/saved");
    return { saved: false };
  }

  await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
  revalidatePath("/[category]/[slug]", "page");
  revalidatePath("/saved");
  return { saved: true };
}

export async function markListingUnavailableAction(listingId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("listings")
    .update({ status: "removed" })
    .eq("id", listingId)
    .eq("user_id", user.id);

  revalidatePath("/[category]/[slug]", "page");
  revalidatePath("/dashboard");
}

export async function submitReportAction(listingId: string, reason: ReportReason): Promise<void> {
  if (!REPORT_REASONS.includes(reason)) throw new Error("Invalid report reason");

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("reports")
    .insert({ listing_id: listingId, reporter_id: user.id, reason });

  if (error) {
    // Unique index blocks a second *open* report from the same reporter on
    // the same listing — friendlier than surfacing the raw constraint error.
    if (error.code === "23505") {
      throw new Error("You've already reported this listing. We'll review it soon.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}
