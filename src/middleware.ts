import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Server Actions (every startTransition(() => someAction()) call and every
  // <form action={...}>) POST to the same page route a normal navigation
  // uses, so they aren't caught by the /api/* exclusion below — but the
  // action itself already refreshes the session via the cached getUser()/
  // createClient() in src/lib/supabase/server.ts, and (unlike a Server
  // Component render) can persist that refresh via Set-Cookie on its own
  // response. Also running updateSession() here raced that refresh: two
  // independent clients each deciding to rotate the same single-use refresh
  // token, whichever the auth server saw second came back "Invalid Refresh
  // Token: Already Used" — this is what surfaced as "Not authenticated" on
  // ordinary actions (saving a listing, admin approve/suspend/ban, etc.),
  // not just in the admin panel. Next.js marks every Server Action POST with
  // a `next-action` header, so it can be excluded the same way /api/* is.
  if (request.headers.get("next-action")) {
    return NextResponse.next();
  }

  // Next.js prefetches every <Link> that scrolls into view, not just ones
  // the user hovers or clicks — a page with a full grid of listing cards
  // (the homepage, category pages) fires a burst of these as soon as it
  // renders. Each prefetch is its own real request through this matcher, so
  // several can land close enough together to each decide the access token
  // needs refreshing and race the same single-use refresh token — the same
  // failure mode as the Server Action case above, just triggered by normal
  // browsing (loading a link-heavy page) rather than an explicit action, and
  // the reason logouts kept recurring after that fix. Next.js marks these
  // with `next-router-prefetch`; skipping them here is safe because the
  // *real* navigation request (an actual click) doesn't carry that header,
  // so it still goes through updateSession() and refreshes normally.
  if (request.headers.get("next-router-prefetch")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // API routes read/refresh their own session via the memoized createClient()
    // + getUser() in src/lib/supabase/server.ts, and (unlike Server Components)
    // a Route Handler can persist that refresh itself via Set-Cookie on its own
    // response. Having middleware *also* refresh the same request's session
    // here was a second, independent GoTrueClient racing the route handler's
    // refresh — whichever lost got treated as reusing an already-rotated
    // refresh token and came back with no user, surfacing as "Not authenticated"
    // on uploads. Excluding /api/* removes that race entirely for API routes.
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
