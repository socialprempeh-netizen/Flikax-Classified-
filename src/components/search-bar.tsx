import { Search } from "lucide-react";
import { SearchLocationField } from "@/components/search-location-field";

export function SearchBar({
  defaultQuery,
  defaultLocation,
  locationCounts,
  totalListingsCount,
}: {
  defaultQuery?: string;
  defaultLocation?: string;
  locationCounts: Record<string, number>;
  totalListingsCount: number;
}) {
  return (
    <form
      role="search"
      action="/"
      method="get"
      className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-brand/20 bg-white p-1.5 shadow-[0_0_0_4px_rgba(29,161,242,0.12)] focus-within:border-brand/40 focus-within:shadow-[0_0_0_4px_rgba(29,161,242,0.2)]"
    >
      <SearchLocationField
        defaultLocation={defaultLocation}
        locationCounts={locationCounts}
        totalListingsCount={totalListingsCount}
      />

      <span className="h-6 w-px shrink-0 bg-neutral-200" />

      <input
        type="text"
        name="q"
        defaultValue={defaultQuery}
        placeholder="I am looking for..."
        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
      />

      <button
        type="submit"
        aria-label="Search"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark"
      >
        <Search className="size-4.5" />
      </button>
    </form>
  );
}
