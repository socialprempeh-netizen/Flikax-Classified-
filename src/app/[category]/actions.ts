"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { fetchCategoryListings, type AttributeFilter, type CategorySort, type DatePosted } from "@/lib/category-listings";

// Shared by the plain category grid and the category+location SEO page --
// `location` is simply omitted for the former. Deliberately uncached, same
// reasoning as the homepage's load-more action.
export async function loadMoreCategoryListingsAction(
  filter: {
    categoryId: string;
    location?: string;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: CategorySort;
    datePosted?: DatePosted;
    attributeFilters?: AttributeFilter[];
  },
  page: number
) {
  const supabase = createPublicClient();
  return fetchCategoryListings(supabase, { ...filter, page });
}
