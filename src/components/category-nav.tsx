"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Car,
  Home,
  Smartphone,
  Laptop,
  Sofa,
  Shirt,
  Sparkles,
  Wrench,
  Hammer,
  Briefcase,
  Dumbbell,
  Baby,
  ShoppingBasket,
  PawPrint,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import type { Category } from "@/components/category-sidebar";

const ICONS: Record<string, LucideIcon> = {
  vehicles: Car,
  property: Home,
  "phones-tablets": Smartphone,
  electronics: Laptop,
  "home-furniture-appliances": Sofa,
  fashion: Shirt,
  "beauty-personal-care": Sparkles,
  services: Wrench,
  "repair-construction": Hammer,
  "commercial-equipment-tools": Briefcase,
  "leisure-activities": Dumbbell,
  "babies-kids": Baby,
  "food-agriculture-farming": ShoppingBasket,
  "animals-pets": PawPrint,
};

export function CategoryNav({
  parents,
  categories,
  counts,
  filters,
}: {
  parents: Category[];
  categories: Category[];
  counts: Map<string, number>;
  filters: ListingFilters;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function totalFor(parent: Category) {
    const ownCount = counts.get(parent.id) ?? 0;
    const childCount = categories
      .filter((c) => c.parent_id === parent.id)
      .reduce((sum, child) => sum + (counts.get(child.id) ?? 0), 0);
    return ownCount + childCount;
  }

  return (
    <nav className="relative w-full shrink-0 divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-white shadow-sm sm:w-72">
      {parents.map((cat) => {
        const Icon = ICONS[cat.slug] ?? Car;
        const children = categories.filter((c) => c.parent_id === cat.id);
        const isHovered = hoveredId === cat.id;

        return (
          <div
            key={cat.id}
            className="relative"
            onMouseEnter={() => setHoveredId(cat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Link
              href={buildListingsHref({ ...filters, category: cat.slug })}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-brand-light ${
                isHovered ? "bg-brand-light" : ""
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-neutral-800">
                  {cat.name}
                </span>
                <span className="block text-xs text-neutral-500">{totalFor(cat)} ads</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-neutral-400" />
            </Link>

            {isHovered && children.length > 0 && (
              <div className="absolute left-full top-0 z-40 ml-2 w-80 rounded-xl border border-neutral-100 bg-white p-3 shadow-lg">
                <div className="grid grid-cols-2 gap-1">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={buildListingsHref({ ...filters, category: child.slug })}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-neutral-50"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-neutral-800">
                          {child.name}
                        </span>
                        <span className="block text-[10px] text-neutral-400">
                          {counts.get(child.id) ?? 0} ads
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
