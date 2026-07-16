"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSavedListingAction } from "@/app/listings/actions";
import { withAuthRetry } from "@/lib/auth-retry";

/** Icon-only save button for a grid card overlay -- same real toggle action as
 * SaveListingButton, just a compact circular variant instead of a labeled pill. */
export function CompactSaveButton({ listingId, initialSaved }: { listingId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const result = await withAuthRetry(() => toggleSavedListingAction(listingId));
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
