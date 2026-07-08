import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/settings");
  }

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={user} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6">
        <SettingsSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
