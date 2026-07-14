"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import { LocationPickerModal } from "@/components/location-picker-modal";

export function ExcludeLocationPicker({
  filters,
  locationCounts,
  totalListingsCount,
}: {
  filters: ListingFilters;
  locationCounts: Record<string, number>;
  totalListingsCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-neutral-800">
        <button type="button" onClick={() => setOpen(true)} className="text-left">
          Hide a location
        </button>
        {filters.excludeLocation ? (
          <span className="flex items-center gap-1.5 text-sm font-normal text-neutral-500">
            Hiding: {filters.excludeLocation}
            <button
              type="button"
              onClick={() => router.push(buildListingsHref({ ...filters, excludeLocation: undefined }))}
              aria-label="Clear hidden location"
              className="rounded-full p-0.5 hover:bg-neutral-100"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-sm font-normal text-neutral-500"
          >
            None
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>

      <LocationPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(name) => router.push(buildListingsHref({ ...filters, excludeLocation: name }))}
        locationCounts={locationCounts}
        totalListingsCount={totalListingsCount}
      />
    </>
  );
}
