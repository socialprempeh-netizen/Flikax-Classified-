/** Lowercase, ASCII, hyphen-separated — safe for a URL path segment. Diacritics are
 * stripped rather than percent-encoded so "Café" and "Cafe" produce the same slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** The `listings.short_id` bigint identity column, base36-encoded for a short URL suffix. */
export function encodeShortId(shortId: number): string {
  return shortId.toString(36);
}

/** Inverse of encodeShortId. Returns null for anything that isn't a plain base36 string. */
export function decodeShortId(encoded: string): number | null {
  if (!/^[0-9a-z]+$/.test(encoded)) return null;
  const value = parseInt(encoded, 36);
  return Number.isFinite(value) ? value : null;
}

/** Pulls the short-id suffix off the last hyphen-separated segment of a listing slug
 * (the human-readable title/location prefix is decorative — this is the only part
 * actually used to look the listing up). Returns null if it doesn't decode. */
export function extractShortIdFromSlug(slug: string): number | null {
  const lastDash = slug.lastIndexOf("-");
  const candidate = lastDash === -1 ? slug : slug.slice(lastDash + 1);
  return decodeShortId(candidate);
}

export type ListingUrlInput = {
  title: string;
  location: string;
  short_id: number;
  categorySlug: string;
};

/** The single source of truth for a listing's canonical URL: /{categorySlug}/{slug}.
 * Takes a flat categorySlug rather than a nested category object since producers
 * pull it from different shapes (a joined `categories(slug)` row vs. the flat
 * `category_slug` column the search_listings RPC returns). */
export function getListingPath(listing: ListingUrlInput): string {
  const parts = [slugify(listing.title), slugify(listing.location)].filter(Boolean);
  const listingSlug = [...parts, encodeShortId(listing.short_id)].join("-");
  return `/${listing.categorySlug}/${listingSlug}`;
}
