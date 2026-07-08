import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Memoized per request via React's cache(): callers that each did their own
// `createClient()` (e.g. a route handler grabbing a client for storage calls
// *and* separately calling getUser()) were constructing two independent
// Supabase server clients for the same request. Each client reads cookies
// once at construction and decides for itself whether the access token needs
// refreshing — so two instances could both decide to refresh, and the loser's
// refresh token was already rotated by the winner, which Supabase's SDK
// detects as "session state changed mid-flight" and discards, leaving that
// client with no user. Memoizing createClient() itself (not just getUser())
// means every call in a request shares the one client and the one decision.
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component; safe to ignore
            // when middleware is refreshing the session instead.
          }
        },
      },
    }
  );
});

export const getUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
