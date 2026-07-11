"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

export async function startOrGetConversationAction(listingId: string): Promise<void> {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/listings/${listingId}`);
  }

  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) throw new Error("Listing not found");
  if (listing.user_id === user.id) throw new Error("You can't message yourself about your own listing");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  let conversationId = existing?.id;

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ listing_id: listingId, buyer_id: user.id, seller_id: listing.user_id })
      .select("id")
      .single();

    if (error) {
      // Unique (listing_id, buyer_id) constraint — a concurrent click already
      // created it; fall back to the row that won the race.
      if (error.code === "23505") {
        const { data: retryExisting } = await supabase
          .from("conversations")
          .select("id")
          .eq("listing_id", listingId)
          .eq("buyer_id", user.id)
          .single();
        conversationId = retryExisting?.id;
      } else {
        throw new Error(error.message);
      }
    } else {
      conversationId = created.id;
    }
  }

  if (!conversationId) throw new Error("Could not start conversation");

  redirect(`/messages/${conversationId}`);
}

export async function revealPhoneAction(conversationId: string): Promise<void> {
  const {
    data: { user },
  } = await getUser();

  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { error } = await supabase.rpc("reveal_phone", { p_conversation_id: conversationId });

  if (error) throw new Error(error.message);

  revalidatePath(`/messages/${conversationId}`);
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const {
    data: { user },
  } = await getUser();

  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });

  revalidatePath("/messages");
}
