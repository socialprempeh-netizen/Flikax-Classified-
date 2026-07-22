import Link from "next/link";

/** `terms` is derived from real listing view activity (see fetchTrendingTerms
 * in lib/trending.ts) -- not a curated/hardcoded list. Renders nothing if
 * there isn't enough activity yet to populate it. */
export function TrendingSearches({ terms }: { terms: string[] }) {
  if (terms.length === 0) return null;

  return (
    <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 text-xs">
      <span className="font-semibold text-white/80">Trending:</span>
      {terms.map((term) => (
        <Link
          key={term}
          href={`/?q=${encodeURIComponent(term)}`}
          className="rounded-full bg-white/15 px-2.5 py-0.5 font-medium text-white hover:bg-white/25"
        >
          {term}
        </Link>
      ))}
    </div>
  );
}
