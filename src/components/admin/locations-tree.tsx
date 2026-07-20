"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
  updateDistrictNameAction,
  updateRegionNameAction,
  toggleLocationEnabledAction,
  reorderDistrictAction,
  reorderRegionAction,
  deleteLocationAction,
} from "@/app/admin/locations/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

export type AdminLocation = {
  id: string;
  region_name: string;
  region_slug: string;
  region_order: number;
  district_name: string;
  district_slug: string;
  district_order: number;
  enabled: boolean;
};

type RenameTarget = { type: "region"; slug: string; name: string } | { type: "district"; id: string; name: string };

export function LocationsTree({ locations }: { locations: AdminLocation[] }) {
  const router = useRouter();
  const regions = Array.from(new Map(locations.map((l) => [l.region_slug, l])).values()).sort(
    (a, b) => a.region_order - b.region_order
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminLocation | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function run(action: () => Promise<void>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(action);
        onDone?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  function districtsOf(regionSlug: string) {
    return locations.filter((l) => l.region_slug === regionSlug).sort((a, b) => a.district_order - b.district_order);
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border-2 border-slate-strong bg-white">
        {regions.map((region, index) => {
          const districts = districtsOf(region.region_slug);
          const isOpen = expanded.has(region.region_slug);
          const enabledCount = districts.filter((d) => d.enabled).length;

          return (
            <div key={region.region_slug}>
              <div className="flex items-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => toggle(region.region_slug)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                <span className="flex-1 text-sm font-bold text-neutral-800">{region.region_name}</span>
                <span className="text-xs text-neutral-400">
                  {enabledCount}/{districts.length} enabled
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={isPending || index === 0}
                    onClick={() => run(() => reorderRegionAction(region.region_slug, "up"))}
                    className="flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending || index === regions.length - 1}
                    onClick={() => run(() => reorderRegionAction(region.region_slug, "down"))}
                    className="flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenameTarget({ type: "region", slug: region.region_slug, name: region.region_name });
                      setRenameValue(region.region_name);
                    }}
                    className="rounded-lg border-2 border-slate-strong px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="divide-y divide-neutral-50 bg-neutral-50/50 pl-9">
                  {districts.map((district, districtIndex) => (
                    <div key={district.id} className="flex items-center gap-2 py-2 pr-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={district.enabled}
                          disabled={isPending}
                          onChange={(e) => run(() => toggleLocationEnabledAction(district.id, e.target.checked))}
                          className="size-4 accent-brand"
                        />
                      </label>
                      <span
                        className={`flex-1 text-sm ${district.enabled ? "text-neutral-700" : "text-neutral-400 line-through"}`}
                      >
                        {district.district_name}
                      </span>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={isPending || districtIndex === 0}
                          onClick={() => run(() => reorderDistrictAction(district.id, "up"))}
                          className="flex size-6 items-center justify-center rounded-md text-neutral-500 hover:bg-white disabled:opacity-30"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending || districtIndex === districts.length - 1}
                          onClick={() => run(() => reorderDistrictAction(district.id, "down"))}
                          className="flex size-6 items-center justify-center rounded-md text-neutral-500 hover:bg-white disabled:opacity-30"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameTarget({ type: "district", id: district.id, name: district.district_name });
                            setRenameValue(district.district_name);
                          }}
                          className="rounded-lg border-2 border-slate-strong px-2 py-1 text-xs font-bold text-neutral-700 hover:bg-white"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(district)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600 hover:bg-white"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {renameTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-neutral-800">
              Rename {renameTarget.type === "region" ? "region" : "district"}
            </h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              className="mt-3 w-full rounded-lg border-2 border-slate-strong px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                disabled={isPending}
                className="rounded-lg border-2 border-slate-strong px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !renameValue.trim()}
                onClick={() =>
                  run(
                    () =>
                      renameTarget.type === "region"
                        ? updateRegionNameAction(renameTarget.slug, renameValue)
                        : updateDistrictNameAction(renameTarget.id, renameValue),
                    () => setRenameTarget(null)
                  )
                }
                className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.district_name}"?`}
        message="This can't be undone. Blocked automatically if any listing's location matches this district."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={() => deleteTarget && run(() => deleteLocationAction(deleteTarget.id), () => setDeleteTarget(null))}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
