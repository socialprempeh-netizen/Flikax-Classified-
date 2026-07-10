export function bucketByDay(rows: { created_at: string }[], days: number): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const day = row.created_at.slice(0, 10); // YYYY-MM-DD, UTC — matches Ghana local (UTC+0, no DST)
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const buckets: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      count: counts.get(key) ?? 0,
    });
  }
  return buckets;
}

/** Same day-bucketing as bucketByDay, but sums an amount field instead of counting rows (for revenue). */
export function bucketSumByDay(
  rows: { created_at: string; amount: number }[],
  days: number
): { date: string; count: number }[] {
  const sums = new Map<string, number>();
  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    sums.set(day, (sums.get(day) ?? 0) + row.amount);
  }

  const buckets: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      count: sums.get(key) ?? 0,
    });
  }
  return buckets;
}
