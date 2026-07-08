import { NextResponse } from "next/server";
import { PAYMENTS_ENABLED } from "@/lib/payments/config";
import { verifyFlutterwaveSignature } from "@/lib/payments/flutterwave";
import { markPaymentSuccess } from "@/lib/payments/mark-payment-success";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "Payments are not enabled." }, { status: 404 });
  }

  const signature = request.headers.get("verif-hash");
  if (!verifyFlutterwaveSignature(signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = await request.json();

  if (event.event === "charge.completed" && event.data?.status === "successful") {
    await markPaymentSuccess(event.data.tx_ref);
  }

  return NextResponse.json({ received: true });
}
