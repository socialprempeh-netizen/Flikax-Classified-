"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction } from "@/app/admin/settings/actions";
import type { SiteSetting } from "@/lib/site-settings";

export function SiteSettingField({ setting }: { setting: SiteSetting }) {
  const [value, setValue] = useState(setting.value ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateSiteSettingAction(setting.key, value);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-semibold text-neutral-800">{setting.key}</p>
        {setting.description && <p className="mt-0.5 text-sm text-neutral-500">{setting.description}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          className="w-64 rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
