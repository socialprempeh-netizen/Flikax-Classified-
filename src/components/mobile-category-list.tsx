"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Category } from "@/components/category-sidebar";
import { CategoryThumb } from "@/components/category-thumb";

// Every category in this app is exactly two levels deep (verified: no leaf
// category ever has children of its own), so a click here always means
// "show me that category's results" -- it links straight to the dedicated
// /[category] page, not a homepage ?category= filter. That distinction
// matters specifically on mobile: this list renders above the listings
// grid in the stacked layout, so a query-param link that just re-filters
// the homepage produces zero visible change without scrolling past the
// whole category/location/price stack -- indistinguishable from the tap
// not having worked at all.
export function MobileCategoryList({ categories, counts }: { categories: Category[]; counts: Map<string, number> }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = normalized ? categories.filter((c) => c.name.toLowerCase().includes(normalized)) : categories;

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="sticky top-[60px] z-10 border-b border-neutral-100 bg-white px-4 py-2.5 sm:top-[76px]">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
          <Search className="size-4 shrink-0 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find category..."
            className="w-full min-w-0 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="divide-y divide-neutral-100 px-4">
        {filtered.map((child) => {
          return (
            <Link key={child.id} href={`/${child.slug}`} className="flex items-center gap-3 py-2">
              <CategoryThumb category={child} size="size-11" iconSize="size-5" sizes="44px" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-neutral-800">{child.name}</span>
                <span className="block text-xs text-neutral-400">{counts.get(child.id) ?? 0} ads</span>
              </span>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">No categories match &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}
