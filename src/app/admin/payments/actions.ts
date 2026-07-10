"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPaymentSuccess } from "@/lib/payments/mark-payment-success";
import { clearFeaturedAction, clearBumpAction } from "@/app/admin/listings/actions";

// purchases/payments have no admin-read/write RLS policy for plain "admin"
// (only "Super admins can view all purchases" exists, and payments has no
// admin policy at all) — so this file follows the same pattern as
// src/app/admin/users/actions.ts: check the caller's role with the regular
// client, then do all actual reads/writes through the service-role client.
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

  const adminClient = createAdminClient();
  if (!adminClient) throw new Error("Admin operations aren't configured on this environment.");

  return { adminClient };
}

function revalidatePayments() {
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

/** For edge cases where a payment succeeded on the provider side but never webhooked. Reuses the same
 * effect-application logic the real webhook uses, rather than duplicating it. */
export async function markPurchaseActiveAction(purchaseId: string) {
  const { adminClient } = await requireAdminActor();

  const { data: purchase } = await adminClient
    .from("purchases")
    .select("id, payment_id")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!purchase) throw new Error("Purchase not found");
  if (!purchase.payment_id) throw new Error("This purchase has no linked payment record.");

  const { data: payment } = await adminClient
    .from("payments")
    .select("reference")
    .eq("id", purchase.payment_id)
    .maybeSingle();
  if (!payment) throw new Error("Linked payment not found");

  const result = await markPaymentSuccess(payment.reference);
  if (!result.ok) throw new Error(result.reason ?? "Could not activate purchase");

  revalidatePayments();
}

/** Ends an active purchase early and reverses its listing effect via the same functions the admin listings
 * page already uses for this (clearFeaturedAction/clearBumpAction) — not duplicated here. */
export async function revokePurchaseAction(purchaseId: string) {
  const { adminClient } = await requireAdminActor();

  const { data: purchase } = await adminClient
    .from("purchases")
    .select("id, listing_id, plan_id")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!purchase) throw new Error("Purchase not found");

  const nowIso = new Date().toISOString();
  const { error } = await adminClient
    .from("purchases")
    .update({ status: "cancelled", expires_at: nowIso, updated_at: nowIso })
    .eq("id", purchaseId);
  if (error) throw new Error(error.message);

  if (purchase.listing_id) {
    const { data: plan } = await adminClient
      .from("premium_plans")
      .select("plan_type")
      .eq("id", purchase.plan_id)
      .maybeSingle();

    if (plan?.plan_type === "featured_spot") {
      await clearFeaturedAction(purchase.listing_id);
    } else if (plan?.plan_type === "bump_fee") {
      await clearBumpAction(purchase.listing_id);
    }
  }

  revalidatePayments();
}
