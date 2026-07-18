import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/supabase/server";

// Listing create/update writes go straight from the browser to Supabase
// (see listing-form.tsx) rather than through a server action, so there's no
// server-side request to hang revalidatePath/revalidateTag off of directly.
// The form calls this route right after a successful write instead --
// purges the unstable_cache entries (homepage, category pages, listing
// detail pages) tagged "listings", plus the Router Cache for the page
// shapes that render listing data, so the change is visible immediately
// rather than waiting out the 60s cache window.
export async function POST() {
  const { data } = await getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  revalidateTag("listings");
  revalidatePath("/", "page");
  revalidatePath("/[category]", "page");
  revalidatePath("/[category]/[slug]", "page");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
