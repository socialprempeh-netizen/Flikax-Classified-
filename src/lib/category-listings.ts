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

export type CategorySort = "recommended" | "newest" | "price_asc" | "price_desc";

type CategoryListingsFilter = {
  categoryId: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: CategorySort;
  page?: number;
};

export async function fetchCategoryListings(
  supabase: SupabaseClient<Database>,
  { categoryId, location, minPrice, maxPrice, q, sort = "recommended", page = 1 }: CategoryListingsFilter
): Promise<{ listings: ListingCard[]; totalCount: number }> {
  let query = supabase
    .from("listings")
    .select(
      "id, title, description, price, location, is_featured, featured_until, bumped_at, short_id, listing_images(storage_path, position), categories(slug)",
      { count: "exact" }
    )
    .eq("category_id", categoryId)
    .eq("status", "active");

  if (location) query = query.eq("location", location);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  // A plain ilike is enough for "narrow this category by keyword" -- unlike
  // the homepage's search_listings RPC, this isn't cross-category fuzzy
  // search, just a title filter on top of a category the user already
  // picked, so it doesn't need word_similarity ranking.
  if (q) query = query.ilike("title", `%${q}%`);

  // "Recommended" keeps the featured/bumped-first ordering; the other three
  // sorts are what a user explicitly picked, so they override it entirely
  // rather than layering underneath.
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query
      .order("is_featured", { ascending: false })
      .order("bumped_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  }

  const from = (page - 1) * CATEGORY_PAGE_SIZE;
  const { data, count } = await query.range(from, from + CATEGORY_PAGE_SIZE - 1);

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
      description: row.description,
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
