"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LocationPickerModal } from "@/components/location-picker-modal";

export function SearchLocationField({
  defaultLocation,
  locationCounts,
  totalListingsCount,
}: {
  defaultLocation?: string;
  locationCounts: Record<string, number>;
  totalListingsCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(defaultLocation);

  return (
    <>
      <input type="hidden" name="location" value={location ?? ""} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex shrink-0 items-center rounded-full bg-transparent py-2 pl-4 pr-7 text-base font-medium text-neutral-700 outline-none"
      >
        {location || "All Ghana"}
        <ChevronDown className="pointer-events-none absolute right-2 size-4 text-neutral-500" />
      </button>

      <LocationPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(name) => setLocation(name)}
        locationCounts={locationCounts}
        totalListingsCount={totalListingsCount}
      />
    </>
  );
}
