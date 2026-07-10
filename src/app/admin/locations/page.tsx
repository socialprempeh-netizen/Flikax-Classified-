import { createClient } from "@/lib/supabase/server";
import { LocationsTree, type AdminLocation } from "@/components/admin/locations-tree";

export default async function AdminLocationsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("locations")
    .select("id, region_name, region_slug, region_order, district_name, district_slug, district_order, enabled")
    .order("region_order")
    .order("district_order");

  const rows: AdminLocation[] = data ?? [];
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Locations</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {rows.length} districts across{" "}
        {new Set(rows.map((r) => r.region_slug)).size} regions · {enabledCount} enabled.
      </p>

      <div className="mt-6">
        <LocationsTree locations={rows} />
      </div>
    </div>
  );
}
