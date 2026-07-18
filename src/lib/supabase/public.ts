import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// The cookie-aware client in server.ts calls cookies() unconditionally --
// which is correct for anything that needs to respect a signed-in viewer's
// session, but it also means *any* page that uses it for even a plain public
// query (categories, active listings) gets forced out of static/ISR
// rendering, since cookies() access is a Next.js "dynamic API".
//
// This client uses the same anon key (so it's bound by the exact same RLS
// policies an anonymous visitor gets -- not the service-role admin client)
// but never touches cookies(). Use it only for the public, non-personalized
// data on ISR'd pages (homepage, category pages, listing detail): the
// rendered HTML is shared across every visitor by definition, so it can
// only ever reflect what an anonymous/logged-out viewer would see anyway.
// Anything that genuinely depends on who's looking (saved state, "is this
// my listing", unread badges) must be fetched client-side instead -- see
// useSessionSummary for the equivalent pattern already used in the header.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
