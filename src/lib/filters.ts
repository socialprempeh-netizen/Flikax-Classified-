export type ListingFilters = {
  q?: string;
  location?: string;
  excludeLocation?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

// `page` is intentionally not part of ListingFilters itself — every existing
// call site does `buildListingsHref({ ...filters, category: x })` etc., and
// changing any filter should reset back to page 1, not carry the current
// page number along. The pagination nav is the only caller that passes it,
// as an explicit extra argument rather than a persisted filter.
export function buildListingsHref(filters: ListingFilters, page?: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.location) params.set("location", filters.location);
  if (filters.excludeLocation) params.set("excludeLocation", filters.excludeLocation);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.sort && filters.sort !== "recommended") params.set("sort", filters.sort);
  if (page && page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
