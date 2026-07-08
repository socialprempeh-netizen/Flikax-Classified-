"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import type { PlanType } from "@/lib/premium-plans";

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

export type PlanFormInput = {
  name: string;
  description: string;
  price: number;
  plan_type: PlanType;
  duration: "monthly" | "yearly" | "";
  duration_days: number | null;
  features: string[];
  display_order: number;
};

export async function createPlanAction(input: PlanFormInput) {
  const { supabase } = await requireSuperAdminActor();

  const { data, error } = await supabase
    .from("premium_plans")
    .insert({
      name: input.name,
      description: input.description || null,
      price: input.price,
      plan_type: input.plan_type,
      duration: input.duration || null,
      duration_days: input.duration_days,
      features: input.features,
      display_order: input.display_order,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/premium-plans");
  return data;
}

export async function updatePlanAction(planId: string, input: PlanFormInput) {
  const { supabase } = await requireSuperAdminActor();

  const { data, error } = await supabase
    .from("premium_plans")
    .update({
      name: input.name,
      description: input.description || null,
      price: input.price,
      plan_type: input.plan_type,
      duration: input.duration || null,
      duration_days: input.duration_days,
      features: input.features,
      display_order: input.display_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/premium-plans");
  revalidatePath("/premium");
  return data;
}

export async function togglePlanEnabledAction(planId: string, enabled: boolean) {
  const { supabase } = await requireSuperAdminActor();

  const { error } = await supabase
    .from("premium_plans")
    .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", planId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/premium-plans");
  revalidatePath("/premium");
}

export async function deletePlanAction(planId: string) {
  const { supabase } = await requireSuperAdminActor();

  const { error } = await supabase.from("premium_plans").delete().eq("id", planId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/premium-plans");
  revalidatePath("/premium");
}
