import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { ListingForm } from "@/components/listings/listing-form";

export default async function SellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/sell");
  }

  const [{ data: categories }, { data: profile }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").order("name"),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <ListingForm
          categories={categories ?? []}
          posterName={profile?.full_name ?? user.phone}
          defaultContactPhone={user.phone}
        />
      </main>
    </div>
  );
}
