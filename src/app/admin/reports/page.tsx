import Link from "next/link";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, reason, status, created_at, listings(id, title)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Reports</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Flagged listings. Act on the underlying listing from Listings management.
      </p>

      <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {(reports ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Flag className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No reports yet.</p>
          </div>
        ) : (
          (reports ?? []).map((report) => (
            <div key={report.id} className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                {report.listings ? (
                  <Link
                    href={`/admin/listings/${report.listings.id}`}
                    className="text-sm font-bold text-neutral-800 hover:text-brand hover:underline"
                  >
                    {report.listings.title}
                  </Link>
                ) : (
                  <p className="text-sm font-bold text-neutral-400">Listing removed</p>
                )}
                <p className="mt-1 text-sm text-neutral-600">{report.reason || "No reason given"}</p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    report.status === "open" ? "bg-red-100 text-red-700" : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {report.status === "open" ? "Open" : "Dismissed"}
                </span>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
