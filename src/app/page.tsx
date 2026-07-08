import { SiteHeader } from "@/components/site-header";
import { SearchBar } from "@/components/search-bar";
import { CategorySidebar } from "@/components/category-sidebar";
import { FilterBar } from "@/components/listings/filter-bar";
import { ListingGrid, type ListingCard } from "@/components/listing-grid";
import { SiteFooter } from "@/components/site-footer";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import type { ListingFilters } from "@/lib/filters";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: ListingFilters = {
    q: params.q || undefined,
    location: params.location || undefined,
    category: params.category || undefined,
    minPrice: params.minPrice || undefined,
    maxPrice: params.maxPrice || undefined,
  };

  const supabase = await createClient();

  const [{ data: userData }, { data: categories }, { data: countRows }, { data: results }, { data: locationRows }] =
    await Promise.all([
      getUser(),
      supabase.from("categories").select("id, name, slug, parent_id").order("name"),
      supabase.rpc("category_counts"),
      supabase.rpc("search_listings", {
        search_query: filters.q,
        category_slug: filters.category,
        location_filter: filters.location,
        min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      }),
      supabase.from("listings").select("location").eq("status", "active"),
    ]);

  const counts = new Map((countRows ?? []).map((row) => [row.category_id, row.listing_count]));

  const locationCounts: Record<string, number> = {};
  for (const row of locationRows ?? []) {
    locationCounts[row.location] = (locationCounts[row.location] ?? 0) + 1;
  }
  const totalListingsCount = locationRows?.length ?? 0;

  const listings: ListingCard[] = (results ?? []).map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    location: listing.location,
    imageUrl: listing.cover_image_path
      ? resolveListingImageUrl(supabase, listing.cover_image_path)
      : null,
    isFeatured: listing.is_featured,
    isBumped: isRecentlyBumped(listing.bumped_at),
  }));

  const selectedCategory = categories?.find((c) => c.slug === filters.category);
  const heading = selectedCategory ? selectedCategory.name : "All listings";

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={userData.user} />

      <section className="bg-brand pb-10 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-5 text-center text-2xl font-bold text-white sm:text-3xl">
            What are you looking for?
          </h1>
          <SearchBar
            defaultQuery={filters.q}
            defaultLocation={filters.location}
            locationCounts={locationCounts}
            totalListingsCount={totalListingsCount}
          />
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6">
        <CategorySidebar
          categories={categories ?? []}
          counts={counts}
          selectedSlug={filters.category}
          filters={filters}
          locationCounts={locationCounts}
          totalListingsCount={totalListingsCount}
        />
        <div className="flex-1">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">{heading}</h2>
          <FilterBar filters={filters} />
          <ListingGrid listings={listings} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
