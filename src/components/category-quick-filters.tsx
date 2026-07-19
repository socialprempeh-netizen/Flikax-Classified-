import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function CategoryQuickFilters({
  items,
  icon: Icon,
  attributeKey,
  activeValue,
  baseHref,
  currentQuery,
}: {
  items: { value: string; count: number }[];
  icon: LucideIcon;
  attributeKey: string;
  activeValue?: string;
  baseHref: string;
  currentQuery: URLSearchParams;
}) {
  // Not worth a filter row for a single (or no) distinct value in this category.
  if (items.length < 2) return null;

  return (
    <div className="mb-4 flex gap-3 overflow-x-auto pb-1">
      {items.map((item) => {
        const isActive = activeValue === item.value;
        const params = new URLSearchParams(currentQuery);
        params.delete("page");
        if (isActive) params.delete(`attr_${attributeKey}`);
        else params.set(`attr_${attributeKey}`, item.value);
        const qs = params.toString();

        return (
          <Link
            key={item.value}
            href={qs ? `${baseHref}?${qs}` : baseHref}
            className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-center transition-colors ${
              isActive
                ? "border-brand bg-brand-light text-brand"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            }`}
          >
            <Icon className="size-5" />
            <span className="whitespace-nowrap text-xs font-semibold">{item.value}</span>
          </Link>
        );
      })}
    </div>
  );
}
