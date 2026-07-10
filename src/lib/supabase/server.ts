import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { logAuthEvent } from "./auth-debug-log";

async function buildClient() {
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
}

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
export const createClient = cache(buildClient);

// A concurrent request (another prefetch, another tab, a sibling layout/page
// segment fetch for the same navigation) can rotate the same single-use
// refresh token a moment before this one tries it. That surfaces as one of
// two distinct SDK-level failures, not one: the auth *server* rejecting a
// stale token outright (AuthApiError, code "refresh_token_already_used"),
// or the JS SDK's own client-side "commit guard" noticing local storage
// changed under it mid-refresh and discarding an otherwise-successful result
// to avoid corrupting state (AuthRefreshDiscardedError, "session state
// changed mid-flight") — confirmed live: dashboard's layout.tsx and
// page.tsx both call getUser(), and a concurrent prefetch's render of the
// same route can lose exactly this way even after the request-level race
// was narrowed elsewhere. Supabase's server keeps a short grace window where
// re-presenting the just-rotated-away ("parent") token still resolves to
// the active session, so retrying once on a fresh client instance (nothing
// carries over the failed attempt's internal state) recovers both cases.
function isRetryableSessionError(error: { code?: string; name?: string } | null | undefined) {
  return error?.code === "refresh_token_already_used" || error?.name === "AuthRefreshDiscardedError";
}

async function expiresAtUnix(client: Awaited<ReturnType<typeof buildClient>>): Promise<number | null> {
  try {
    const { data } = await client.auth.getSession();
    return data.session?.expires_at ?? null;
  } catch {
    return null;
  }
}

export const getUser = cache(async () => {
  const supabase = await createClient();
  const result = await supabase.auth.getUser();

  logAuthEvent({
    source: "server",
    phase: "initial",
    ok: !result.error,
    errorName: result.error?.name,
    errorCode: (result.error as { code?: string } | null)?.code,
    errorMessage: result.error?.message,
    expiresAtUnix: await expiresAtUnix(supabase),
  });

  if (isRetryableSessionError(result.error)) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const retryClient = await buildClient();
    const retryResult = await retryClient.auth.getUser();

    logAuthEvent({
      source: "server",
      phase: "retry",
      ok: !retryResult.error,
      errorName: retryResult.error?.name,
      errorCode: (retryResult.error as { code?: string } | null)?.code,
      errorMessage: retryResult.error?.message,
      expiresAtUnix: await expiresAtUnix(retryClient),
    });

    return retryResult;
  }

  return result;
});
