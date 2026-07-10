// Structured diagnostic logging for the auth refresh path (src/lib/supabase/
// server.ts and middleware.ts). Session drops during ordinary browsing have
// recurred across three fix attempts (Server Action/prefetch middleware
// exclusions, then two rounds of retry-on-known-error-code), and each fix
// was reasoned from a single observed failure rather than a full picture of
// what leads up to one. This logs every getUser() call (both call sites) so
// the next failure comes with real data: exact timing, how long the token
// had left, which of the two known SDK error classes (if any) fired, and
// whether the single retry already in place recovered it. Intentionally
// verbose — this is a temporary diagnostic aid, not permanent instrumentation.
export function logAuthEvent(event: {
  source: "middleware" | "server";
  phase: "initial" | "retry";
  path?: string;
  ok: boolean;
  errorName?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  expiresAtUnix?: number | null;
}) {
  const now = Date.now();
  const expiresAtMs = event.expiresAtUnix ? event.expiresAtUnix * 1000 : null;

  console.log(
    "[auth-debug]",
    JSON.stringify({
      ts: new Date(now).toISOString(),
      source: event.source,
      phase: event.phase,
      path: event.path ?? null,
      ok: event.ok,
      errorName: event.errorName ?? null,
      errorCode: event.errorCode ?? null,
      errorMessage: event.errorMessage ?? null,
      tokenExpiresAt: expiresAtMs ? new Date(expiresAtMs).toISOString() : null,
      secondsUntilExpiry: expiresAtMs ? Math.round((expiresAtMs - now) / 1000) : null,
    })
  );
}
