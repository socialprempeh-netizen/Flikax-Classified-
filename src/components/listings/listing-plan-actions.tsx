"use client";

import { useState } from "react";
import type { PremiumPlan } from "@/lib/premium-plans";

export function ListingPlanActions({
  listingId,
  plans,
  isFeatured,
}: {
  listingId: string;
  plans: PremiumPlan[];
  isFeatured: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A listing that's already featured doesn't need another featured_spot plan,
  // but bump_fee/pay_per_ad still apply regardless of featured status.
  const availablePlans = plans.filter((p) => p.plan_type !== "featured_spot" || !isFeatured);
  if (availablePlans.length === 0) return null;

  async function pay(planId: string, provider: "paystack" | "flutterwave") {
    const key = `${planId}-${provider}`;
    setLoadingKey(key);
    setError(null);

    const res = await fetch(`/api/payments/${provider}/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, listingId }),
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      setLoadingKey(null);
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    window.location.href = data.url;
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="relative z-10 mt-2 text-sm font-medium text-brand hover:underline"
      >
        Boost this ad
      </button>
    );
  }

  return (
    <div className="relative z-10 mt-2 space-y-2 rounded-lg border border-dashed border-neutral-200 p-3">
      {availablePlans.map((plan) => (
        <div key={plan.id} className="flex items-center justify-between gap-2">
          <p className="text-xs text-neutral-600">
            {plan.name} — GH₵{plan.price}
            {plan.duration_days ? ` (${plan.duration_days}d)` : ""}
          </p>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => pay(plan.id, "paystack")}
              disabled={loadingKey !== null}
              className="rounded bg-brand px-2 py-1 text-[10px] font-bold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {loadingKey === `${plan.id}-paystack` ? "..." : "Paystack"}
            </button>
            <button
              type="button"
              onClick={() => pay(plan.id, "flutterwave")}
              disabled={loadingKey !== null}
              className="rounded border border-neutral-200 px-2 py-1 text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
            >
              {loadingKey === `${plan.id}-flutterwave` ? "..." : "Flutterwave"}
            </button>
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
