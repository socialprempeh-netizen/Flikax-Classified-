import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ResetPasswordGate } from "@/components/auth/reset-password-gate";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
        <Link href="/" className="font-logo text-4xl font-extrabold lowercase text-brand">
          flikax
        </Link>
        <ResetPasswordGate />
      </main>
    </div>
  );
}
