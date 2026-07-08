export type ListingFilters = {
  q?: string;
  location?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
};

export function buildListingsHref(filters: ListingFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.location) params.set("location", filters.location);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
