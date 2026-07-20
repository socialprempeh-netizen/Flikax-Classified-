"use client";

import { useState } from "react";

export function PlanPurchaseButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState<"paystack" | "flutterwave" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pay(provider: "paystack" | "flutterwave") {
    setLoading(provider);
    setError(null);

    const res = await fetch(`/api/payments/${provider}/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      setLoading(null);
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => pay("paystack")}
          disabled={loading !== null}
          className="flex-1 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading === "paystack" ? "Redirecting..." : "Pay with Paystack"}
        </button>
        <button
          type="button"
          onClick={() => pay("flutterwave")}
          disabled={loading !== null}
          className="flex-1 rounded-lg border-2 border-slate-strong px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          {loading === "flutterwave" ? "Redirecting..." : "Pay with Flutterwave"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
