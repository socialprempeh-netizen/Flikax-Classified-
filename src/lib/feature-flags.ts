import { createClient } from "@/lib/supabase/server";

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description: string | null;
  updated_at: string;
};

/** Defaults to false if the flag row doesn't exist yet. */
export async function getFeatureFlag(key: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("feature_flags").select("enabled").eq("key", key).maybeSingle();
  return data?.enabled ?? false;
}

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("feature_flags").select("*").order("key");
  return data ?? [];
}
