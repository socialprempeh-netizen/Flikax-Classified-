import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const TRENDING_LIMIT = 5;
// Pull a wider pool than we need before deduping -- several of the
// most-viewed listings are often near-duplicate titles (the same phone
// model posted by several sellers), and we want distinct terms.
const CANDIDATE_POOL_SIZE = 30;

/** Real search-query volume isn't tracked yet (no query log table exists), so
 * this derives "trending" from actual listing activity we do have -- the
 * most-viewed active listings' titles, deduped case-insensitively. Each term
 * still links to `/?q=<term>`, matching real listings rather than a curated
 * guess. */
export async function fetchTrendingTerms(supabase: SupabaseClient<Database>): Promise<string[]> {
  const { data } = await supabase
    .from("listings")
    .select("title, views")
    .eq("status", "active")
    .order("views", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(CANDIDATE_POOL_SIZE);

  const seen = new Set<string>();
  const terms: string[] = [];
  for (const row of data ?? []) {
    const normalized = row.title.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    terms.push(row.title.trim());
    if (terms.length >= TRENDING_LIMIT) break;
  }
  return terms;
}
