"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSavedListingAction } from "@/app/listings/actions";

export function SaveListingButton({
  listingId,
  initialSaved,
}: {
  listingId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await toggleSavedListingAction(listingId);
      setSaved(result.saved);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      aria-pressed={saved}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border disabled:opacity-60 ${
        saved
          ? "border-brand bg-brand-light text-brand"
          : "border-neutral-200 text-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <Bookmark className={`size-4.5 ${saved ? "fill-brand" : ""}`} />
    </button>
  );
}
