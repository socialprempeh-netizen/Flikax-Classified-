import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { District, Region } from "@/lib/locations";

export const revalidate = 300;

export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("locations")
    .select(
      "region_name, region_slug, region_order, district_name, district_slug, district_order, suburb_name, suburb_slug, suburb_order"
    )
    .eq("enabled", true)
    .order("region_order")
    .order("district_order")
    .order("suburb_order");

  const regionsBySlug = new Map<string, Region>();
  const districtsByKey = new Map<string, District>();
  for (const row of data ?? []) {
    let region = regionsBySlug.get(row.region_slug);
    if (!region) {
      region = { name: row.region_name, slug: row.region_slug, districts: [] };
      regionsBySlug.set(row.region_slug, region);
    }

    const districtKey = `${row.region_slug}:${row.district_slug}`;
    let district = districtsByKey.get(districtKey);
    if (!district) {
      district = { name: row.district_name, slug: row.district_slug };
      districtsByKey.set(districtKey, district);
      region.districts.push(district);
    }

    if (row.suburb_name && row.suburb_slug) {
      (district.suburbs ??= []).push({ name: row.suburb_name, slug: row.suburb_slug });
    }
  }

  const regions = Array.from(regionsBySlug.values());
  return NextResponse.json(regions, { headers: { "Cache-Control": "public, max-age=300" } });
}
