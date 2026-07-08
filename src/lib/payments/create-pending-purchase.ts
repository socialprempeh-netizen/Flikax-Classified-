import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { LISTING_SCOPED_PLAN_TYPES, type PlanType } from "@/lib/premium-plans";

type PendingPurchaseError =
  | "plan_not_found"
  | "listing_required"
  | "listing_not_found_or_forbidden"
  | "insert_failed";

/** Verifies the plan is enabled (and listing ownership where required), then records a pending payment + purchase. */
export async function createPendingPurchase({
  supabase,
  userId,
  planId,
  listingId,
  provider,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  planId: string;
  listingId?: string;
  provider: "paystack" | "flutterwave";
}): Promise<{ reference: string; amount: number } | { error: PendingPurchaseError }> {
  const { data: plan } = await supabase
    .from("premium_plans")
    .select("id, price, plan_type, is_enabled")
    .eq("id", planId)
    .eq("is_enabled", true)
    .maybeSingle();

  if (!plan) return { error: "plan_not_found" };

  const isListingScoped = LISTING_SCOPED_PLAN_TYPES.includes(plan.plan_type as PlanType);

  if (isListingScoped) {
    if (!listingId) return { error: "listing_required" };
    const { data: listing } = await supabase
      .from("listings")
      .select("id, user_id")
      .eq("id", listingId)
      .maybeSingle();
    if (!listing || listing.user_id !== userId) {
      return { error: "listing_not_found_or_forbidden" };
    }
  }

  const reference = `flikax_plan_${randomUUID()}`;

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      listing_id: isListingScoped ? (listingId ?? null) : null,
      provider,
      reference,
      amount: plan.price,
      currency: "GHS",
      status: "pending",
    })
    .select("id")
    .single();

  if (paymentError || !payment) return { error: "insert_failed" };

  const { error: purchaseError } = await supabase.from("purchases").insert({
    user_id: userId,
    plan_id: planId,
    listing_id: isListingScoped ? (listingId ?? null) : null,
    payment_id: payment.id,
    status: "pending",
  });

  if (purchaseError) return { error: "insert_failed" };

  return { reference, amount: plan.price };
}
