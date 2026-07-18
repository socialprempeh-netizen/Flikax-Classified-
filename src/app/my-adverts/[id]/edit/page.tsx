import { notFound, redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { SiteHeader } from "@/components/site-header";
import { ListingForm, type ExistingListing } from "@/components/listings/listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: categories }, { data: profile }, { data: listing }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").order("name"),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("listings")
      .select("*, listing_images(id, storage_path, position)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!listing) {
    notFound();
  }

  const images = (listing.listing_images ?? [])
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      url: resolveListingImageUrl(supabase, img.storage_path),
    }));

  const existingListing: ExistingListing = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    negotiable: listing.negotiable,
    category_id: listing.category_id,
    attributes: (listing.attributes ?? {}) as Record<string, string | string[]>,
    video_url: listing.video_url,
    contact_phone: listing.contact_phone,
    images,
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <ListingForm
          categories={categories ?? []}
          existingListing={existingListing}
          posterName={profile?.full_name ?? user.phone}
          defaultContactPhone={user.phone}
        />
      </main>
    </div>
  );
}
