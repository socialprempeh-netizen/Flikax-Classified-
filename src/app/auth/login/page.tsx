import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { AuthMethodTabs } from "@/components/auth/auth-method-tabs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect: redirectParam, error } = await searchParams;
  const redirectTo = redirectParam?.startsWith("/") ? redirectParam : "/";

  const {
    data: { user },
  } = await getUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] sm:p-12">
        <div>
          <Link href="/" className="font-logo text-3xl font-extrabold lowercase text-brand">
            flikax
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-neutral-800">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Buy and sell anything, anywhere in Ghana. Log in or create an account to get started.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          <GoogleSignInButton redirectTo={redirectTo} />
          <AuthMethodTabs redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
