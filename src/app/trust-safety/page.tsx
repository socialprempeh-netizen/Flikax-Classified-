import { Shield } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TocLayout } from "@/components/legal/toc-layout";
import { EmojiCard } from "@/components/trust-safety/emoji-card";
import { SupportCta } from "@/components/cta/support-cta";

const TOC = [
  { id: "general-safety-tips", title: "General Safety Tips" },
  { id: "buying-safely", title: "Buying Safely" },
  { id: "selling-safely", title: "Selling Safely" },
  { id: "safety-by-category", title: "Safety Tips by Category" },
  { id: "reporting-suspicious-activity", title: "Reporting Suspicious Activity" },
  { id: "how-flikax-helps", title: "How Flikax Helps Protect You" },
  { id: "need-help", title: "Need Help?" },
  { id: "our-commitment", title: "Our Commitment" },
];

const CATEGORY_TIPS = [
  {
    emoji: "💼",
    title: "Jobs",
    intro: "If you're searching for employment:",
    items: [
      "Never pay to apply for a job.",
      "Be cautious of employers requesting money.",
      "Research the company before attending interviews.",
      "Attend interviews at legitimate business locations.",
      "Never share sensitive personal or banking information before receiving a genuine offer.",
    ],
  },
  {
    emoji: "🚗",
    title: "Vehicles",
    intro: "Before purchasing a vehicle:",
    items: [
      "Inspect the vehicle thoroughly.",
      "Request a test drive.",
      "Verify ownership documents.",
      "Check the Vehicle Identification Number (VIN) where applicable.",
      "Consider having a trusted mechanic inspect the vehicle.",
      "Never pay before completing all checks.",
    ],
  },
  {
    emoji: "🏠",
    title: "Property",
    intro: "Before renting or buying property:",
    items: [
      "Visit the property in person.",
      "Confirm that it is available.",
      "Verify the landlord or property owner's identity.",
      "Avoid paying viewing or inspection fees.",
      "Read all agreements carefully.",
      "Avoid making large payments without proper documentation.",
    ],
  },
  {
    emoji: "🔧",
    title: "Services",
    intro: "When hiring a service provider:",
    items: [
      "Read customer reviews.",
      "Discuss pricing before work begins.",
      "Agree on timelines.",
      "Request quotations where appropriate.",
      "Pay only after satisfactory completion unless otherwise agreed.",
    ],
  },
  {
    emoji: "📱",
    title: "Electronics",
    intro: "When buying electronics:",
    items: [
      "Test the device before payment.",
      "Check for physical damage.",
      "Verify serial numbers where applicable.",
      "Confirm included accessories.",
      "Reset devices if purchasing used equipment.",
    ],
  },
];

