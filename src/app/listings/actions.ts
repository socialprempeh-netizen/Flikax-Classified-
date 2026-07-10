"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

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
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/saved");
    return { saved: false };
  }

  await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
  revalidatePath(`/listings/${listingId}`);
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

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
}
