import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
        <Link href="/" className="font-logo text-4xl font-extrabold lowercase text-brand">
          flikax
        </Link>
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
