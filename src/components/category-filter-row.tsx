"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { CategorySort } from "@/lib/category-listings";

const PRICE_BUCKETS: { label: string; minPrice?: string; maxPrice?: string }[] = [
  { label: "Under GH₵100", maxPrice: "100" },
  { label: "GH₵100 – 500", minPrice: "100", maxPrice: "500" },
  { label: "GH₵500 – 2,000", minPrice: "500", maxPrice: "2000" },
  { label: "Over GH₵2,000", minPrice: "2000" },
];

const SORT_OPTIONS: { value: CategorySort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

function hrefWith(current: URLSearchParams, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams(current);
  params.delete("page"); // any filter change resets pagination
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export function CategoryFilterRow({ sort }: { sort: CategorySort }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeMin = searchParams.get("minPrice") ?? undefined;
  const activeMax = searchParams.get("maxPrice") ?? undefined;

  return (
    <div className="lg:hidden">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {PRICE_BUCKETS.map((bucket) => {
          const isActive = activeMin === bucket.minPrice && activeMax === bucket.maxPrice;
          return (
            <Link
              key={bucket.label}
              href={hrefWith(searchParams, { minPrice: bucket.minPrice, maxPrice: bucket.maxPrice })}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                isActive
                  ? "border-brand bg-brand-light text-brand"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {bucket.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 text-sm">
        <span className="text-neutral-400">Sort by:</span>
        <select
          value={sort}
          onChange={(e) => router.push(hrefWith(searchParams, { sort: e.target.value }))}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 outline-none focus:border-brand"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
