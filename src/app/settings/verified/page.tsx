import { redirect } from "next/navigation";
import { getUser, createClient } from "@/lib/supabase/server";
import { VerifiedIdBadge } from "@/components/settings/verified-id-badge";

export default async function VerifiedBadgePage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings/verified");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("verified").eq("id", user.id).maybeSingle();

  return (
    <div className="space-y-4">
      <h1 className="border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">&quot;Verified ID&quot; badge</h1>
      <VerifiedIdBadge verified={profile?.verified ?? false} />
    </div>
  );
}
