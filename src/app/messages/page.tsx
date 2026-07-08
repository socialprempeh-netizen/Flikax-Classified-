import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function MessagesPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/messages");
  }

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-6 border-l-4 border-brand pl-3 text-xl font-bold text-neutral-800">Messages</h1>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-20 text-center shadow-lg">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-md">
            <MessageSquare className="size-6" />
          </span>
          <p className="text-base font-semibold text-neutral-700">No messages yet</p>
          <p className="max-w-sm text-sm text-neutral-500">
            When a buyer or seller messages you about a listing, it&apos;ll show up here.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
