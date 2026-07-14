import { notFound, permanentRedirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingPath } from "@/lib/listing-url";

// The pre-SEO-overhaul URL shape (/listings/[uuid]). Kept alive purely as a
// permanent redirect to the new /{category}/{slug} URL so old links (search
// engines, bookmarks, anything posted externally) keep working and pass
// their link equity through rather than breaking.
export default async function LegacyListingRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("title, location, short_id, categories(slug)")
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  permanentRedirect(
    getListingPath({
      title: listing.title,
      location: listing.location,
      short_id: listing.short_id,
      categorySlug: listing.categories?.slug ?? "listing",
    })
  );
}
