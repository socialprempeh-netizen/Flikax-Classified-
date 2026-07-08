import { createHmac } from "node:crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
};

/** Returns null if PAYSTACK_SECRET_KEY isn't configured. */
export function getPaystackSecretKey(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountGHS: number;
  reference: string;
  callbackUrl: string;
}): Promise<PaystackInitializeResponse> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    return { status: false, message: "Paystack is not configured (missing PAYSTACK_SECRET_KEY)." };
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountGHS * 100), // Paystack expects the smallest currency unit (pesewas).
      currency: "GHS",
      reference: params.reference,
      callback_url: params.callbackUrl,
    }),
  });

  return res.json();
}

/** Verifies the `x-paystack-signature` header per Paystack's webhook spec (HMAC SHA512 of the raw body). */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = getPaystackSecretKey();
  if (!secretKey || !signature) return false;

  const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
  return expected === signature;
}
