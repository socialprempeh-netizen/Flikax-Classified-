"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSavedListingAction } from "@/app/listings/actions";
import { withAuthRetry } from "@/lib/auth-retry";
import { useSavedListingIds } from "@/lib/use-saved-listing-ids";

export function SaveListingButton({ listingId }: { listingId: string }) {
  const savedIds = useSavedListingIds();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // See CompactSaveButton for why this guard exists.
  const [hasToggled, setHasToggled] = useState(false);

  useEffect(() => {
    if (!hasToggled) setSaved(savedIds.has(listingId));
  }, [savedIds, listingId, hasToggled]);

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await withAuthRetry(() => toggleSavedListingAction(listingId));
        setHasToggled(true);
        setSaved(result.saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save this listing.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      aria-pressed={saved}
      title={error ?? undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold disabled:opacity-60 ${
        error
          ? "border-red-200 text-red-500"
          : saved
            ? "border-brand bg-brand-light text-brand"
            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      <Bookmark className={`size-4 ${saved ? "fill-brand" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
