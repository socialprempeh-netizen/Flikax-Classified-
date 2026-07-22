import { unstable_cache } from "next/cache";
import { SiteHeader } from "@/components/site-header";
import { SearchBar } from "@/components/search-bar";
import { TrendingSearches } from "@/components/trending-searches";
import { CategorySidebar } from "@/components/category-sidebar";
import { InfiniteListingGrid } from "@/components/infinite-listing-grid";
import { HomepageSlider } from "@/components/homepage-slider";
import { SiteFooter } from "@/components/site-footer";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { createPublicClient } from "@/lib/supabase/public";
import { getCategories } from "@/lib/categories";
import { fetchHomeListings } from "@/lib/home-listings";
import type { ListingFilters } from "@/lib/filters";
import { getActiveHomepageSlides, resolveSlideImageUrl } from "@/lib/homepage-slides";
import { fetchTrendingTerms } from "@/lib/trending";
import { loadMoreHomeListingsAction } from "@/app/actions";

// Homepage infinite scroll stops here (4 batches of PAGE_SIZE) rather than
// scrolling through the whole catalog -- category pages have no such cap.
const HOME_MAX_LISTINGS = 96;

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

const getHomeSearchResults = unstable_cache(fetchHomeListings, ["home-search-listings"], {
  revalidate: 60,
  tags: ["listings"],
});

const getHomeSlides = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    return getActiveHomepageSlides(supabase);
  },
  ["home-slides"],
  { revalidate: 60, tags: ["homepage-slides"] }
);

const getTrendingTerms = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    return fetchTrendingTerms(supabase);
  },
  ["home-trending-terms"],
  { revalidate: 300, tags: ["listings"] }
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

  const supabase = createPublicClient();

  const [categories, countRows, { listings, totalCount }, slides, trendingTerms] = await Promise.all([
    getCategories(),
    getHomeCategoryCounts(),
    getHomeSearchResults(filters, 1),
    getHomeSlides(),
    getTrendingTerms(),
  ]);

  const counts = new Map((countRows ?? []).map((row) => [row.category_id, row.listing_count]));

  const sliderSlides = slides.map((slide) => ({
    id: slide.id,
    imageUrl: resolveSlideImageUrl(supabase, slide.image_path),
    headline: slide.headline,
    linkUrl: slide.link_url,
  }));

  return (
    <div className="flex flex-1 flex-col bg-background pb-16 lg:pb-0">
      <SiteHeader categories={categories} />

      <section className="bg-brand pb-6 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-5 text-center text-lg font-bold text-white sm:text-xl">
            Explore Thousands of New Listings
          </h1>
          <SearchBar defaultQuery={filters.q} defaultLocation={filters.location} />
          <TrendingSearches terms={trendingTerms} />
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6">
        <HomepageSlider slides={sliderSlides} />
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-6 pt-3 sm:px-6 lg:flex-row lg:gap-4">
        <CategorySidebar
          categories={categories ?? []}
          counts={counts}
          selectedSlug={filters.category}
          filters={filters}
        />
        <div className="flex-1">
          <InfiniteListingGrid
            initialListings={listings}
            initialTotalCount={totalCount}
            variant="home"
            loadMore={loadMoreHomeListingsAction.bind(null, filters)}
            maxItems={HOME_MAX_LISTINGS}
          />
        </div>
      </main>

      <SiteFooter />
      <BottomTabBar activeHref="/" />
    </div>
  );
}
