import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { createAdminClient } from "@/lib/supabase/admin";

export type DuplicatePhoneGroup = {
  phone: string;
  listings: { id: string; title: string; userId: string; sellerName: string | null; createdAt: string }[];
};

export type HighFrequencyPoster = {
  userId: string;
  sellerName: string | null;
  count: number;
  windowHours: number;
};

export type SimilarEmailGroup = {
  normalized: string;
  users: { id: string; email: string; createdAt: string }[];
};

/**
 * `profiles.phone` has a live DB-level unique constraint (Supabase Auth
 * enforces it at signup), so accounts can never share it — that signal is
 * structurally empty. `listings.contact_phone` has no such constraint and is
 * what "same seller running several accounts" actually looks like on this
 * schema: the same real-world contact number posted under different
 * `user_id`s.
 */
export async function findDuplicateContactPhones(
  supabase: SupabaseClient<Database>
): Promise<DuplicatePhoneGroup[]> {
  const { data } = await supabase
    .from("listings")
    .select("id, title, user_id, contact_phone, created_at, profiles(full_name)")
    .not("contact_phone", "is", null)
    .order("created_at", { ascending: false });

  const byPhone = new Map<string, DuplicatePhoneGroup["listings"]>();
  for (const row of data ?? []) {
    if (!row.contact_phone) continue;
    const entry = {
      id: row.id,
      title: row.title,
      userId: row.user_id,
      sellerName: row.profiles?.full_name ?? null,
      createdAt: row.created_at,
    };
    const existing = byPhone.get(row.contact_phone);
    if (existing) existing.push(entry);
    else byPhone.set(row.contact_phone, [entry]);
  }

  return Array.from(byPhone.entries())
    .filter(([, listings]) => new Set(listings.map((l) => l.userId)).size > 1)
    .map(([phone, listings]) => ({ phone, listings }));
}

/**
 * Real, directly-queryable signal: accounts that posted an unusually high
 * number of listings within a short recent window. This is a simple
 * "count in the last N hours" check, not a sliding-window scan across all
 * history — good enough to surface obvious burst-posting, not a full
 * anomaly-detection model.
 */
export async function findHighFrequencyPosters(
  supabase: SupabaseClient<Database>,
  windowHours: number,
  threshold: number
): Promise<HighFrequencyPoster[]> {
  const cutoff = new Date(Date.now() - windowHours * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from("listings")
    .select("user_id, profiles(full_name)")
    .gte("created_at", cutoff);

  const counts = new Map<string, { count: number; sellerName: string | null }>();
  for (const row of data ?? []) {
    const existing = counts.get(row.user_id);
    if (existing) existing.count += 1;
    else counts.set(row.user_id, { count: 1, sellerName: row.profiles?.full_name ?? null });
  }

  return Array.from(counts.entries())
    .filter(([, v]) => v.count >= threshold)
    .map(([userId, v]) => ({ userId, sellerName: v.sellerName, count: v.count, windowHours }))
    .sort((a, b) => b.count - a.count);
}

// Strips Gmail's ignored dots and +tag suffix so "j.doe+work@gmail.com" and
// "jdoe@gmail.com" normalize to the same address — the one same-person,
// multiple-accounts pattern that's actually detectable client-side, since
// GoTrue already enforces exact-address uniqueness at signup.
function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().split("@");
  if (!domain) return email.toLowerCase();
  const isGmail = domain === "gmail.com" || domain === "googlemail.com";
  const normalizedLocal = isGmail ? local.replace(/\./g, "").split("+")[0] : local;
  return `${normalizedLocal}@${domain}`;
}

export async function findSimilarEmailPatterns(
  adminClient: NonNullable<ReturnType<typeof createAdminClient>>
): Promise<SimilarEmailGroup[]> {
  const { data } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  const byNormalized = new Map<string, SimilarEmailGroup["users"]>();
  for (const user of data?.users ?? []) {
    if (!user.email) continue;
    const normalized = normalizeEmail(user.email);
    const entry = { id: user.id, email: user.email, createdAt: user.created_at };
    const existing = byNormalized.get(normalized);
    if (existing) existing.push(entry);
    else byNormalized.set(normalized, [entry]);
  }

  return Array.from(byNormalized.entries())
    .filter(([, users]) => users.length > 1)
    .map(([normalized, users]) => ({ normalized, users }));
}
