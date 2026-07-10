import { createClient } from "@/lib/supabase/server";
import { CategoriesTree, type AdminCategory } from "@/components/admin/categories-tree";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, icon, display_order")
    .order("display_order")
    .order("name");

  const rows: AdminCategory[] = categories ?? [];
  const parents = rows.filter((c) => c.parent_id === null);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Categories</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {rows.length} categories total ({parents.length} top-level). Max 2 levels deep.
      </p>

      <div className="mt-6">
        <CategoriesTree parents={parents} allCategories={rows} />
      </div>
    </div>
  );
}
