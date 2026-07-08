"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

export async function toggleFeatureFlagAction(key: string, enabled: boolean) {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();

  // RLS already enforces this at the database layer, but checking here too
  // means a non-super-admin gets a clean error instead of a silent no-op update.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin") throw new Error("Not authorized");

  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
}
