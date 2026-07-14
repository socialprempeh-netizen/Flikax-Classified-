import Link from "next/link";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import { LocationPicker } from "@/components/location-picker";
import { ExcludeLocationPicker } from "@/components/exclude-location-picker";
import { CategoryNav } from "@/components/category-nav";

// Featured categories are pinned first in the sidebar; the rest keep their existing order.
const FEATURED_SLUGS = ["phones-tablets", "vehicles", "property"];

const PRICE_BUCKETS: { label: string; minPrice?: string; maxPrice?: string }[] = [
  { label: "Under GH₵100", maxPrice: "100" },
  { label: "GH₵100 – 500", minPrice: "100", maxPrice: "500" },
  { label: "GH₵500 – 2,000", minPrice: "500", maxPrice: "2000" },
  { label: "GH₵2,000 – 10,000", minPrice: "2000", maxPrice: "10000" },
  { label: "Over GH₵10,000", minPrice: "10000" },
];

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon?: string | null;
};

export function CategorySidebar({
  categories,
  counts,
  selectedSlug,
  filters,
  locationCounts,
  totalListingsCount,
}: {
  categories: Category[];
  counts: Map<string, number>;
  selectedSlug?: string;
  filters: ListingFilters;
  locationCounts: Record<string, number>;
  totalListingsCount: number;
}) {
  const parents = [...categories.filter((c) => c.parent_id === null)].sort((a, b) => {
    const aIndex = FEATURED_SLUGS.indexOf(a.slug);
    const bIndex = FEATURED_SLUGS.indexOf(b.slug);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  const selected = categories.find((c) => c.slug === selectedSlug);
  const activeParent = selected
    ? selected.parent_id
      ? categories.find((c) => c.id === selected.parent_id)
      : selected
    : undefined;

  if (!activeParent) {
    return (
      <CategoryNav parents={parents} categories={categories} counts={counts} filters={filters} />
    );
  }

  const children = categories.filter((c) => c.parent_id === activeParent.id);

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 sm:w-72">
      <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-neutral-800">Categories</h3>
        <Link
          href={buildListingsHref({ ...filters, category: undefined })}
          className="mb-1 block text-xs font-medium text-neutral-500 hover:text-brand"
        >
          All categories
        </Link>
        <p className="mb-2 truncate text-sm font-semibold text-brand">{activeParent.name}</p>
        <div className="flex flex-col gap-1">
          {children.map((child) => {
            const isActive = child.slug === selectedSlug;
            return (
              <Link
                key={child.id}
                href={buildListingsHref({ ...filters, category: isActive ? activeParent.slug : child.slug })}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                  isActive ? "bg-brand-light font-semibold text-brand" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <span className="truncate">{child.name}</span>
                <span className="ml-2 shrink-0 text-xs text-neutral-400">{counts.get(child.id) ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-white shadow-sm">
        <LocationPicker
          filters={filters}
          locationCounts={locationCounts}
          totalListingsCount={totalListingsCount}
        />
        <ExcludeLocationPicker
          filters={filters}
          locationCounts={locationCounts}
          totalListingsCount={totalListingsCount}
        />
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-neutral-800">Price, GH₵</h3>
        <form action="/" method="get" className="mb-3 flex items-center gap-2">
          <input type="hidden" name="q" value={filters.q ?? ""} />
          <input type="hidden" name="location" value={filters.location ?? ""} />
          <input type="hidden" name="category" value={filters.category ?? ""} />
          <input
            type="number"
            name="minPrice"
            placeholder="min"
            defaultValue={filters.minPrice}
            className="w-full min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <span className="shrink-0 text-neutral-400">–</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="max"
            defaultValue={filters.maxPrice}
            className="w-full min-w-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Go
          </button>
        </form>

        <div className="flex flex-col gap-1">
          {PRICE_BUCKETS.map((bucket) => {
            const isActive = filters.minPrice === bucket.minPrice && filters.maxPrice === bucket.maxPrice;
            return (
              <Link
                key={bucket.label}
                href={buildListingsHref({ ...filters, minPrice: bucket.minPrice, maxPrice: bucket.maxPrice })}
                className={`rounded-md px-2 py-1.5 text-sm ${
                  isActive ? "bg-brand-light font-semibold text-brand" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {bucket.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
