import Link from "next/link";
import { redirect } from "next/navigation";
import { ImageOff } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { resolveListingImageUrl } from "@/lib/images";
import { getListingPath } from "@/lib/listing-url";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  declined: "Declined",
  sold: "Sold",
  removed: "Closed",
};

export default async function PerformanceInsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/insights");
  }

  const { data: stats } = await supabase.rpc("get_seller_listing_stats", { p_user_id: user.id });
  const rows = stats ?? [];

  return (
    <section>
      <h1 className="mb-2 border-l-4 border-brand pl-3 text-xl font-bold uppercase tracking-wide text-neutral-800">
        Performance Insights
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        See views, saves, and messages across all your listings, and how each one ranks against similar
        listings in its category.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-600">No listings yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-100 bg-white shadow-md">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                <th className="px-4 py-3 font-semibold">Listing</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Saves</th>
                <th className="px-4 py-3 font-semibold">Messages</th>
                <th className="px-4 py-3 font-semibold">Rank in category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((row) => {
                const href = getListingPath({
                  title: row.title,
                  location: row.location,
                  short_id: row.short_id,
                  categorySlug: row.category_slug,
                });
                const imageUrl = row.cover_image_path
                  ? resolveListingImageUrl(supabase, row.cover_image_path)
                  : null;

                return (
                  <tr key={row.id} className="hover:bg-brand-light/20">
                    <td className="px-4 py-3">
                      <Link href={href} className="flex items-center gap-3">
                        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-light text-brand/40">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt={row.title} className="size-full object-cover" />
                          ) : (
                            <ImageOff className="size-5" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-56 truncate font-semibold text-neutral-800 hover:text-brand">
                            {row.title}
                          </span>
                          <span className="block text-xs text-neutral-400">{row.category_name}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-700">{row.views}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-700">{row.save_count}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-700">{row.conversation_count}</td>
                    <td className="px-4 py-3 text-neutral-700">
                      {row.rank && row.total_in_category ? (
                        <span className="font-semibold text-brand">
                          #{row.rank} of {row.total_in_category}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
