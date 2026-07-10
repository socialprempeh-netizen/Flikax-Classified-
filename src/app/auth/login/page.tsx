import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { AuthMethodTabs } from "@/components/auth/auth-method-tabs";

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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:order-1">
          <div>
            <Link href="/" className="font-logo text-3xl font-extrabold lowercase text-brand">
              flikax
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-neutral-800">Welcome back</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Buy and sell anything, anywhere in Ghana. Log in or create an account to get started.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <GoogleSignInButton redirectTo={redirectTo} />
            <AuthMethodTabs redirectTo={redirectTo} />
          </div>
        </div>

        <div className="order-1 h-48 sm:h-64 lg:order-2 lg:h-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/login-hero.jpg"
            alt="A vendor and customer connecting at a local market"
            className="size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
