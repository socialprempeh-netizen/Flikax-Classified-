const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

type FlutterwaveInitializeResponse = {
  status: string;
  message: string;
  data?: { link: string };
};

/** Returns null if FLUTTERWAVE_SECRET_KEY isn't configured. */
export function getFlutterwaveSecretKey(): string | null {
  return process.env.FLUTTERWAVE_SECRET_KEY || null;
}

export async function initializeFlutterwavePayment(params: {
  email: string;
  amountGHS: number;
  reference: string;
  redirectUrl: string;
}): Promise<FlutterwaveInitializeResponse> {
  const secretKey = getFlutterwaveSecretKey();
  if (!secretKey) {
    return { status: "error", message: "Flutterwave is not configured (missing FLUTTERWAVE_SECRET_KEY)." };
  }

  const res = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.reference,
      amount: params.amountGHS,
      currency: "GHS",
      redirect_url: params.redirectUrl,
      customer: { email: params.email },
    }),
  });

  return res.json();
}

/** Flutterwave webhooks are verified with a shared secret hash, not a computed signature. */
export function verifyFlutterwaveSignature(signature: string | null): boolean {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!secretHash || !signature) return false;
  return signature === secretHash;
}
