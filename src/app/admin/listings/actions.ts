"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { ADMIN_LISTING_STATUSES } from "@/lib/admin-listings";
import { logAdminAction } from "@/lib/admin-audit-log";

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

  return { supabase, actorId: user.id };
}

function revalidateListings(ids: string[]) {
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  for (const id of ids) revalidatePath(`/admin/listings/${id}`);
}

export async function updateListingStatusAction(ids: string[], newStatus: string) {
  if (ids.length === 0) return;
  if (!ADMIN_LISTING_STATUSES.includes(newStatus as (typeof ADMIN_LISTING_STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("listings").update({ status: newStatus }).in("id", ids);
  if (error) throw new Error(error.message);

  for (const id of ids) {
    await logAdminAction({ actorId, action: "listing.status_change", targetType: "listing", targetId: id, detail: { newStatus } });
  }
  revalidateListings(ids);
}

export async function deleteListingsAction(ids: string[]) {
  if (ids.length === 0) return;
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("listings").delete().in("id", ids);
  if (error) throw new Error(error.message);

  for (const id of ids) {
    await logAdminAction({ actorId, action: "listing.delete", targetType: "listing", targetId: id });
  }
  revalidateListings(ids);
}

export async function updateListingCategoryAction(id: string, categoryId: string) {
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("listings").update({ category_id: categoryId }).eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "listing.category_change", targetType: "listing", targetId: id, detail: { categoryId } });
  revalidateListings([id]);
}

export async function extendListingExpiryAction(id: string, days: number) {
  const { supabase, actorId } = await requireAdminActor();

  const { data: listing } = await supabase.from("listings").select("expires_at").eq("id", id).maybeSingle();
  const base =
    listing?.expires_at && new Date(listing.expires_at) > new Date() ? new Date(listing.expires_at) : new Date();
  base.setDate(base.getDate() + days);

  const { error } = await supabase.from("listings").update({ expires_at: base.toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "listing.expiry_extend", targetType: "listing", targetId: id, detail: { days } });
  revalidateListings([id]);
}

export async function clearFeaturedAction(id: string) {
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase
    .from("listings")
    .update({ is_featured: false, featured_until: null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "listing.clear_featured", targetType: "listing", targetId: id });
  revalidateListings([id]);
}

export async function clearBumpAction(id: string) {
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase.from("listings").update({ bumped_at: null }).eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "listing.clear_bump", targetType: "listing", targetId: id });
  revalidateListings([id]);
}
