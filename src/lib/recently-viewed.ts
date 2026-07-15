const STORAGE_KEY = "flikax:recently-viewed";
const MAX_ENTRIES = 10;

export type RecentlyViewedItem = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  imageUrl: string | null;
};

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((i) => i.id !== item.id);
    const next = [item, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, quota) -- recently-viewed is a nicety, fail silently
  }
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
