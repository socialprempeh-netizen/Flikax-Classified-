const RETRYABLE_MESSAGE = "Not authenticated";

/**
 * A Server Action can occasionally see a stale/already-rotated refresh token
 * (a Supabase SSR cookie-session race — see the `next-action` check in
 * src/middleware.ts for the primary fix) and throw "Not authenticated" even
 * though the browser is genuinely logged in. A short delay lets the browser's
 * cookie jar settle before retrying once, as a defense-in-depth layer for
 * whatever the middleware fix doesn't fully eliminate (e.g. two genuinely
 * concurrent actions).
 */
export async function withAuthRetry<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (err) {
    if (err instanceof Error && err.message === RETRYABLE_MESSAGE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return action();
    }
    throw err;
  }
}
