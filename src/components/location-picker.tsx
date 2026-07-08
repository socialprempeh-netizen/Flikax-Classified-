"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import { LocationPickerModal } from "@/components/location-picker-modal";

export function LocationPicker({
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-neutral-800"
      >
        <span>Location</span>
        <span className="flex items-center gap-1 text-sm font-normal text-neutral-500">
          {filters.location || "All Ghana"}
          <ChevronRight className="size-4" />
        </span>
      </button>

      <LocationPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(name) => router.push(buildListingsHref({ ...filters, location: name }))}
        locationCounts={locationCounts}
        totalListingsCount={totalListingsCount}
      />
    </>
  );
}
