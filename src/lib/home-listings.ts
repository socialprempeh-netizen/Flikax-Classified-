import { createPublicClient } from "@/lib/supabase/public";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getListingPath } from "@/lib/listing-url";
import type { ListingFilters } from "@/lib/filters";
import type { ListingCard } from "@/components/listing-grid";

// Shared by the homepage's initial (cached) server render and the
// uncached "load more" server action used for infinite scroll -- both
// need the exact same RPC-row-to-ListingCard mapping.
export async function fetchHomeListings(
  filters: ListingFilters,
  page: number
): Promise<{ listings: ListingCard[]; totalCount: number }> {
  const supabase = createPublicClient();
  const { data } = await supabase.rpc("search_listings", {
    search_query: filters.q,
    category_slug: filters.category,
    location_filter: filters.location,
    exclude_location: filters.excludeLocation,
    min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
    max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    p_page: page,
    sort: filters.sort,
  });

  const rows = data ?? [];
  const listings: ListingCard[] = rows.map((listing) => ({
    id: listing.id,
    href: getListingPath({
      title: listing.title,
      location: listing.location,
      short_id: listing.short_id,
      categorySlug: listing.category_slug,
    }),
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    imageUrl: listing.cover_image_path ? resolveListingImageUrl(supabase, listing.cover_image_path) : null,
    isFeatured: listing.is_featured,
    isBumped: isRecentlyBumped(listing.bumped_at),
    negotiable: listing.negotiable === "yes",
    createdAt: listing.created_at,
  }));

  const totalCount = rows[0]?.total_count ?? 0;
  return { listings, totalCount };
}
