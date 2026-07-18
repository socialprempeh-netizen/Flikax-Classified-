import Link from "next/link";
import { Plus } from "lucide-react";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import type { Category } from "@/components/category-sidebar";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { getTopLevelColorClasses } from "@/lib/category-colors";

export function MobileCategoryGrid({
  parents,
  filters,
}: {
  parents: Category[];
  filters: ListingFilters;
}) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-3 md:grid-cols-4">
      <Link
        href="/sell"
        className="flex min-h-16 flex-col items-center justify-start gap-1.5 text-center"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
          <Plus className="size-6" />
        </span>
        <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-neutral-800">
          Post an Ad
        </span>
      </Link>

      {parents.map((cat) => {
        const Icon = resolveCategoryIcon(cat);
        return (
          <Link
            key={cat.id}
            href={buildListingsHref({ ...filters, category: cat.slug })}
            className="flex min-h-16 flex-col items-center justify-start gap-1.5 text-center"
          >
            <span
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${getTopLevelColorClasses(cat.slug)}`}
            >
              <Icon className="size-6" />
            </span>
            <span className="line-clamp-2 text-[13px] font-medium leading-tight text-neutral-700">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
