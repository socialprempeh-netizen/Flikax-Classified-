import { requireSuperAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getAllHomepageSlides } from "@/lib/homepage-slides";
import { HomepageSliderManager } from "@/components/admin/homepage-slider-manager";

export default async function AdminHomepageSliderPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const slides = await getAllHomepageSlides(supabase);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-800">Homepage Slider</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage the rotating banner shown at the top of the homepage. Inactive slides and slides
        outside their scheduled window are hidden automatically.
      </p>

      <div className="mt-6">
        <HomepageSliderManager initialSlides={slides} />
      </div>
    </div>
  );
}
