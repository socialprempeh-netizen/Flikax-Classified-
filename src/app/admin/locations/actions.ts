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
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin") throw new Error("Not authorized");

  return { supabase, actorId: user.id };
}

function revalidateLocations() {
  revalidatePath("/admin/locations");
  revalidatePath("/api/locations");
}

export async function updateDistrictNameAction(id: string, name: string) {
  const { supabase, actorId } = await requireSuperAdminActor();
  if (!name.trim()) throw new Error("Enter a name.");

  const { error } = await supabase
    .from("locations")
    .update({ district_name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "location.district_rename", targetType: "location", targetId: id, detail: { name: name.trim() } });
  revalidateLocations();
}

export async function updateRegionNameAction(regionSlug: string, name: string) {
  const { supabase, actorId } = await requireSuperAdminActor();
  if (!name.trim()) throw new Error("Enter a name.");

  const { error } = await supabase
    .from("locations")
    .update({ region_name: name.trim(), updated_at: new Date().toISOString() })
    .eq("region_slug", regionSlug);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "location.region_rename", targetType: "location_region", targetId: regionSlug, detail: { name: name.trim() } });
  revalidateLocations();
}

export async function toggleLocationEnabledAction(id: string, enabled: boolean) {
  const { supabase, actorId } = await requireSuperAdminActor();

  const { error } = await supabase
    .from("locations")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "location.toggle_enabled", targetType: "location", targetId: id, detail: { enabled } });
  revalidateLocations();
}

export async function reorderDistrictAction(id: string, direction: "up" | "down") {
  const { supabase, actorId } = await requireSuperAdminActor();

  const { data: current } = await supabase
    .from("locations")
    .select("id, region_slug, district_order")
    .eq("id", id)
    .maybeSingle();
  if (!current) throw new Error("Location not found");

  let siblingQuery = supabase
    .from("locations")
    .select("id, district_order")
    .eq("region_slug", current.region_slug);
  siblingQuery =
    direction === "up"
      ? siblingQuery.lt("district_order", current.district_order).order("district_order", { ascending: false })
      : siblingQuery.gt("district_order", current.district_order).order("district_order", { ascending: true });

  const { data: sibling } = await siblingQuery.limit(1).maybeSingle();
  if (!sibling) return;

  const { error: err1 } = await supabase
    .from("locations")
    .update({ district_order: sibling.district_order })
    .eq("id", current.id);
  const { error: err2 } = await supabase
    .from("locations")
    .update({ district_order: current.district_order })
    .eq("id", sibling.id);
  if (err1 || err2) throw new Error(err1?.message ?? err2?.message ?? "Could not reorder");

  await logAdminAction({ actorId, action: "location.district_reorder", targetType: "location", targetId: id, detail: { direction } });
  revalidateLocations();
}

export async function reorderRegionAction(regionSlug: string, direction: "up" | "down") {
  const { supabase, actorId } = await requireSuperAdminActor();

  const { data: rows } = await supabase.from("locations").select("region_slug, region_order").order("region_order");
  const distinctRegions = Array.from(
    new Map((rows ?? []).map((r) => [r.region_slug, r.region_order])).entries()
  ).sort((a, b) => a[1] - b[1]);

  const currentIndex = distinctRegions.findIndex(([slug]) => slug === regionSlug);
  if (currentIndex === -1) throw new Error("Region not found");
  const siblingIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (siblingIndex < 0 || siblingIndex >= distinctRegions.length) return;

  const [currentSlug, currentOrder] = distinctRegions[currentIndex];
  const [siblingSlug, siblingOrder] = distinctRegions[siblingIndex];

  const { error: err1 } = await supabase
    .from("locations")
    .update({ region_order: siblingOrder })
    .eq("region_slug", currentSlug);
  const { error: err2 } = await supabase
    .from("locations")
    .update({ region_order: currentOrder })
    .eq("region_slug", siblingSlug);
  if (err1 || err2) throw new Error(err1?.message ?? err2?.message ?? "Could not reorder");

  await logAdminAction({ actorId, action: "location.region_reorder", targetType: "location_region", targetId: regionSlug, detail: { direction } });
  revalidateLocations();
}

export async function deleteLocationAction(id: string) {
  const { supabase, actorId } = await requireSuperAdminActor();

  const { data: location } = await supabase.from("locations").select("district_name").eq("id", id).maybeSingle();
  if (!location) throw new Error("Location not found");

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("location", location.district_name);
  if (count && count > 0) {
    throw new Error(`Can't delete — ${count} listing${count === 1 ? "" : "s"} still use this location.`);
  }

  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "location.delete", targetType: "location", targetId: id });
  revalidateLocations();
}
