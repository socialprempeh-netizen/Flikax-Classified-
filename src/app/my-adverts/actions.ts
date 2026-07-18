"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

export async function deleteListingAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();
  if (!user) return;

  await supabase.from("listings").delete().eq("id", id).eq("user_id", user.id);
  revalidateTag("listings");
  revalidatePath("/dashboard");
  revalidatePath("/", "page");
  revalidatePath("/[category]", "page");
}
