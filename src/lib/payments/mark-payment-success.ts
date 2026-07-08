import { createAdminClient } from "@/lib/supabase/admin";

/** Idempotent: safe to call more than once for the same reference (webhooks can retry/duplicate). */
export async function markPaymentSuccess(reference: string): Promise<{ ok: boolean; reason?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, reason: "admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)" };

  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (!payment) return { ok: false, reason: "payment not found" };
  if (payment.status === "success") return { ok: true };

  await admin
    .from("payments")
    .update({ status: "success", updated_at: new Date().toISOString() })
    .eq("id", payment.id);

  const { data: purchase } = await admin
    .from("purchases")
    .select("id, plan_id, listing_id")
    .eq("payment_id", payment.id)
    .maybeSingle();

  if (!purchase) return { ok: true };

  const { data: plan } = await admin
    .from("premium_plans")
    .select("plan_type, duration_days")
    .eq("id", purchase.plan_id)
    .maybeSingle();

  const startsAt = new Date();
  const expiresAt = plan?.duration_days
    ? new Date(startsAt.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)
    : null;

  await admin
    .from("purchases")
    .update({
      status: "active",
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", purchase.id);

  if (purchase.listing_id && plan?.plan_type === "featured_spot") {
    await admin
      .from("listings")
      .update({
        is_featured: true,
        featured_until: expiresAt ? expiresAt.toISOString() : null,
      })
      .eq("id", purchase.listing_id);
  }

  if (purchase.listing_id && plan?.plan_type === "bump_fee") {
    await admin
      .from("listings")
      .update({ bumped_at: startsAt.toISOString() })
      .eq("id", purchase.listing_id);
  }

  return { ok: true };
}
