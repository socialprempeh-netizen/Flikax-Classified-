"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ADMIN_MODERATION_FLAG_TYPE_LABELS,
  ADMIN_MODERATION_STATUS_LABELS,
  ADMIN_MODERATION_STATUS_STYLES,
} from "@/lib/admin-moderation";
import { updateModerationFlagStatusAction } from "@/app/admin/moderation/actions";
import { withAuthRetry } from "@/lib/auth-retry";

export type AdminModerationRow = {
  id: string;
  flagType: string;
  detail: string | null;
  status: string;
  createdAt: string;
  listingId: string;
  listingTitle: string;
  sellerName: string | null;
  duplicateOfListingId: string | null;
  duplicateOfListingTitle: string | null;
};

export function ModerationTable({ flags }: { flags: AdminModerationRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allSelected = flags.length > 0 && selected.size === flags.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(flags.map((f) => f.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(ids: string[], status: string) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => updateModerationFlagStatusAction(ids, status));
        setSelected(new Set());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  const selectedIds = Array.from(selected);

  if (flags.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-400">
        No flagged listings match these filters.
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {selectedIds.length > 0 && (
        <div className="sticky top-14 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-brand/30 bg-brand-light px-4 py-3">
          <span className="text-sm font-bold text-neutral-800">{selectedIds.length} selected</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(selectedIds, "approved")}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(selectedIds, "rejected")}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject &amp; hide listing
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(selectedIds, "escalated")}
            className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50 disabled:opacity-60"
          >
            Escalate
          </button>
        </div>
      )}

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Select all"
            className="size-4 accent-brand"
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Select all on this page
          </span>
        </div>

        {flags.map((flag) => (
          <div key={flag.id} className="flex items-start gap-3 p-4 hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={selected.has(flag.id)}
              onChange={() => toggleOne(flag.id)}
              aria-label={`Select flag on ${flag.listingTitle}`}
              className="mt-1 size-4 shrink-0 accent-brand"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/listings/${flag.listingId}`}
                  className="truncate text-sm font-bold text-neutral-800 hover:text-brand hover:underline"
                >
                  {flag.listingTitle}
                </Link>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                  {ADMIN_MODERATION_FLAG_TYPE_LABELS[flag.flagType] ?? flag.flagType}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    ADMIN_MODERATION_STATUS_STYLES[flag.status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {ADMIN_MODERATION_STATUS_LABELS[flag.status] ?? flag.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                Seller: {flag.sellerName ?? "Unknown"} · {new Date(flag.createdAt).toLocaleDateString()}
              </p>
              {flag.flagType === "duplicate_image" && flag.duplicateOfListingId && (
                <p className="mt-0.5 text-sm text-neutral-500">
                  Matches:{" "}
                  <Link
                    href={`/admin/listings/${flag.duplicateOfListingId}`}
                    className="text-brand hover:underline"
                  >
                    {flag.duplicateOfListingTitle ?? flag.duplicateOfListingId}
                  </Link>
                </p>
              )}
              {flag.flagType === "contact_in_description" && flag.detail && (
                <p className="mt-0.5 truncate text-sm text-neutral-500">Matched: &quot;{flag.detail}&quot;</p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {flag.status !== "approved" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run([flag.id], "approved")}
                  className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
                >
                  Approve
                </button>
              )}
              {flag.status !== "rejected" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run([flag.id], "rejected")}
                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  Reject
                </button>
              )}
              {flag.status !== "escalated" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run([flag.id], "escalated")}
                  className="rounded-lg border border-purple-200 px-2.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                >
                  Escalate
                </button>
              )}
              <Link
                href={`/admin/listings/${flag.listingId}`}
                className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Edit listing
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
