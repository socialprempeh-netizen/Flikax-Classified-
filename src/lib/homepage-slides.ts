import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type HomepageSlide = {
  id: string;
  image_path: string;
  headline: string | null;
  link_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export function resolveSlideImageUrl(supabase: SupabaseClient<Database>, path: string): string {
  return supabase.storage.from("homepage-slides").getPublicUrl(path).data.publicUrl;
}

/** Active slides currently within their optional scheduling window, in display order. */
export async function getActiveHomepageSlides(
  supabase: SupabaseClient<Database>
): Promise<HomepageSlide[]> {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("homepage_slides")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order("display_order", { ascending: true });

  return data ?? [];
}

export async function getAllHomepageSlides(
  supabase: SupabaseClient<Database>
): Promise<HomepageSlide[]> {
  const { data } = await supabase
    .from("homepage_slides")
    .select("*")
    .order("display_order", { ascending: true });

  return data ?? [];
}
