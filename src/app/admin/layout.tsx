import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// No "access denied" page on purpose — a non-admin (or logged-out) visitor
// gets bounced to the homepage exactly like any other unknown route, so the
// existence of /admin isn't confirmed to anyone probing for it.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <AdminShell adminName={admin.full_name} role={admin.role}>
      {children}
    </AdminShell>
  );
}
