import { createClient } from "@/lib/supabase/server";

export type PlanType = "pay_per_ad" | "subscription" | "featured_spot" | "bump_fee";

export type PremiumPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  plan_type: PlanType;
  duration: "monthly" | "yearly" | null;
  duration_days: number | null;
  features: string[];
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

/** Plan types that apply to one specific listing rather than the account as a whole. */
export const LISTING_SCOPED_PLAN_TYPES: PlanType[] = ["pay_per_ad", "featured_spot", "bump_fee"];

// How long the "Bumped" badge stays visible after a bump. Separate from the
// sort effect itself, which has no hard cutoff and just fades naturally as
// newer listings/bumps accumulate (GREATEST(bumped_at, created_at) in the
// search_listings sort) — this only bounds the cosmetic badge.
export const BUMP_BADGE_DISPLAY_HOURS = 48;

export function isRecentlyBumped(bumpedAt: string | null): boolean {
  if (!bumpedAt) return false;
  const hoursSince = (Date.now() - new Date(bumpedAt).getTime()) / (1000 * 60 * 60);
  return hoursSince >= 0 && hoursSince < BUMP_BADGE_DISPLAY_HOURS;
}

export async function getEnabledPlans(): Promise<PremiumPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("premium_plans")
    .select("*")
    .eq("is_enabled", true)
    .order("display_order")
    .order("created_at");
  return (data ?? []) as PremiumPlan[];
}

/** Super-admin only by RLS — returns every plan regardless of enabled state. */
export async function getAllPlans(): Promise<PremiumPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("premium_plans")
    .select("*")
    .order("display_order")
    .order("created_at");
  return (data ?? []) as PremiumPlan[];
}
