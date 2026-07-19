import Link from "next/link";
import { CategoryThumb } from "@/components/category-thumb";

export type SiblingCategory = { id: string; name: string; slug: string; icon?: string | null };

/** Quick lateral nav between sibling categories (children of the same parent) -- every
 * category in this app is exactly two levels deep, so a leaf page has no children of its
 * own to show here; these are its siblings instead. */
export function SiblingCategoryRow({
  siblings,
  activeSlug,
}: {
  siblings: SiblingCategory[];
  activeSlug: string;
}) {
  if (siblings.length === 0) return null;

  return (
    <div className="lg:hidden -mx-4 mb-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {siblings.map((sibling) => {
        const isActive = sibling.slug === activeSlug;
        return (
          <Link key={sibling.id} href={`/${sibling.slug}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <CategoryThumb
              // Siblings are always subcategories (every category is exactly
              // two levels deep) -- a non-null placeholder is enough to
              // resolve the subcategory branch without plumbing the real
              // parent_id through this lightweight prop shape.
              category={{ ...sibling, parent_id: "sibling" }}
              size="size-12"
              iconSize="size-5"
              sizes="48px"
              eager
              className={isActive ? "ring-2 ring-brand ring-offset-1" : ""}
            />
            <span
              className={`line-clamp-2 text-center text-[11px] leading-tight ${
                isActive ? "font-bold text-brand" : "font-medium text-neutral-600"
              }`}
            >
              {sibling.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
