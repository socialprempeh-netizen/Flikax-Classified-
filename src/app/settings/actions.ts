"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccountAction(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Account deletion isn't configured yet — an administrator needs to add SUPABASE_SERVICE_ROLE_KEY to the server environment.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  return {};
}
