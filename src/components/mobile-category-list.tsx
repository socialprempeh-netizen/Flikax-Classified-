"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import type { Category } from "@/components/category-sidebar";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { getCategoryColor } from "@/lib/category-colors";

export function MobileCategoryList({
  categories,
  counts,
  filters,
  selectedSlug,
  activeParentSlug,
}: {
  categories: Category[];
  counts: Map<string, number>;
  filters: ListingFilters;
  selectedSlug?: string;
  activeParentSlug: string;
}) {
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
        {filtered.map((child, index) => {
          const Icon = resolveCategoryIcon(child);
          const isActive = child.slug === selectedSlug;
          return (
            <Link
              key={child.id}
              href={buildListingsHref({ ...filters, category: isActive ? activeParentSlug : child.slug })}
              className="flex items-center gap-3 py-3"
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${getCategoryColor(index)}`}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm ${isActive ? "font-bold text-brand" : "font-semibold text-neutral-800"}`}
                >
                  {child.name}
                </span>
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
