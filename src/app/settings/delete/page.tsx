import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

export default async function DeleteAccountPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings/delete");
  }

  return (
    <div className="space-y-4">
      <h1 className="border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">
        Delete my account permanently
      </h1>
      <DeleteAccountSection />
    </div>
  );
}
