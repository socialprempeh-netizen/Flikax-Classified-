import { NextResponse } from "next/server";
import { PAYMENTS_ENABLED } from "@/lib/payments/config";
import { verifyPaystackSignature } from "@/lib/payments/paystack";
import { markPaymentSuccess } from "@/lib/payments/mark-payment-success";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "Payments are not enabled." }, { status: 404 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    await markPaymentSuccess(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
