"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-audit-log";

async function requireSuperAdminActor() {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();

  // RLS already enforces this at the database layer, but checking here too
  // means a non-super-admin gets a clean error instead of a silent no-op update.
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin") throw new Error("Not authorized");

  return { supabase, actorId: user.id };
}

export async function toggleFeatureFlagAction(key: string, enabled: boolean) {
  const { supabase, actorId } = await requireSuperAdminActor();

  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "setting.flag_toggle", targetType: "feature_flag", targetId: key, detail: { enabled } });
  revalidatePath("/admin/settings");
}

export async function updateSiteSettingAction(key: string, value: string) {
  const { supabase, actorId } = await requireSuperAdminActor();

  const { error } = await supabase
    .from("site_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "setting.value_update", targetType: "site_setting", targetId: key, detail: { value } });
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
}
