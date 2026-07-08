"use client";

import { useState, useTransition } from "react";
import { togglePlanEnabledAction, deletePlanAction } from "@/app/admin/premium-plans/actions";
import type { PremiumPlan, PlanType } from "@/lib/premium-plans";

const PLAN_TYPE_STYLES: Record<PlanType, string> = {
  featured_spot: "bg-amber-100 text-amber-700",
  bump_fee: "bg-blue-100 text-blue-700",
  pay_per_ad: "bg-purple-100 text-purple-700",
  subscription: "bg-green-100 text-green-700",
};

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  featured_spot: "Featured Spot",
  bump_fee: "Bump Fee",
  pay_per_ad: "Pay Per Ad",
  subscription: "Subscription",
};

const currency = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

export function PremiumPlanRow({
  plan,
  onEdit,
  onDeleted,
}: {
  plan: PremiumPlan;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [enabled, setEnabled] = useState(plan.is_enabled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      try {
        await togglePlanEnabledAction(plan.id, next);
      } catch (err) {
        setEnabled(!next);
        setError(err instanceof Error ? err.message : "Failed to update.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${plan.name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deletePlanAction(plan.id);
        onDeleted();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-neutral-800">{plan.name}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PLAN_TYPE_STYLES[plan.plan_type]}`}>
            {PLAN_TYPE_LABELS[plan.plan_type]}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">
          {currency.format(plan.price)}
          {plan.duration ? ` / ${plan.duration}` : ""}
          {plan.duration_days ? ` · active ${plan.duration_days}d` : ""}
        </p>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-brand hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-pressed={enabled}
          aria-label={`Toggle ${plan.name}`}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            enabled ? "bg-brand" : "bg-neutral-300"
          }`}
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
