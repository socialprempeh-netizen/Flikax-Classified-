import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = redirectParam?.startsWith("/") ? redirectParam : "/";

  const {
    data: { user },
  } = await getUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute inset-0 bg-neutral-900/70" />
        <div className="relative flex flex-col items-center gap-8">
          <Link href="/" className="font-logo text-7xl font-extrabold lowercase text-white">
            flikax
          </Link>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <GoogleSignInButton redirectTo={redirectTo} />
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-white/30" />
              <span className="text-xs font-medium text-white/70">or</span>
              <span className="h-px flex-1 bg-white/30" />
            </div>
            <PhoneAuthForm redirectTo={redirectTo} />
          </div>
        </div>
      </main>
    </div>
  );
}
