import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
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
