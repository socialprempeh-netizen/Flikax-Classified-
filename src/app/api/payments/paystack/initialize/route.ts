import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { PAYMENTS_ENABLED } from "@/lib/payments/config";
import { createPendingPurchase } from "@/lib/payments/create-pending-purchase";
import { initializePaystackTransaction } from "@/lib/payments/paystack";

export async function POST(request: Request) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "Payments are not enabled." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { planId, listingId } = await request.json();
  if (typeof planId !== "string") {
    return NextResponse.json({ error: "Missing planId." }, { status: 400 });
  }

  const pending = await createPendingPurchase({
    supabase,
    userId: user.id,
    planId,
    listingId: typeof listingId === "string" ? listingId : undefined,
    provider: "paystack",
  });

  if ("error" in pending) {
    const status = pending.error === "plan_not_found" ? 404 : pending.error === "insert_failed" ? 500 : 400;
    return NextResponse.json({ error: pending.error }, { status });
  }

  const { origin } = new URL(request.url);
  const result = await initializePaystackTransaction({
    email: user.email ?? `${user.id}@flikax-users.com`,
    amountGHS: pending.amount,
    reference: pending.reference,
    callbackUrl: `${origin}/dashboard`,
  });

  if (!result.status || !result.data) {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  return NextResponse.json({ url: result.data.authorization_url });
}
