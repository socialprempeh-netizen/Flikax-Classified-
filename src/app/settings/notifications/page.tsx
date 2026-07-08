import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";

export default async function NotificationSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings/notifications");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("notify_new_message, notify_new_call")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <h1 className="border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Manage notifications</h1>
      <NotificationSettingsForm
        initialNewMessage={profile?.notify_new_message ?? true}
        initialNewCall={profile?.notify_new_call ?? true}
      />
    </div>
  );
}
