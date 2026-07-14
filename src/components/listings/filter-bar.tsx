import Link from "next/link";
import { X } from "lucide-react";
import type { ListingFilters } from "@/lib/filters";

export function FilterBar({ filters }: { filters: ListingFilters }) {
  const hasFilters = Boolean(
    filters.q ||
      filters.location ||
      filters.excludeLocation ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice
  );

  if (!hasFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Link href="/" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-brand">
        <X className="size-3.5" />
        Clear filters
      </Link>
    </div>
  );
}
