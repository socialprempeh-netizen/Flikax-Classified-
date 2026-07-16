import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient, getUser } from "@/lib/supabase/server";
import { fetchCategoryListings, CATEGORY_PAGE_SIZE, type CategorySort } from "@/lib/category-listings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { ListingGrid } from "@/components/listing-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { CategorySearchHeader } from "@/components/category-search-header";
import { CategoryFilterRow } from "@/components/category-filter-row";
import { SiblingCategoryRow } from "@/components/sibling-category-row";

const VALID_SORTS: CategorySort[] = ["recommended", "newest", "price_asc", "price_desc"];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; q?: string; minPrice?: string; maxPrice?: string; sort?: string }>;
};

async function getLeafCategory(categorySlug: string) {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", categorySlug)
    .not("parent_id", "is", null)
    .maybeSingle();
  return category;
}

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

  const supabase = await createClient();
  const { page: pageParam, q, minPrice, maxPrice, sort: sortParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CategorySort = VALID_SORTS.includes(sortParam as CategorySort)
    ? (sortParam as CategorySort)
    : "recommended";

  const [{ data: userData }, parentCategory, { data: siblings }, { listings, totalCount }] = await Promise.all([
    getUser(),
    category.parent_id
      ? supabase
          .from("categories")
          .select("name, slug")
          .eq("id", category.parent_id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
    supabase.from("categories").select("id, name, slug, icon").eq("parent_id", category.parent_id).order("name"),
    fetchCategoryListings(supabase, {
      categoryId: category.id,
      page,
      q,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / CATEGORY_PAGE_SIZE));

  const carryParams = new URLSearchParams();
  if (q) carryParams.set("q", q);
  if (minPrice) carryParams.set("minPrice", minPrice);
  if (maxPrice) carryParams.set("maxPrice", maxPrice);
  if (sort !== "recommended") carryParams.set("sort", sort);
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
      <SiteHeader user={userData.user} />
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
          <CategoryFilterRow sort={sort} />
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
