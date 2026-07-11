export type MarketPriceRange = { low: number; high: number; sampleSize: number };

/** Below this, a percentile-based range isn't statistically meaningful — hide the
 * feature entirely rather than show a range built from 1-4 data points. */
export const MARKET_PRICE_MIN_SAMPLE = 5;

/** Only listings posted within this window count as "current market" — older
 * listings may no longer reflect what things are actually selling for. */
export const MARKET_PRICE_WINDOW_DAYS = 90;

// Linear-interpolation percentile (same method as Postgres's percentile_cont),
// so a same-input calc done in SQL vs. here would agree.
function percentile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

/** 25th-75th percentile of comparable prices — robust to the single lowball or
 * premium outlier that would wreck a plain min/max. Returns null below the
 * minimum sample size, meaning "don't render this feature for this listing". */
export function computeMarketPriceRange(prices: number[]): MarketPriceRange | null {
  if (prices.length < MARKET_PRICE_MIN_SAMPLE) return null;

  const sorted = [...prices].sort((a, b) => a - b);
  return {
    low: percentile(sorted, 0.25),
    high: percentile(sorted, 0.75),
    sampleSize: sorted.length,
  };
}
