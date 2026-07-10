import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { logAuthEvent } from "./auth-debug-log";

function buildClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  return { supabase, getResponse: () => response };
}

async function expiresAtUnix(supabase: ReturnType<typeof buildClient>["supabase"]): Promise<number | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.expires_at ?? null;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const attempt = buildClient(request);

  // Refreshes the session cookie if it's expired; required for SSR auth to stay valid.
  const result = await attempt.supabase.auth.getUser();

  logAuthEvent({
    source: "middleware",
    phase: "initial",
    path,
    ok: !result.error,
    errorName: result.error?.name,
    errorCode: (result.error as { code?: string } | null)?.code,
    errorMessage: result.error?.message,
    expiresAtUnix: await expiresAtUnix(attempt.supabase),
  });

  // Same race as src/lib/supabase/server.ts's getUser() — a concurrent
  // request (another tab, a prefetch, a sibling layout/page segment fetch)
  // can rotate the token a moment before middleware tries it here, surfacing
  // as either the auth server rejecting a stale token outright
  // (refresh_token_already_used) or the SDK's own client-side commit guard
  // discarding an otherwise-successful refresh because local storage changed
  // mid-flight (AuthRefreshDiscardedError). Supabase's server has a short
  // grace window where re-presenting the just-rotated-away token still
  // resolves, so one retry on a fresh client (not carrying over the failed
  // attempt's state) recovers both instead of this response propagating a
  // bogus "logged out" cookie state.
  if (result.error?.code === "refresh_token_already_used" || result.error?.name === "AuthRefreshDiscardedError") {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const retry = buildClient(request);
    const retryResult = await retry.supabase.auth.getUser();

    logAuthEvent({
      source: "middleware",
      phase: "retry",
      path,
      ok: !retryResult.error,
      errorName: retryResult.error?.name,
      errorCode: (retryResult.error as { code?: string } | null)?.code,
      errorMessage: retryResult.error?.message,
      expiresAtUnix: await expiresAtUnix(retry.supabase),
    });

    return retry.getResponse();
  }

  return attempt.getResponse();
}
