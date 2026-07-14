import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient, getUser } from "@/lib/supabase/server";
import { fetchCategoryListings, CATEGORY_PAGE_SIZE } from "@/lib/category-listings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingGrid } from "@/components/listing-grid";
import { JsonLd } from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
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
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ data: userData }, parentCategory, { listings, totalCount }] = await Promise.all([
    getUser(),
    category.parent_id
      ? supabase
          .from("categories")
          .select("name, slug")
          .eq("id", category.parent_id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
    fetchCategoryListings(supabase, { categoryId: category.id, page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / CATEGORY_PAGE_SIZE));

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
    <div className="flex flex-1 flex-col bg-neutral-50">
      <JsonLd data={breadcrumbJsonLd} />
      <SiteHeader user={userData.user} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
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

        <ListingGrid listings={listings} />

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}`}
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
                href={`?page=${page + 1}`}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
