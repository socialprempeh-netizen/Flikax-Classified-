"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { toGhanaE164 } from "@/lib/phone";

async function requireSuperAdminActor() {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin") throw new Error("Not authorized");

  return { supabase, actorId: user.id };
}

export async function updateAdminRoleAction(targetUserId: string, newRole: "super_admin" | "admin" | null) {
  const { supabase, actorId } = await requireSuperAdminActor();

  // A super admin demoting/revoking their own access could leave nobody able
  // to reach this page at all. Another super admin (or direct SQL, for the
  // very first one) has to make that change instead.
  if (targetUserId === actorId) {
    throw new Error("You can't change your own role here. Ask another super admin, or use SQL directly.");
  }

  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", targetUserId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/admins");
}

export async function grantAdminAccessAction(phoneInput: string, role: "super_admin" | "admin") {
  const { supabase } = await requireSuperAdminActor();

  const phone = toGhanaE164(phoneInput);
  if (!phone) throw new Error("Enter a valid Ghana phone number, e.g. 024 123 4567.");

  const { data: target } = await supabase.from("profiles").select("id").eq("phone", phone).maybeSingle();
  if (!target) {
    throw new Error("No user found with that phone number. They need to have signed up already.");
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", target.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/admins");
}
