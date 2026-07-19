import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchCategoryListings, CATEGORY_PAGE_SIZE, type CategorySort, type DatePosted } from "@/lib/category-listings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { ListingGrid } from "@/components/listing-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { CategorySearchHeader } from "@/components/category-search-header";
import { CategoryFilterRow } from "@/components/category-filter-row";
import { SiblingCategoryRow } from "@/components/sibling-category-row";

const VALID_SORTS: CategorySort[] = ["recommended", "newest", "price_asc", "price_desc"];
const VALID_DATE_POSTED: DatePosted[] = ["24h", "7d", "30d"];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Same caveat as the homepage: this route reads searchParams (q/sort/page),
// which forces it dynamic regardless of this export -- the actual "results
// no more than 60s stale, DB not re-queried every request" behavior comes
// from the unstable_cache wrapping below.
export const revalidate = 60;

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    posted?: string;
  }>;
};

const getLeafCategory = unstable_cache(
  async (categorySlug: string) => {
    const supabase = createPublicClient();
    const { data: category } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("slug", categorySlug)
      .not("parent_id", "is", null)
      .maybeSingle();
    return category;
  },
  ["leaf-category"],
  { revalidate: 300, tags: ["categories"] }
);

// The category-page equivalent of the homepage's getHomeSearchResults --
// same reasoning: fetchCategoryListings itself takes a live Supabase client,
// which isn't something unstable_cache can use as part of a cache key, so
// this wraps it with only the plain filter values as arguments.
const getCachedCategoryListings = unstable_cache(
  async (filter: Parameters<typeof fetchCategoryListings>[1]) => {
    const supabase = createPublicClient();
    return fetchCategoryListings(supabase, filter);
  },
  ["category-listings"],
  { revalidate: 60, tags: ["listings"] }
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getLeafCategory(categorySlug);
  if (!category) return {};

  const title = `${category.name} for Sale in Ghana | Flikax`;
  const description = `Browse ${category.name} listings across Ghana on Flikax — Ghana's classifieds marketplace.`;

  return {
    title,
    description,
    alternates: { canonical: `/${categorySlug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug } = await params;
  const category = await getLeafCategory(categorySlug);
  if (!category) notFound();

  const supabase = createPublicClient();
  const { page: pageParam, q, minPrice, maxPrice, sort: sortParam, posted } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CategorySort = VALID_SORTS.includes(sortParam as CategorySort)
    ? (sortParam as CategorySort)
    : "recommended";
  const datePosted: DatePosted | undefined = VALID_DATE_POSTED.includes(posted as DatePosted)
    ? (posted as DatePosted)
    : undefined;

  const [parentCategory, { data: siblings }, { listings, totalCount }] = await Promise.all([
    category.parent_id
      ? supabase
          .from("categories")
          .select("name, slug")
          .eq("id", category.parent_id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
    supabase.from("categories").select("id, name, slug, icon").eq("parent_id", category.parent_id).order("name"),
    getCachedCategoryListings({
      categoryId: category.id,
      page,
      q,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      datePosted,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / CATEGORY_PAGE_SIZE));

  const carryParams = new URLSearchParams();
  if (q) carryParams.set("q", q);
  if (minPrice) carryParams.set("minPrice", minPrice);
  if (maxPrice) carryParams.set("maxPrice", maxPrice);
  if (sort !== "recommended") carryParams.set("sort", sort);
  if (datePosted) carryParams.set("posted", datePosted);
  function pageHref(targetPage: number) {
    const params = new URLSearchParams(carryParams);
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  }

  const breadcrumbItems = [
    { name: "Home", item: SITE_URL },
    ...(parentCategory ? [{ name: parentCategory.name, item: `${SITE_URL}/${parentCategory.slug}` }] : []),
    { name: category.name, item: `${SITE_URL}/${category.slug}` },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 pb-16 lg:pb-0">
      <JsonLd data={breadcrumbJsonLd} />
      <SiteHeader />
      <CategorySearchHeader categoryName={category.name} categorySlug={category.slug} query={q} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 hidden flex-wrap items-center gap-1 text-sm text-neutral-500 lg:flex">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          {parentCategory && (
            <>
              <span>/</span>
              <Link href={`/${parentCategory.slug}`} className="hover:text-brand">
                {parentCategory.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-neutral-700">{category.name}</span>
        </div>

        <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">
          {category.name} for Sale in Ghana
        </h1>

        <SiblingCategoryRow siblings={siblings ?? []} activeSlug={category.slug} />

        <div className="mb-4">
          <CategoryFilterRow sort={sort} datePosted={datePosted} totalCount={totalCount} />
        </div>

        <ListingGrid listings={listings} />

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
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
                href={pageHref(page + 1)}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </main>
      <SiteFooter />
      <BottomTabBar activeHref={`/${category.slug}`} />
    </div>
  );
}
