"use server";

import { fetchHomeListings } from "@/lib/home-listings";
import type { ListingFilters } from "@/lib/filters";

// Deliberately uncached (unlike the homepage's initial SSR fetch) -- infinite
// scroll pages are a much lower-traffic, per-visitor fetch than the first
// page every visitor hits, so the shared-cache win doesn't apply the same way.
export async function loadMoreHomeListingsAction(filters: ListingFilters, page: number) {
  return fetchHomeListings(filters, page);
}
