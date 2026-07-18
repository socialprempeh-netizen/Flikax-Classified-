"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSavedListingAction } from "@/app/listings/actions";
import { withAuthRetry } from "@/lib/auth-retry";
import { useSavedListingIds } from "@/lib/use-saved-listing-ids";

/** Icon-only save button for a grid card overlay -- same real toggle action as
 * SaveListingButton, just a compact circular variant instead of a labeled pill. */
export function CompactSaveButton({ listingId }: { listingId: string }) {
  const savedIds = useSavedListingIds();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Once the user has toggled locally, the initial fetch's result is stale
  // by definition (it was already in flight before the toggle) -- letting
  // it still apply after the fact would flip the button back to whatever
  // it said before the click actually landed.
  const [hasToggled, setHasToggled] = useState(false);

  useEffect(() => {
    if (!hasToggled) setSaved(savedIds.has(listingId));
  }, [savedIds, listingId, hasToggled]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const result = await withAuthRetry(() => toggleSavedListingAction(listingId));
        setHasToggled(true);
        setSaved(result.saved);
      } catch {
        // Silently ignored here -- this is a small overlay control with no room
        // for an error message; SaveListingButton on the detail page surfaces it.
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
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white disabled:opacity-60"
    >
      <Heart className={`size-4 ${saved ? "fill-brand text-brand" : "text-neutral-500"}`} />
    </button>
  );
}
