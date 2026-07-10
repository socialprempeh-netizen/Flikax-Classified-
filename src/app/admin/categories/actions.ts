"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

async function requireSuperAdminActor() {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin") throw new Error("Not authorized");

  return { supabase };
}

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

/** No DB constraint enforces the 2-level max depth — this is the only enforcement point. */
async function assertShallowParent(supabase: Awaited<ReturnType<typeof requireSuperAdminActor>>["supabase"], parentId: string | null) {
  if (!parentId) return;
  const { data: parent } = await supabase.from("categories").select("parent_id").eq("id", parentId).maybeSingle();
  if (!parent) throw new Error("Parent category not found");
  if (parent.parent_id) throw new Error("Categories can only be nested 2 levels deep.");
}

export async function createCategoryAction(input: {
  name: string;
  slug: string;
  parentId: string | null;
  icon: string | null;
}) {
  const { supabase } = await requireSuperAdminActor();
  await assertShallowParent(supabase, input.parentId);

  const siblingCountQuery = supabase.from("categories").select("id", { count: "exact", head: true });
  const { count } = await (input.parentId
    ? siblingCountQuery.eq("parent_id", input.parentId)
    : siblingCountQuery.is("parent_id", null));

  const { error } = await supabase.from("categories").insert({
    name: input.name,
    slug: input.slug,
    parent_id: input.parentId,
    icon: input.icon,
    display_order: count ?? 0,
  });
  if (error) {
    if (error.code === "23505") throw new Error("A category with this slug already exists.");
    throw new Error(error.message);
  }

  revalidateCategories();
}

export async function updateCategoryAction(
  id: string,
  input: { name: string; slug: string; icon: string | null; parentId: string | null }
) {
  const { supabase } = await requireSuperAdminActor();
  if (input.parentId === id) throw new Error("A category can't be its own parent.");
  await assertShallowParent(supabase, input.parentId);

  const { error } = await supabase
    .from("categories")
    .update({ name: input.name, slug: input.slug, icon: input.icon, parent_id: input.parentId })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") throw new Error("A category with this slug already exists.");
    throw new Error(error.message);
  }

  revalidateCategories();
}

export async function reorderCategoryAction(id: string, direction: "up" | "down") {
  const { supabase } = await requireSuperAdminActor();

  const { data: current } = await supabase
    .from("categories")
    .select("id, parent_id, display_order")
    .eq("id", id)
    .maybeSingle();
  if (!current) throw new Error("Category not found");

  let siblingQuery = current.parent_id
    ? supabase.from("categories").select("id, display_order").eq("parent_id", current.parent_id)
    : supabase.from("categories").select("id, display_order").is("parent_id", null);
  siblingQuery =
    direction === "up"
      ? siblingQuery.lt("display_order", current.display_order).order("display_order", { ascending: false })
      : siblingQuery.gt("display_order", current.display_order).order("display_order", { ascending: true });

  const { data: sibling } = await siblingQuery.limit(1).maybeSingle();
  if (!sibling) return;

  const { error: err1 } = await supabase
    .from("categories")
    .update({ display_order: sibling.display_order })
    .eq("id", current.id);
  const { error: err2 } = await supabase
    .from("categories")
    .update({ display_order: current.display_order })
    .eq("id", sibling.id);
  if (err1 || err2) throw new Error(err1?.message ?? err2?.message ?? "Could not reorder");

  revalidateCategories();
}

export async function deleteCategoryAction(id: string) {
  const { supabase } = await requireSuperAdminActor();

  const [{ count: listingCount }, { count: childCount }] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("category_id", id),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id),
  ]);

  if (listingCount && listingCount > 0) {
    throw new Error(`Can't delete — ${listingCount} listing${listingCount === 1 ? "" : "s"} still use this category.`);
  }
  if (childCount && childCount > 0) {
    throw new Error(`Can't delete — this category has ${childCount} subcategor${childCount === 1 ? "y" : "ies"}.`);
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateCategories();
}
