import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { VerifiedIdBadge } from "@/components/settings/verified-id-badge";

export default async function VerifiedBadgePage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings/verified");
  }

  return (
    <div className="space-y-4">
      <h1 className="border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">&quot;Verified ID&quot; badge</h1>
      <VerifiedIdBadge />
    </div>
  );
}
