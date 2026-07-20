import Link from "next/link";

// No search-analytics tracking exists yet to derive this from real query
// volume, so this is a curated list -- deliberately scoped to terms that
// match categories/attributes actually present on Flikax (vehicles, phones,
// property, electronics, home & furniture) rather than generic filler.
const TRENDING_SEARCHES = ["Toyota Corolla", "iPhone", "Apartment in Accra", "Laptop", "Land Cruiser"];

export function TrendingSearches() {
  return (
    <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 text-xs">
      <span className="font-semibold text-white/80">Trending:</span>
      {TRENDING_SEARCHES.map((term) => (
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
