import Link from "next/link";

// No search-analytics tracking exists yet to derive this from real query
// volume, so this is a curated list -- deliberately scoped to terms that
// match categories/attributes actually present on Flikax (vehicles, phones,
// property, electronics, home & furniture) rather than generic filler.
const TRENDING_SEARCHES = [
  "Toyota Corolla",
  "iPhone",
  "Apartment in Accra",
  "Laptop",
  "Land Cruiser",
  "Sofa Set",
  "Generator",
];

export function TrendingSearches() {
  return (
    <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm">
      <span className="font-semibold text-white/80">Trending:</span>
      {TRENDING_SEARCHES.map((term) => (
        <Link
          key={term}
          href={`/?q=${encodeURIComponent(term)}`}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white hover:bg-white/25 sm:text-sm"
        >
          {term}
        </Link>
      ))}
    </div>
  );
}
