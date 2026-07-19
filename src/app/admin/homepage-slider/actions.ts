"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-audit-log";
import type { HomepageSlide } from "@/lib/homepage-slides";

async function requireAdminActor() {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "super_admin") throw new Error("Not authorized");

  return { supabase, actorId: user.id };
}

function refreshHomepage() {
  revalidateTag("homepage-slides");
  revalidatePath("/admin/homepage-slider");
  revalidatePath("/");
}

export type SlideFormInput = {
  image_path: string;
  headline: string;
  link_url: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
};

export async function createSlideAction(input: SlideFormInput): Promise<HomepageSlide> {
  const { supabase, actorId } = await requireAdminActor();

  const { data: existing } = await supabase
    .from("homepage_slides")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (existing?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("homepage_slides")
    .insert({
      image_path: input.image_path,
      headline: input.headline || null,
      link_url: input.link_url || null,
      is_active: input.is_active,
      starts_at: input.starts_at || null,
      ends_at: input.ends_at || null,
      display_order: nextOrder,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "homepage_slide.create", targetType: "homepage_slide", targetId: data.id });
  refreshHomepage();
  return data;
}

export async function updateSlideAction(slideId: string, input: SlideFormInput): Promise<HomepageSlide> {
  const { supabase, actorId } = await requireAdminActor();

  const { data, error } = await supabase
    .from("homepage_slides")
    .update({
      image_path: input.image_path,
      headline: input.headline || null,
      link_url: input.link_url || null,
      is_active: input.is_active,
      starts_at: input.starts_at || null,
      ends_at: input.ends_at || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slideId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logAdminAction({ actorId, action: "homepage_slide.update", targetType: "homepage_slide", targetId: slideId });
  refreshHomepage();
  return data;
}

export async function deleteSlideAction(slideId: string): Promise<void> {
  const { supabase, actorId } = await requireAdminActor();

  const { data: slide } = await supabase
    .from("homepage_slides")
    .select("image_path")
    .eq("id", slideId)
    .maybeSingle();

  const { error } = await supabase.from("homepage_slides").delete().eq("id", slideId);
  if (error) throw new Error(error.message);

  if (slide?.image_path) {
    await supabase.storage.from("homepage-slides").remove([slide.image_path]);
  }

  await logAdminAction({ actorId, action: "homepage_slide.delete", targetType: "homepage_slide", targetId: slideId });
  refreshHomepage();
}

export async function toggleSlideActiveAction(slideId: string, isActive: boolean): Promise<void> {
  const { supabase, actorId } = await requireAdminActor();

  const { error } = await supabase
    .from("homepage_slides")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", slideId);
  if (error) throw new Error(error.message);

  await logAdminAction({
    actorId,
    action: "homepage_slide.toggle_active",
    targetType: "homepage_slide",
    targetId: slideId,
    detail: { is_active: isActive },
  });
  refreshHomepage();
}

/** Swaps display_order with the adjacent slide in `direction` to move this one up/down the list, returning the resulting order. */
export async function reorderSlideAction(slideId: string, direction: "up" | "down"): Promise<HomepageSlide[]> {
  const { supabase, actorId } = await requireAdminActor();

  const { data: slides } = await supabase
    .from("homepage_slides")
    .select("*")
    .order("display_order", { ascending: true });
  if (!slides) return [];

  const index = slides.findIndex((s) => s.id === slideId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= slides.length) return slides;

  const current = slides[index];
  const swapWith = slides[swapIndex];

  await Promise.all([
    supabase.from("homepage_slides").update({ display_order: swapWith.display_order }).eq("id", current.id),
    supabase.from("homepage_slides").update({ display_order: current.display_order }).eq("id", swapWith.id),
  ]);

  await logAdminAction({ actorId, action: "homepage_slide.reorder", targetType: "homepage_slide", targetId: slideId, detail: { direction } });
  refreshHomepage();

  [current.display_order, swapWith.display_order] = [swapWith.display_order, current.display_order];
  return [...slides].sort((a, b) => a.display_order - b.display_order);
}
