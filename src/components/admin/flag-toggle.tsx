"use client";

import { useState, useTransition } from "react";
import { toggleFeatureFlagAction } from "@/app/admin/settings/actions";
import type { FeatureFlag } from "@/lib/feature-flags";

export function FlagToggle({ flag }: { flag: FeatureFlag }) {
  const [enabled, setEnabled] = useState(flag.enabled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      try {
        await toggleFeatureFlagAction(flag.key, next);
      } catch (err) {
        setEnabled(!next);
        setError(err instanceof Error ? err.message : "Failed to update flag.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="font-mono text-sm font-semibold text-neutral-800">{flag.key}</p>
        {flag.description && <p className="mt-0.5 text-sm text-neutral-500">{flag.description}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={enabled}
        aria-label={`Toggle ${flag.key}`}
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
  );
}
