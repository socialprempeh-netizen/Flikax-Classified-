import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export function resolveListingImageUrl(supabase: SupabaseClient<Database>, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
}
