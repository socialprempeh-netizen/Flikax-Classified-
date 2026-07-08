import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { PersonalDetailsForm } from "@/components/settings/personal-details-form";
import { ConnectedAccounts } from "@/components/settings/connected-accounts";

export default async function PersonalDetailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, location, date_of_birth, sex")
    .eq("id", user.id)
    .maybeSingle();

  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [];

  return (
    <div className="space-y-4">
      <h1 className="border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Personal details</h1>

      <PersonalDetailsForm
        profile={{
          full_name: profile?.full_name ?? null,
          location: profile?.location ?? null,
          date_of_birth: profile?.date_of_birth ?? null,
          sex: profile?.sex ?? null,
        }}
      />

      <ConnectedAccounts connectedGoogle={providers.includes("google")} />
    </div>
  );
}
