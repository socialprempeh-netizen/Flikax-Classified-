"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { CategorySort, DatePosted } from "@/lib/category-listings";

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

const DATE_POSTED_OPTIONS: { value: DatePosted | ""; label: string }[] = [
  { value: "", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
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

export function CategoryFilterRow({
  sort,
  datePosted,
  totalCount,
}: {
  sort: CategorySort;
  datePosted?: DatePosted;
  totalCount: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeMin = searchParams.get("minPrice") ?? undefined;
  const activeMax = searchParams.get("maxPrice") ?? undefined;

  return (
    <div>
      <div className="lg:hidden -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {PRICE_BUCKETS.map((bucket) => {
          const isActive = activeMin === bucket.minPrice && activeMax === bucket.maxPrice;
          return (
            <Link
              key={bucket.label}
              href={hrefWith(searchParams, { minPrice: bucket.minPrice, maxPrice: bucket.maxPrice })}
              className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                isActive
                  ? "border-brand bg-brand-light text-brand"
                  : "border-slate-strong text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {bucket.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 border-b border-neutral-200 pb-3 text-sm lg:mt-0 lg:border-none lg:pb-0">
        <span className="font-medium text-neutral-500">
          {totalCount.toLocaleString()} {totalCount === 1 ? "result" : "results"}
        </span>

        <div className="flex items-center gap-2">
          <select
            value={datePosted ?? ""}
            onChange={(e) => router.push(hrefWith(searchParams, { posted: e.target.value || undefined }))}
            className="rounded-lg border-2 border-slate-strong bg-white px-2 py-1.5 text-sm text-neutral-700 outline-none focus:border-brand"
          >
            {DATE_POSTED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => router.push(hrefWith(searchParams, { sort: e.target.value }))}
            className="rounded-lg border-2 border-slate-strong bg-white px-2 py-1.5 text-sm text-neutral-700 outline-none focus:border-brand"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
