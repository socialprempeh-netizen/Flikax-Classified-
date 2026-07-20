import Link from "next/link";
import { getQuickFilterStyle, getBrandColor, getTypeIcon } from "@/lib/category-filters";

export function CategoryQuickFilters({
  items,
  topLevelSlug,
  attributeKey,
  activeValue,
  baseHref,
  currentQuery,
}: {
  items: { value: string; count: number }[];
  topLevelSlug: string | undefined;
  attributeKey: string;
  activeValue?: string;
  baseHref: string;
  currentQuery: URLSearchParams;
}) {
  // Not worth a filter row for a single (or no) distinct value in this category.
  if (items.length < 2) return null;

  const style = getQuickFilterStyle(topLevelSlug);

  return (
    <div className="mb-4">
      {/* Mobile: horizontal scroll, fixed-size chips (7 columns would be too cramped
          under ~400px). Desktop: a real grid sized to the item count so the row always
          fills the full width edge to edge, whether there are 2 values or 7. */}
      <div className="flex gap-3 overflow-x-auto pb-1 sm:hidden">
        {items.map((item) => (
          <QuickFilterTile
            key={item.value}
            item={item}
            style={style}
            topLevelSlug={topLevelSlug}
            attributeKey={attributeKey}
            activeValue={activeValue}
            baseHref={baseHref}
            currentQuery={currentQuery}
            className="w-24 shrink-0"
          />
        ))}
      </div>
      <div
        className="hidden gap-3 sm:grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <QuickFilterTile
            key={item.value}
            item={item}
            style={style}
            topLevelSlug={topLevelSlug}
            attributeKey={attributeKey}
            activeValue={activeValue}
            baseHref={baseHref}
            currentQuery={currentQuery}
          />
        ))}
      </div>
    </div>
  );
}

function QuickFilterTile({
  item,
  style,
  topLevelSlug,
  attributeKey,
  activeValue,
  baseHref,
  currentQuery,
  className = "",
}: {
  item: { value: string; count: number };
  style: "brand" | "type";
  topLevelSlug: string | undefined;
  attributeKey: string;
  activeValue?: string;
  baseHref: string;
  currentQuery: URLSearchParams;
  className?: string;
}) {
  const isActive = activeValue === item.value;
  const params = new URLSearchParams(currentQuery);
  params.delete("page");
  if (isActive) params.delete(`attr_${attributeKey}`);
  else params.set(`attr_${attributeKey}`, item.value);
  const qs = params.toString();

  const Icon = style === "type" ? getTypeIcon(topLevelSlug, item.value) : null;
  const brandColor = style === "brand" ? getBrandColor(item.value) : null;

  return (
    <Link
      href={qs ? `${baseHref}?${qs}` : baseHref}
      className={`flex h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 bg-white px-2 py-3 text-center transition-colors ${
        isActive ? "border-brand bg-brand-light" : "border-neutral-300 hover:border-neutral-400"
      } ${className}`}
    >
      {style === "brand" ? (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
          style={{ backgroundColor: brandColor ?? undefined }}
        >
          {item.value[0]?.toUpperCase()}
        </span>
      ) : (
        Icon && <Icon className={`size-7 shrink-0 ${isActive ? "text-brand" : "text-neutral-600"}`} />
      )}
      <span
        className={`w-full truncate text-xs font-semibold ${isActive ? "text-brand" : "text-neutral-700"}`}
      >
        {item.value}
      </span>
    </Link>
  );
}
