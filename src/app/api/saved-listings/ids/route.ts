import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

// Dynamic (cookies()) by design -- same reasoning as /api/session-summary.
// Split out of the page render so pages showing save buttons (homepage,
// listing detail) don't need a per-viewer Supabase call in their own render
// path just to know which of the shown listings are saved.
export async function GET() {
  const { data } = await getUser();
  const user = data.user;
  if (!user) {
    return NextResponse.json({ ids: [] });
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id);

  return NextResponse.json(
    { ids: (rows ?? []).map((r) => r.listing_id) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