export default async function TrustSafetyPage() {
  const {
    data: { user },
  } = await getUser();

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <SiteHeader user={user} />

      <TocLayout toc={TOC}>
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
            <Shield className="size-5" />
          </span>
          <h1 className="font-logo text-3xl font-bold text-neutral-800">Trust &amp; Safety</h1>
        </div>

        <p className="mb-4 text-neutral-700">
          At <strong>Flikax</strong>, we&apos;re committed to building a trusted marketplace where buyers
          and sellers can connect with confidence. While we actively monitor listings, remove prohibited
          content, and investigate reports of suspicious activity, every transaction is ultimately between
          users.
        </p>
        <p className="mb-10 text-neutral-700">
          Following these safety tips can help you avoid scams and enjoy a safer buying and selling
          experience.
        </p>

        <div className="space-y-14">
          {/* General Safety Tips */}
          <section id="general-safety-tips" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">General Safety Tips</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <EmojiCard emoji="⭐" title="Check Seller Profiles & Reviews">
                <p>Before making a purchase, take a few moments to review the seller&apos;s profile.</p>
                <p className="mt-2 font-medium text-neutral-800">Look for:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Positive ratings and reviews</li>
                  <li>Verified badges (where available)</li>
                  <li>Active listings</li>
                  <li>Account history</li>
                </ul>
                <p className="mt-2">
                  Reading feedback from previous buyers can help you make informed decisions.
                </p>
              </EmojiCard>

              <EmojiCard emoji="📍" title="Meet in Safe Public Places">
                <p>Whenever possible, arrange to meet in a well-lit public location such as:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Shopping centres</li>
                  <li>Police-approved meeting points</li>
                  <li>Busy cafés</li>
                  <li>Fuel stations</li>
                  <li>Public parking areas</li>
                </ul>
                <p className="mt-2">Avoid meeting in isolated locations, especially for high-value items.</p>
              </EmojiCard>

              <EmojiCard emoji="📦" title="Inspect Before You Pay">
                <p>Always examine the item carefully before handing over payment.</p>
                <p className="mt-2 font-medium text-neutral-800">Make sure:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>The item matches the listing description.</li>
                  <li>Accessories are included if promised.</li>
                  <li>The condition is as advertised.</li>
                  <li>The item works properly.</li>
                </ul>
                <p className="mt-2">
                  Never feel pressured to complete a purchase if something doesn&apos;t seem right.
                </p>
              </EmojiCard>

              <EmojiCard emoji="💸" title="Avoid Advance Payments">
                <p>Be cautious if a seller asks for payment before you&apos;ve inspected the item.</p>
                <p className="mt-2">
                  Unless you&apos;re using a trusted payment arrangement that both parties understand,
                  it&apos;s safest to pay only after you&apos;ve received and verified the item.
                </p>
              </EmojiCard>

              <EmojiCard emoji="🔒" title="Protect Your Personal & Financial Information">
                <p>Never share:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Bank PINs</li>
                  <li>One-Time Passwords (OTPs)</li>
                  <li>Card security codes (CVV)</li>
                  <li>Internet banking passwords</li>
                  <li>Mobile money PINs</li>
                  <li>Verification codes</li>
                </ul>
                <p className="mt-2">
                  Flikax will never ask for your banking passwords or security codes.
                </p>
              </EmojiCard>

              <EmojiCard emoji="⚠️" title="Be Alert for Deals That Seem Too Good to Be True">
                <p>Fraudsters often attract buyers with unrealistically low prices.</p>
                <p className="mt-2 font-medium text-neutral-800">Be cautious if:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>The price is significantly below market value.</li>
                  <li>The seller refuses to meet.</li>
                  <li>You&apos;re pressured to pay immediately.</li>
                  <li>Communication feels suspicious.</li>
                </ul>
                <p className="mt-2">If something feels wrong, walk away.</p>
              </EmojiCard>
            </div>
          </section>

          {/* Buying Safely */}
          <section id="buying-safely" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">Buying Safely</h2>
            <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
              <p className="text-neutral-700">When buying through Flikax:</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
                <li>Compare multiple listings before deciding.</li>
                <li>Ask questions about the item&apos;s condition.</li>
                <li>Request additional photos if needed.</li>
                <li>Verify important details before meeting.</li>
                <li>Test electronics before paying.</li>
                <li>Count accessories before leaving.</li>
                <li>Request receipts where applicable.</li>
              </ul>
            </div>
          </section>

          {/* Selling Safely */}
          <section id="selling-safely" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">Selling Safely</h2>
            <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
              <p className="text-neutral-700">When selling on Flikax:</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
                <li>Meet buyers in safe public places.</li>
                <li>Accept payment only after confirming funds have been received.</li>
                <li>Never hand over an item before payment is complete.</li>
                <li>Remove personal information from devices before selling.</li>
                <li>Keep records of important transactions.</li>
              </ul>
            </div>
          </section>

          {/* Safety Tips by Category */}
          <section id="safety-by-category" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">Safety Tips by Category</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {CATEGORY_TIPS.map((cat) => (
                <EmojiCard key={cat.title} emoji={cat.emoji} title={cat.title}>
                  <p>{cat.intro}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {cat.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </EmojiCard>
              ))}
            </div>
          </section>

          {/* Reporting Suspicious Activity */}
          <section id="reporting-suspicious-activity" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">Reporting Suspicious Activity</h2>
            <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
              <p className="text-neutral-700">Help keep the Flikax community safe by reporting:</p>
              <ul className="mt-2 grid list-disc grid-cols-2 gap-x-4 space-y-1.5 pl-5 text-neutral-700 sm:grid-cols-3">
                <li>Fake listings</li>
                <li>Fraud attempts</li>
                <li>Counterfeit goods</li>
                <li>Harassment</li>
                <li>Spam</li>
                <li>Prohibited items</li>
                <li>Impersonation</li>
                <li>Suspicious users</li>
              </ul>
              <p className="mt-4 text-neutral-700">
                Our moderation team reviews reports and takes appropriate action, which may include removing
                listings, suspending accounts, or cooperating with law enforcement where required.
              </p>
            </div>
          </section>

          {/* How Flikax Helps Protect You */}
          <section id="how-flikax-helps" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">How Flikax Helps Protect You</h2>
            <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
              <p className="text-neutral-700">We work continuously to improve marketplace safety by:</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-neutral-700">
                <li>Reviewing listings for compliance.</li>
                <li>Removing prohibited or misleading content.</li>
                <li>Investigating reports from users.</li>
                <li>Limiting spam and abusive behaviour.</li>
                <li>Securing user accounts and data.</li>
                <li>Monitoring suspicious platform activity.</li>
              </ul>
              <p className="mt-4 text-neutral-700">
                While we strive to create a safer marketplace, no online platform can guarantee every
                transaction. Users should always exercise good judgment and follow the safety
                recommendations on this page.
              </p>
            </div>
          </section>

          {/* Need Help */}
          <section id="need-help" className="scroll-mt-24">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">Need Help?</h2>
            <div className="mt-5 rounded-2xl bg-brand-light p-6">
              <p className="text-neutral-700">
                If you encounter suspicious activity or believe another user has violated our policies,
                please report the listing or contact the Flikax Support team.
              </p>
              <p className="mt-2 text-neutral-700">
                Your reports help us maintain a trusted marketplace for everyone.
              </p>
              <SupportCta subject="Reporting suspicious activity" className="mt-4" />
            </div>
          </section>

          {/* Our Commitment */}
          <section id="our-commitment" className="scroll-mt-24 text-center">
            <h2 className="font-logo text-2xl font-bold text-neutral-800">Our Commitment</h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-700">
              At Flikax, trust is at the heart of everything we do. By working together and following these
              safety guidelines, we can create a marketplace where everyone can buy, sell, and connect with
              greater confidence.
            </p>
            <p className="mt-4 font-logo font-bold text-neutral-800">
              Flikax — Buy. Sell. Discover. Safely.
            </p>
          </section>
        </div>
      </TocLayout>

      <SiteFooter />
    </div>
  );
}
