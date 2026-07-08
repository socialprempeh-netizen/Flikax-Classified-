"use client";

import { useState, useTransition, type FormEvent } from "react";
import { X } from "lucide-react";
import { createPlanAction, updatePlanAction, type PlanFormInput } from "@/app/admin/premium-plans/actions";
import type { PremiumPlan, PlanType } from "@/lib/premium-plans";

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "featured_spot", label: "Featured Spot" },
  { value: "bump_fee", label: "Bump Fee" },
  { value: "pay_per_ad", label: "Pay Per Ad" },
  { value: "subscription", label: "Subscription" },
];

const FIELD_CLASS =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand";

function planToForm(plan: PremiumPlan | null): PlanFormInput {
  if (!plan) {
    return {
      name: "",
      description: "",
      price: 0,
      plan_type: "featured_spot",
      duration: "",
      duration_days: null,
      features: [],
      display_order: 0,
    };
  }
  return {
    name: plan.name,
    description: plan.description ?? "",
    price: plan.price,
    plan_type: plan.plan_type,
    duration: plan.duration ?? "",
    duration_days: plan.duration_days,
    features: plan.features,
    display_order: plan.display_order,
  };
}

export function PremiumPlanForm({
  editingPlan,
  onSaved,
  onCancelEdit,
}: {
  editingPlan: PremiumPlan | null;
  onSaved: (plan: PremiumPlan) => void;
  onCancelEdit: () => void;
}) {
  const [form, setForm] = useState<PlanFormInput>(() => planToForm(editingPlan));
  const [featureInput, setFeatureInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function addFeature() {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, features: [...f.features, trimmed] }));
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== index) }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const saved = editingPlan
          ? await updatePlanAction(editingPlan.id, form)
          : await createPlanAction(form);
        onSaved(saved as PremiumPlan);
        if (!editingPlan) setForm(planToForm(null));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save plan.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Plan type</span>
          <select
            value={form.plan_type}
            onChange={(e) => setForm((f) => ({ ...f, plan_type: e.target.value as PlanType }))}
            className={FIELD_CLASS}
          >
            {PLAN_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Price (GHS)</span>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Billing label (optional)</span>
          <select
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value as PlanFormInput["duration"] }))}
            className={FIELD_CLASS}
          >
            <option value="">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">
            Effect duration (days, blank = no expiry)
          </span>
          <input
            type="number"
            min={0}
            value={form.duration_days ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration_days: e.target.value === "" ? null : Number(e.target.value) }))
            }
            className={FIELD_CLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Display order</span>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Description (optional)</span>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={FIELD_CLASS}
        />
      </label>

      <div>
        <span className="mb-1 block text-xs font-medium text-neutral-600">Features</span>
        <div className="flex flex-wrap gap-2">
          {form.features.map((feature, i) => (
            <span
              key={`${feature}-${i}`}
              className="flex items-center gap-1 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand"
            >
              {feature}
              <button
                type="button"
                onClick={() => removeFeature(i)}
                aria-label={`Remove ${feature}`}
                className="hover:text-brand-dark"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeature();
              }
            }}
            placeholder="e.g. Top of search results"
            className={`${FIELD_CLASS} flex-1`}
          />
          <button
            type="button"
            onClick={addFeature}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? "Saving..." : editingPlan ? "Save changes" : "Create plan"}
        </button>
        {editingPlan && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
