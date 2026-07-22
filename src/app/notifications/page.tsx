import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function NotificationsPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/notifications");
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Notifications</h1>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-20 text-center shadow-lg">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-md">
            <Bell className="size-6" />
          </span>
          <p className="text-base font-semibold text-neutral-700">No notifications yet</p>
          <p className="max-w-sm text-sm text-neutral-500">
            Updates about your listings and account activity will show up here.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
