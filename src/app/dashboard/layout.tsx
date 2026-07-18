import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  const [{ data: profile }, { count: declinedCount }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "declined"),
  ]);

  const meta = (user.user_metadata ?? {}) as { avatar_url?: string; full_name?: string; name?: string };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6">
        <DashboardSidebar
          fullName={profile?.full_name ?? meta.full_name ?? meta.name ?? null}
          phone={user.phone ?? null}
          avatarUrl={meta.avatar_url ?? null}
          declinedCount={declinedCount ?? 0}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
