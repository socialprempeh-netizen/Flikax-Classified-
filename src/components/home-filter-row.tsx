"use client";

import { useRouter } from "next/navigation";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function HomeFilterRow({ filters }: { filters: ListingFilters }) {
  const router = useRouter();

  return (
    <div className="mb-4 flex items-center justify-end gap-2 text-sm">
      <span className="text-neutral-400">Sort by:</span>
      <select
        value={filters.sort ?? "recommended"}
        onChange={(e) => router.push(buildListingsHref({ ...filters, sort: e.target.value }))}
        className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 outline-none focus:border-brand"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
