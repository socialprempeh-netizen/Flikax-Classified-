import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { ChangePhoneForm } from "@/components/settings/change-phone-form";

export default async function ChangePhonePage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings/phone");
  }

  return (
    <div className="space-y-4">
      <h1 className="border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Change phone number</h1>
      <ChangePhoneForm currentPhone={user.phone ?? null} />
    </div>
  );
}
