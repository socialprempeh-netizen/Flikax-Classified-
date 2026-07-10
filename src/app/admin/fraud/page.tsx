import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDuplicateContactPhones, findHighFrequencyPosters, findSimilarEmailPatterns } from "@/lib/fraud-signals";

const FREQUENCY_WINDOW_HOURS = 24;
const FREQUENCY_THRESHOLD = 5;

export default async function AdminFraudPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [duplicatePhones, highFrequencyPosters, similarEmails] = await Promise.all([
    findDuplicateContactPhones(supabase),
    findHighFrequencyPosters(supabase, FREQUENCY_WINDOW_HOURS, FREQUENCY_THRESHOLD),
    adminClient ? findSimilarEmailPatterns(adminClient) : Promise.resolve([]),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Fraud Detection</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Read-only investigation view. Take action (warn, suspend, ban) from the linked account pages.
      </p>
      <p className="mt-2 max-w-3xl rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
        Same-phone-across-accounts as requested isn&apos;t possible on this schema —{" "}
        <code className="rounded bg-neutral-200 px-1 py-0.5">profiles.phone</code> has a database-level
        unique constraint, so no two accounts can ever share it. Shown below instead:{" "}
        <code className="rounded bg-neutral-200 px-1 py-0.5">listings.contact_phone</code> (no such
        constraint) reused across different accounts, which is what that pattern actually looks like here.
        Same-IP detection is not shown: no IP address is captured anywhere in this app today (checked
        Supabase&apos;s own auth audit log too — empty), so building it means adding capture from scratch,
        not surfacing existing data.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-800">
          Duplicate contact phone across accounts ({duplicatePhones.length})
        </h2>
        <div className="mt-2 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
          {duplicatePhones.length === 0 ? (
            <p className="p-6 text-sm text-neutral-400">No matches.</p>
          ) : (
            duplicatePhones.map((group) => (
              <div key={group.phone} className="p-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
                  <TriangleAlert className="size-4 text-amber-600" />
                  {group.phone} · {new Set(group.listings.map((l) => l.userId)).size} accounts
                </p>
                <ul className="mt-2 space-y-1">
                  {group.listings.map((listing) => (
                    <li key={listing.id} className="text-sm text-neutral-600">
                      <Link href={`/admin/users/${listing.userId}`} className="text-brand hover:underline">
                        {listing.sellerName ?? listing.userId}
                      </Link>{" "}
                      —{" "}
                      <Link href={`/admin/listings/${listing.id}`} className="hover:underline">
                        {listing.title}
                      </Link>{" "}
                      <span className="text-neutral-400">
                        ({new Date(listing.createdAt).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-800">
          High-frequency posting — {FREQUENCY_THRESHOLD}+ listings in the last {FREQUENCY_WINDOW_HOURS}h (
          {highFrequencyPosters.length})
        </h2>
        <div className="mt-2 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
          {highFrequencyPosters.length === 0 ? (
            <p className="p-6 text-sm text-neutral-400">No matches.</p>
          ) : (
            highFrequencyPosters.map((poster) => (
              <div key={poster.userId} className="flex items-center justify-between p-4">
                <Link
                  href={`/admin/users/${poster.userId}`}
                  className="flex items-center gap-1.5 text-sm font-bold text-neutral-800 hover:text-brand hover:underline"
                >
                  <TriangleAlert className="size-4 text-amber-600" />
                  {poster.sellerName ?? poster.userId}
                </Link>
                <span className="text-sm text-neutral-600">{poster.count} listings</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-800">
          Similar email patterns ({similarEmails.length})
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Gmail dot/plus-variant addresses (e.g. j.doe@gmail.com and jdoe+2@gmail.com) that normalize to
          the same inbox. Best-effort — won&apos;t catch every alias trick.
        </p>
        <div className="mt-2 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
          {!adminClient ? (
            <p className="p-6 text-sm text-red-600">
              Not available — admin operations aren&apos;t configured on this environment (missing service
              role key).
            </p>
          ) : similarEmails.length === 0 ? (
            <p className="p-6 text-sm text-neutral-400">No matches.</p>
          ) : (
            similarEmails.map((group) => (
              <div key={group.normalized} className="p-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
                  <TriangleAlert className="size-4 text-amber-600" />
                  {group.normalized}
                </p>
                <ul className="mt-2 space-y-1">
                  {group.users.map((user) => (
                    <li key={user.id} className="text-sm text-neutral-600">
                      <Link href={`/admin/users/${user.id}`} className="text-brand hover:underline">
                        {user.email}
                      </Link>{" "}
                      <span className="text-neutral-400">
                        (joined {new Date(user.createdAt).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
