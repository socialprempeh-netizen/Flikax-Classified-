import { getAllFeatureFlags } from "@/lib/feature-flags";
import { getAllSiteSettings } from "@/lib/site-settings";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { SiteSettingField } from "@/components/admin/site-setting-field";
import { requireSuperAdmin } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const [flags, settings] = await Promise.all([getAllFeatureFlags(), getAllSiteSettings()]);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">Feature flags and site configuration, editable without a redeploy.</p>

      <h2 className="mt-6 text-sm font-bold text-neutral-800">Feature flags</h2>
      <div className="mt-2 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {flags.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">No flags yet.</p>
        ) : (
          flags.map((flag) => <FlagToggle key={flag.key} flag={flag} />)
        )}
      </div>

      <h2 className="mt-6 text-sm font-bold text-neutral-800">Site settings</h2>
      <div className="mt-2 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {settings.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">No settings yet.</p>
        ) : (
          settings.map((setting) => <SiteSettingField key={setting.key} setting={setting} />)
        )}
      </div>
    </div>
  );
}
