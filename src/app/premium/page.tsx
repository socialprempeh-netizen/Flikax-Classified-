import Link from "next/link";
import { Gem, Check } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getFeatureFlag } from "@/lib/feature-flags";
import { getEnabledPlans, LISTING_SCOPED_PLAN_TYPES, type PlanType } from "@/lib/premium-plans";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ComingSoon } from "@/components/coming-soon";
import { PlanPurchaseButton } from "@/components/premium/plan-purchase-button";

const currency = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

const SECTION_ORDER: PlanType[] = ["featured_spot", "bump_fee", "pay_per_ad", "subscription"];

const SECTION_LABELS: Record<PlanType, string> = {
  featured_spot: "Featured Spots",
  bump_fee: "Bump to Top",
  pay_per_ad: "Pay Per Ad",
  subscription: "Subscriptions",
};

export default async function PremiumPage() {
  const [
    {
      data: { user },
    },
    featuredTierEnabled,
  ] = await Promise.all([getUser(), getFeatureFlag("featured_tier_enabled")]);

  if (!featuredTierEnabled) {
    return (
      <div className="flex flex-1 flex-col bg-neutral-50">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
          <ComingSoon
            icon={Gem}
            title="Premium Services"
            description="Boosted visibility, business profiles, and other premium seller tools are on the way."
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const plans = await getEnabledPlans();
  const plansByType = new Map<PlanType, typeof plans>();
  for (const plan of plans) {
    const list = plansByType.get(plan.plan_type) ?? [];
    list.push(plan);
    plansByType.set(plan.plan_type, list);
  }

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-800">Premium Plans</h1>
          <p className="mt-1 text-sm text-neutral-500">Get more eyes on your listings.</p>
        </div>

        {plans.length === 0 && (
          <p className="text-center text-sm text-neutral-400">No plans available right now.</p>
        )}

        {SECTION_ORDER.map((type) => {
          const sectionPlans = plansByType.get(type);
          if (!sectionPlans || sectionPlans.length === 0) return null;
          const listingScoped = LISTING_SCOPED_PLAN_TYPES.includes(type);

          return (
            <section key={type} className="mb-10">
              <h2 className="mb-4 border-l-4 border-brand pl-3 text-lg font-bold text-neutral-800">
                {SECTION_LABELS[type]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sectionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-col rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
                  >
                    <p className="font-bold text-neutral-800">{plan.name}</p>
                    {plan.description && <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>}
                    <p className="mt-3 text-2xl font-extrabold text-brand">
                      {currency.format(plan.price)}
                      {plan.duration && (
                        <span className="text-sm font-medium text-neutral-400"> / {plan.duration}</span>
                      )}
                    </p>
                    {plan.duration_days && (
                      <p className="mt-0.5 text-xs text-neutral-400">Active for {plan.duration_days} days</p>
                    )}

                    {plan.features.length > 0 && (
                      <ul className="mt-4 flex-1 space-y-1.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-1.5 text-sm text-neutral-600">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4">
                      {listingScoped ? (
                        <Link
                          href={user ? "/dashboard" : "/auth/login?redirect=/dashboard"}
                          className="block rounded-lg bg-brand px-3 py-2 text-center text-xs font-bold text-white hover:bg-brand-dark"
                        >
                          Choose a listing
                        </Link>
                      ) : user ? (
                        <PlanPurchaseButton planId={plan.id} />
                      ) : (
                        <Link
                          href="/auth/login?redirect=/premium"
                          className="block rounded-lg bg-brand px-3 py-2 text-center text-xs font-bold text-white hover:bg-brand-dark"
                        >
                          Log in to buy
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
