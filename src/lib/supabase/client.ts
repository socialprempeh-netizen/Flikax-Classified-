import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

// A singleton, not a per-call factory: every GoTrueClient instance recovers
// its session from storage on construction and refreshes it there if it looks
// expired, independent of the `autoRefreshToken` setting below. Components
// that each called createClient() got their own instance, and in dev, React
// Strict Mode double-invokes useState(() => createClient()) lazy initializers,
// so two instances were being constructed per mount — both racing to refresh
// the same stored refresh token and invalidating each other (Supabase rotates
// the refresh token on every use). Sharing one instance across the whole tab
// means only one recovery-refresh ever runs.
export function createClient() {
  browserClient ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Middleware (src/lib/supabase/middleware.ts) refreshes the session
        // cookie on every navigation, so it stays the source of truth and
        // this client doesn't also refresh on its own timer.
        autoRefreshToken: false,
      },
    }
  );
  return browserClient;
}
