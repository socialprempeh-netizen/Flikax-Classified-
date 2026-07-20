"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageOff, Star, TrendingUp, AlertTriangle } from "lucide-react";
import { ADMIN_STATUS_LABELS, ADMIN_STATUS_STYLES } from "@/lib/admin-listings";
import { updateListingStatusAction, deleteListingsAction } from "@/app/admin/listings/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export type AdminListingRow = {
  id: string;
  title: string;
  price: number;
  status: string;
  location: string;
  categoryName: string | null;
  sellerName: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isBumped: boolean;
  isExpired: boolean;
};

type PendingConfirm =
  | { type: "reject" | "hide"; ids: string[] }
  | { type: "delete"; ids: string[] };

export function ListingsTable({ listings }: { listings: AdminListingRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const allSelected = listings.length > 0 && selected.size === listings.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(listings.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runStatusChange(ids: string[], status: string) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => updateListingStatusAction(ids, status));
        setSelected(new Set());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  function runDelete(ids: string[]) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => deleteListingsAction(ids));
        setSelected(new Set());
        setConfirm(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.type === "delete") {
      runDelete(confirm.ids);
    } else if (confirm.type === "reject") {
      runStatusChange(confirm.ids, "declined");
      setConfirm(null);
    } else if (confirm.type === "hide") {
      runStatusChange(confirm.ids, "removed");
      setConfirm(null);
    }
  }

  const selectedIds = Array.from(selected);

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-strong bg-white py-16 text-center text-sm text-neutral-400">
        No listings match these filters.
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
            onClick={() => runStatusChange(selectedIds, "active")}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm({ type: "reject", ids: selectedIds })}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm({ type: "hide", ids: selectedIds })}
            className="rounded-lg bg-neutral-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            Hide
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm({ type: "delete", ids: selectedIds })}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      )}

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border-2 border-slate-strong bg-white">
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

        {listings.map((listing) => (
          <div key={listing.id} className="flex items-center gap-3 p-4 hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={selected.has(listing.id)}
              onChange={() => toggleOne(listing.id)}
              aria-label={`Select ${listing.title}`}
              className="size-4 shrink-0 accent-brand"
            />

            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-light text-brand/40">
              {listing.imageUrl ? (
                <Image src={listing.imageUrl} alt={listing.title} fill sizes="64px" quality={82} className="object-cover" />
              ) : (
                <ImageOff className="size-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="truncate text-sm font-bold text-neutral-800 hover:text-brand hover:underline"
                >
                  {listing.title}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    ADMIN_STATUS_STYLES[listing.status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {ADMIN_STATUS_LABELS[listing.status] ?? listing.status}
                </span>
                {listing.isExpired && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                    <AlertTriangle className="size-3" />
                    Expired
                  </span>
                )}
                {listing.isFeatured && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    Featured
                  </span>
                )}
                {listing.isBumped && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                    <TrendingUp className="size-3" />
                    Bumped
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                {currency.format(listing.price)} · {listing.location} · {listing.categoryName ?? "Uncategorized"}
                {listing.sellerName ? ` · ${listing.sellerName}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {listing.status !== "active" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runStatusChange([listing.id], "active")}
                  className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
                >
                  Approve
                </button>
              )}
              {listing.status !== "declined" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirm({ type: "reject", ids: [listing.id] })}
                  className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                >
                  Reject
                </button>
              )}
              {listing.status !== "removed" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirm({ type: "hide", ids: [listing.id] })}
                  className="rounded-lg border-2 border-slate-strong px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                >
                  Hide
                </button>
              )}
              <Link
                href={`/admin/listings/${listing.id}`}
                className="rounded-lg border-2 border-slate-strong px-2.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.type === "delete"
            ? `Delete ${confirm.ids.length} listing${confirm.ids.length > 1 ? "s" : ""}?`
            : confirm?.type === "reject"
              ? `Reject ${confirm.ids.length} listing${confirm.ids.length > 1 ? "s" : ""}?`
              : `Hide ${confirm?.ids.length ?? 0} listing${(confirm?.ids.length ?? 0) > 1 ? "s" : ""}?`
        }
        message={
          confirm?.type === "delete"
            ? "This permanently deletes the listing and its photos. This can't be undone."
            : confirm?.type === "reject"
              ? "The seller will see this listing as rejected."
              : "The listing is unpublished but not deleted — it can be restored later."
        }
        confirmLabel={confirm?.type === "delete" ? "Delete" : confirm?.type === "reject" ? "Reject" : "Hide"}
        danger={confirm?.type !== "hide"}
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
