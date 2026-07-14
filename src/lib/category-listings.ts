import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getListingPath } from "@/lib/listing-url";
import type { ListingCard } from "@/components/listing-grid";

export const CATEGORY_PAGE_SIZE = 24;

/** Below this, a category+location combo is thin content — rendered (with a
 * friendly empty state) but kept out of the sitemap and marked noindex. */
export const MIN_INDEXABLE_LISTINGS = 3;

type CategoryListingsFilter = { categoryId: string; location?: string; page?: number };

export async function fetchCategoryListings(
  supabase: SupabaseClient<Database>,
  { categoryId, location, page = 1 }: CategoryListingsFilter
): Promise<{ listings: ListingCard[]; totalCount: number }> {
  let query = supabase
    .from("listings")
    .select(
      "id, title, price, location, is_featured, featured_until, bumped_at, short_id, listing_images(storage_path, position), categories(slug)",
      { count: "exact" }
    )
    .eq("category_id", categoryId)
    .eq("status", "active");

  if (location) query = query.eq("location", location);

  const from = (page - 1) * CATEGORY_PAGE_SIZE;
  const { data, count } = await query
    .order("is_featured", { ascending: false })
    .order("bumped_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, from + CATEGORY_PAGE_SIZE - 1);

  const now = Date.now();
  const listings: ListingCard[] = (data ?? []).map((row) => {
    const cover = [...(row.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      href: getListingPath({
        title: row.title,
        location: row.location,
        short_id: row.short_id,
        categorySlug: row.categories?.slug ?? "listing",
      }),
      title: row.title,
      price: row.price,
      location: row.location,
      imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
      isFeatured: row.is_featured && (row.featured_until ? new Date(row.featured_until).getTime() > now : false),
      isBumped: isRecentlyBumped(row.bumped_at),
    };
  });

  return { listings, totalCount: count ?? 0 };
}

/** Cheap head-only count, for generateMetadata's noindex decision — doesn't need row data. */
export async function countCategoryListings(
  supabase: SupabaseClient<Database>,
  categoryId: string,
  location?: string
): Promise<number> {
  let query = supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("status", "active");

  if (location) query = query.eq("location", location);

  const { count } = await query;
  return count ?? 0;
}
