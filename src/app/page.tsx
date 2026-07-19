import Link from "next/link";
import { unstable_cache } from "next/cache";
import { SiteHeader } from "@/components/site-header";
import { SearchBar } from "@/components/search-bar";
import { CategorySidebar } from "@/components/category-sidebar";
import { ListingGrid, type ListingCard } from "@/components/listing-grid";
import { HomepageSlider } from "@/components/homepage-slider";
import { SiteFooter } from "@/components/site-footer";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { createPublicClient } from "@/lib/supabase/public";
import { getCategories } from "@/lib/categories";
import { resolveListingImageUrl } from "@/lib/images";
import { isRecentlyBumped } from "@/lib/premium-plans";
import { getListingPath } from "@/lib/listing-url";
import { buildListingsHref, type ListingFilters } from "@/lib/filters";
import { getActiveHomepageSlides, resolveSlideImageUrl } from "@/lib/homepage-slides";

const PAGE_SIZE = 24;
const VALID_SORTS = ["recommended", "newest", "price_asc", "price_desc"];

// The route itself still opts into dynamic rendering (it reads searchParams
// for filters/sort/pagination, which is a Next.js "dynamic API" like
// cookies()), so this export doesn't make the page's HTML itself
// cacheable -- but the expensive Supabase calls below are wrapped in
// unstable_cache with this same window, which is what actually delivers
// the "results are at most 60s stale, DB isn't re-queried on every
// request" behavior in practice. See the profiling notes for why full
// route-level ISR isn't achievable here without dropping query-string
// filtering.
export const revalidate = 60;

// None of these need a signed-in viewer's session -- using the cookie-free
// public client here (rather than the auth-aware one) is what keeps this
// data fetchable via unstable_cache; a client that reads cookies() can't be
// safely shared across requests/visitors.
const getHomeCategoryCounts = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase.rpc("category_counts");
    return data ?? [];
  },
  ["home-category-counts"],
  { revalidate: 60, tags: ["listings"] }
);

const getHomeSearchResults = unstable_cache(
  async (filters: ListingFilters, page: number) => {
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
    return data ?? [];
  },
  ["home-search-listings"],
  { revalidate: 60, tags: ["listings"] }
);

const getHomeSlides = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    return getActiveHomepageSlides(supabase);
  },
  ["home-slides"],
  { revalidate: 60, tags: ["homepage-slides"] }
);

type PageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    excludeLocation?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: ListingFilters = {
    q: params.q || undefined,
    location: params.location || undefined,
    excludeLocation: params.excludeLocation || undefined,
    category: params.category || undefined,
    minPrice: params.minPrice || undefined,
    maxPrice: params.maxPrice || undefined,
    sort: VALID_SORTS.includes(params.sort ?? "") ? params.sort : undefined,
  };
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = createPublicClient();

  const [categories, countRows, results, slides] = await Promise.all([
    getCategories(),
    getHomeCategoryCounts(),
    getHomeSearchResults(filters, page),
    getHomeSlides(),
  ]);

  const counts = new Map((countRows ?? []).map((row) => [row.category_id, row.listing_count]));

  const listings: ListingCard[] = (results ?? []).map((listing) => ({
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
    imageUrl: listing.cover_image_path
      ? resolveListingImageUrl(supabase, listing.cover_image_path)
      : null,
    isFeatured: listing.is_featured,
    isBumped: isRecentlyBumped(listing.bumped_at),
    negotiable: listing.negotiable === "yes",
    createdAt: listing.created_at,
  }));

  const sliderSlides = slides.map((slide) => ({
    id: slide.id,
    imageUrl: resolveSlideImageUrl(supabase, slide.image_path),
    headline: slide.headline,
    linkUrl: slide.link_url,
  }));

  const totalCount = results?.[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 pb-16 lg:pb-0">
      <SiteHeader categories={categories} />

      <section className="bg-brand pb-10 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-5 text-center text-2xl font-bold text-white sm:text-3xl">
            Find products, cars, property & more
          </h1>
          <SearchBar defaultQuery={filters.q} defaultLocation={filters.location} />
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
        <HomepageSlider slides={sliderSlides} />
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6 lg:flex-row lg:gap-6">
        <CategorySidebar
          categories={categories ?? []}
          counts={counts}
          selectedSlug={filters.category}
          filters={filters}
        />
        <div className="flex-1">
          <ListingGrid listings={listings} variant="home" />

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
              {page > 1 && (
                <Link
                  href={buildListingsHref(filters, page - 1)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Previous
                </Link>
              )}
              <span className="text-neutral-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={buildListingsHref(filters, page + 1)}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>

      <SiteFooter />
      <BottomTabBar activeHref="/" />
    </div>
  );
}
