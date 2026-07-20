import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";

/** Sticky mobile-only sub-header for a category listings page: back, search-within-category, saved listings. */
export function CategorySearchHeader({
  categoryName,
  categorySlug,
  query,
}: {
  categoryName: string;
  categorySlug: string;
  query?: string;
}) {
  return (
    <div className="sticky top-[60px] z-30 -mx-4 flex items-center gap-2 border-b border-neutral-100 bg-white px-4 py-3 sm:top-[76px] lg:hidden">
      <Link href="/" aria-label="Back to home" className="shrink-0 text-neutral-500">
        <ArrowLeft className="size-5" />
      </Link>
      <form action={`/${categorySlug}`} method="get" className="min-w-0 flex-1">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder={`Search in ${categoryName}`}
          className="w-full rounded-full border-2 border-slate-strong px-4 py-2 text-sm text-neutral-800 outline-none focus:border-brand"
        />
      </form>
      <Link href="/saved" aria-label="Saved listings" className="shrink-0 text-neutral-500">
        <Bookmark className="size-5" />
      </Link>
    </div>
  );
}
