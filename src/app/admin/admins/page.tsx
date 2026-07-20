import { requireSuperAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { AdminRoleRow } from "@/components/admin/admin-role-row";
import { GrantAdminForm } from "@/components/admin/grant-admin-form";

export default async function AdminAdminsPage() {
  const currentAdmin = await requireSuperAdmin();
  const supabase = await createClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .not("role", "is", null)
    .order("full_name");

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Admins</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage who has admin access and at what level.</p>

      <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-800">Grant admin access</h2>
        <p className="mt-0.5 text-sm text-neutral-500">The user has to have signed up already.</p>
        <GrantAdminForm />
      </div>

      <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
        {(admins ?? []).length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">No admins yet.</p>
        ) : (
          (admins ?? []).map((admin) => (
            <AdminRoleRow key={admin.id} admin={admin} isSelf={admin.id === currentAdmin.id} />
          ))
        )}
      </div>
    </div>
  );
}
