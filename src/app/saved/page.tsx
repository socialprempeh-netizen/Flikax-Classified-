import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { getListingPath } from "@/lib/listing-url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingGrid, type ListingCard } from "@/components/listing-grid";

export default async function SavedListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/saved");
  }

  const { data: saved } = await supabase
    .from("saved_listings")
    .select(
      "created_at, listings(id, title, description, price, location, status, is_featured, featured_until, short_id, listing_images(storage_path, position), categories(slug))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const now = Date.now();
  const listings: ListingCard[] = (saved ?? [])
    .map((row) => row.listings)
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing) && listing.status === "active")
    .map((listing) => {
      const cover = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)[0];
      return {
        id: listing.id,
        href: getListingPath({
          title: listing.title,
          location: listing.location,
          short_id: listing.short_id,
          categorySlug: listing.categories?.slug ?? "listing",
        }),
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        imageUrl: cover ? resolveListingImageUrl(supabase, cover.storage_path) : null,
        isFeatured:
          listing.is_featured && (listing.featured_until ? new Date(listing.featured_until).getTime() > now : false),
      };
    });

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Saved listings</h1>
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-20 text-center shadow-lg">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-md">
              <Bookmark className="size-6" />
            </span>
            <p className="text-base font-semibold text-neutral-700">You haven&apos;t saved any listings yet</p>
            <p className="max-w-sm text-sm text-neutral-500">
              Tap the bookmark icon on any listing to save it here for later.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
