"use client";

import { useState, useTransition } from "react";
import { CircleOff } from "lucide-react";
import { markListingUnavailableAction } from "@/app/listings/actions";
import { withAuthRetry } from "@/lib/auth-retry";

export function MarkUnavailableButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm("Mark this listing as unavailable? Buyers will no longer be able to see it.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await withAuthRetry(() => markListingUnavailableAction(listingId));
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update this listing.");
      }
    });
  }

  if (done) {
    return <p className="text-center text-sm font-medium text-neutral-500">Listing marked unavailable.</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
      >
        <CircleOff className="size-4" />
        {isPending ? "Updating..." : "Mark unavailable"}
      </button>
      {error && <p className="mt-1 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
