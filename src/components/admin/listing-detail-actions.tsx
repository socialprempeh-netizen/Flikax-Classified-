"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateListingStatusAction,
  deleteListingsAction,
  updateListingCategoryAction,
  extendListingExpiryAction,
  clearFeaturedAction,
  clearBumpAction,
} from "@/app/admin/listings/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { withAuthRetry } from "@/lib/auth-retry";

type PendingConfirm = { type: "reject" | "hide" | "delete" };

export function ListingDetailActions({
  listingId,
  status,
  categoryId,
  categories,
  isFeatured,
  isBumped,
}: {
  listingId: string;
  status: string;
  categoryId: string;
  categories: { id: string; name: string }[];
  isFeatured: boolean;
  isBumped: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryId);

  function setStatus(newStatus: string) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => updateListingStatusAction([listingId], newStatus));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => deleteListingsAction([listingId]));
        router.push("/admin/listings");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed.");
        setConfirm(null);
      }
    });
  }

  function saveCategory() {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => updateListingCategoryAction(listingId, selectedCategory));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update category.");
      }
    });
  }

  function extendExpiry(days: number) {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => extendListingExpiryAction(listingId, days));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not extend expiry.");
      }
    });
  }

  function removeFeatured() {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => clearFeaturedAction(listingId));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not clear featured status.");
      }
    });
  }

  function removeBump() {
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => clearBumpAction(listingId));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not clear bump status.");
      }
    });
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.type === "delete") handleDelete();
    else if (confirm.type === "reject") {
      setStatus("declined");
      setConfirm(null);
    } else if (confirm.type === "hide") {
      setStatus("removed");
      setConfirm(null);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <h2 className="text-sm font-bold text-neutral-800">Moderation actions</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {status !== "active" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("active")}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {status !== "declined" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm({ type: "reject" })}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            Reject
          </button>
        )}
        {status !== "removed" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirm({ type: "hide" })}
            className="rounded-lg bg-neutral-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            Hide
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirm({ type: "delete" })}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Category
        </span>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending || selectedCategory === categoryId}
            onClick={saveCategory}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Expiry
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => extendExpiry(30)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            +30 days
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => extendExpiry(90)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            +90 days
          </button>
        </div>
      </div>

      {(isFeatured || isBumped) && (
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Manual overrides
          </span>
          <div className="flex flex-wrap gap-2">
            {isFeatured && (
              <button
                type="button"
                disabled={isPending}
                onClick={removeFeatured}
                className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
              >
                Remove featured
              </button>
            )}
            {isBumped && (
              <button
                type="button"
                disabled={isPending}
                onClick={removeBump}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
              >
                Remove bump
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.type === "delete" ? "Delete this listing?" : confirm?.type === "reject" ? "Reject this listing?" : "Hide this listing?"}
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
