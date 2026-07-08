import { requireSuperAdmin } from "@/lib/admin-auth";
import { getAllPlans } from "@/lib/premium-plans";
import { PremiumPlansManager } from "@/components/admin/premium-plans-manager";

export default async function AdminPremiumPlansPage() {
  await requireSuperAdmin();
  const plans = await getAllPlans();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Premium Plans</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Create, edit, and enable or disable plans. Disabled plans stay saved but are hidden from users.
      </p>

      <div className="mt-6">
        <PremiumPlansManager initialPlans={plans} />
      </div>
    </div>
  );
}
