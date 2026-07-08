import { Lock } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ComingSoon } from "@/components/coming-soon";

export default async function PrivacyPolicyPage() {
  const {
    data: { user },
  } = await getUser();

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <ComingSoon
          icon={Lock}
          title="Privacy Policy"
          description="Our full privacy policy is being finalized. Check back soon."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
