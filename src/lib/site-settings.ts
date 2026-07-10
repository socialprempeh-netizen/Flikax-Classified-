import { createClient } from "@/lib/supabase/server";

export type SiteSetting = {
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
};

export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").order("key");
  return data ?? [];
}
