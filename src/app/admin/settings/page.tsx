import { getAllFeatureFlags } from "@/lib/feature-flags";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { requireSuperAdmin } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const flags = await getAllFeatureFlags();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Feature Flags</h1>
      <p className="mt-1 text-sm text-neutral-500">Toggle features on or off without a redeploy.</p>

      <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {flags.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">No flags yet.</p>
        ) : (
          flags.map((flag) => <FlagToggle key={flag.key} flag={flag} />)
        )}
      </div>
    </div>
  );
}
