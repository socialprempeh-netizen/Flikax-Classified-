"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSavedListingAction } from "@/app/listings/actions";
import { withAuthRetry } from "@/lib/auth-retry";

export function SaveListingButton({
  listingId,
  initialSaved,
}: {
  listingId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await withAuthRetry(() => toggleSavedListingAction(listingId));
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
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border disabled:opacity-60 ${
        error
          ? "border-red-200 text-red-500"
          : saved
            ? "border-brand bg-brand-light text-brand"
            : "border-neutral-200 text-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <Bookmark className={`size-4.5 ${saved ? "fill-brand" : ""}`} />
    </button>
  );
}
