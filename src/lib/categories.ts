import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Shared by the homepage and SiteHeader's no-prop fallback so both hit the
// same cached entry instead of two separate ones for identical data.
export const getCategories = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id, icon")
      .order("display_order")
      .order("name");
    return data ?? [];
  },
  ["all-categories"],
  { revalidate: 300, tags: ["categories"] }
);
