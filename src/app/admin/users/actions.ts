"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdminActor() {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile?.role || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }

  const adminClient = createAdminClient();
  if (!adminClient) throw new Error("Admin operations aren't configured on this environment.");

  return { adminClient, actorId: user.id };
}

function revalidateUser(id: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function suspendUserAction(userId: string, days: number) {
  const { adminClient, actorId } = await requireAdminActor();
  if (userId === actorId) throw new Error("You can't suspend your own account.");

  const suspendedUntil = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  const { error } = await adminClient.from("profiles").update({ suspended_until: suspendedUntil }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidateUser(userId);
}

export async function restoreUserAction(userId: string) {
  const { adminClient } = await requireAdminActor();

  const { error } = await adminClient.from("profiles").update({ suspended_until: null }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidateUser(userId);
}

export async function banUserAction(userId: string) {
  const { adminClient, actorId } = await requireAdminActor();
  if (userId === actorId) throw new Error("You can't ban your own account.");

  // No finite "permanent" value in the Admin API; ~100 years is Supabase's own
  // documented convention for an effectively-permanent ban.
  const { error } = await adminClient.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (error) throw new Error(error.message);

  revalidateUser(userId);
}

export async function unbanUserAction(userId: string) {
  const { adminClient } = await requireAdminActor();

  const { error } = await adminClient.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) throw new Error(error.message);

  revalidateUser(userId);
}

export async function deleteUserAction(userId: string) {
  const { adminClient, actorId } = await requireAdminActor();
  if (userId === actorId) throw new Error("You can't delete your own account.");

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function logWarningAction(userId: string, message: string) {
  const { adminClient, actorId } = await requireAdminActor();
  if (!message.trim()) throw new Error("Enter a message.");

  const { error } = await adminClient
    .from("admin_user_warnings")
    .insert({ user_id: userId, admin_id: actorId, message: message.trim() });
  if (error) throw new Error(error.message);

  revalidateUser(userId);
}
