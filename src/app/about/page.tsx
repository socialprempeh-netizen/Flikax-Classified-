import Link from "next/link";
import {
  Tag,
  Compass,
  MessageCircle,
  Zap,
  MapPin,
  Search,
  ShieldCheck,
  Smartphone,
  Camera,
  Handshake,
  Gem,
  Coins,
  Rocket,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SellCta } from "@/components/cta/sell-cta";
import { IllustrationCard } from "@/components/about/illustration-card";

const CATEGORIES = [
  "Vehicles",
  "Property",
  "Phones & Tablets",
  "Electronics",
  "Fashion",
  "Home & Furniture",
  "Jobs",
  "Services",
  "Animals & Pets",
  "Agriculture",
  "Commercial Equipment",
  "Beauty & Personal Care",
  "Baby Products",
];

const WHY_CHOOSE = [
  { icon: Zap, title: "Fast Listing Process", body: "Post your advert in just a few minutes with an easy-to-follow listing experience." },
  { icon: MapPin, title: "Local Marketplace", body: "Find products and services near you or expand your reach across your country." },
  { icon: Search, title: "Smart Search", body: "Quickly discover exactly what you're looking for using categories, filters, and keyword search." },
  { icon: ShieldCheck, title: "Safe Community", body: "We actively monitor listings and user activity to help reduce fraud, spam, and prohibited content." },
  { icon: Smartphone, title: "Mobile Friendly", body: "Use Flikax anywhere, anytime from your desktop, tablet, or mobile device." },
];

const SELL_STEPS = [
  { title: "Create an Account", body: "Register using your email address or sign in with Google." },
  { title: "Post Your Listing", body: "Upload quality photos, choose the appropriate category, write a clear title and description, enter your price, and publish your advert." },
  { title: "Receive Enquiries", body: "Interested buyers can contact you through Flikax." },
  { title: "Complete Your Sale", body: "Arrange a safe meeting place, inspect the item together, receive payment, and complete the transaction." },
];

const BUY_STEPS = [
  { title: "Search", body: "Browse categories or search using keywords." },
  { title: "Compare Listings", body: "Review prices, photos, seller information, and descriptions before making a decision." },
  { title: "Contact the Seller", body: "Ask questions, negotiate where appropriate, and arrange a meeting." },
  { title: "Buy Safely", body: "Inspect the item before making payment and complete the transaction in a secure public location whenever possible." },
];

const SAFETY_TIPS = [
  "Meet in safe public places.",
  "Inspect items before paying.",
  "Never send money in advance unless you completely trust the seller.",
  "Report suspicious listings or users.",
  "Keep communication respectful and honest.",
];

const PRO_TIPS = [
  { title: "Pay attention to the details", body: "Take clear, well-lit photos and write an honest, detailed description — listings with complete details get more replies." },
  { title: "Answer quickly", body: "Don't keep buyers waiting. Fast replies build trust and close sales faster." },
  { title: "Use Premium Services", body: "Boost your listing's visibility to reach more buyers and sell faster." },
];

const NAV = [
  { href: "#what-you-can-do", label: "What You Can Do" },
  { href: "#how-to-sell", label: "How to Sell" },
  { href: "#how-to-buy", label: "How to Buy" },
  { href: "#safety", label: "Safety" },
  { href: "#premium", label: "Premium" },
];

function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {i + 1}
          </span>
          <div>
            <h3 className="font-bold text-neutral-800">{step.title}</h3>
            <p className="mt-0.5 text-sm text-neutral-600">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function AboutPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-brand px-4 py-16 text-center text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-logo text-4xl font-extrabold sm:text-5xl">Buy. Sell. Discover.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
            Flikax is a modern online classifieds marketplace that makes it easy for people to buy, sell,
            rent, and discover products and services in their local communities.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-white/80">
            Our mission is to make local commerce faster, safer, and more accessible for everyone.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <SellCta label="Start Selling" size="lg" className="bg-white !text-brand hover:bg-brand-light" />
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-base font-bold text-white hover:bg-white/10"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* On-page nav */}
      <nav className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-brand-light hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-20 px-4 py-16 sm:px-6">
        {/* Mission & Vision */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-light text-brand">
              <Rocket className="size-5" />
            </span>
            <h2 className="mt-4 font-logo text-xl font-bold text-neutral-800">Our Mission</h2>
            <p className="mt-2 text-sm text-neutral-600">
              To empower individuals and businesses by providing a trusted marketplace where people can
              confidently buy, sell, and connect within their communities.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-light text-brand">
              <Compass className="size-5" />
            </span>
            <h2 className="mt-4 font-logo text-xl font-bold text-neutral-800">Our Vision</h2>
            <p className="mt-2 text-sm text-neutral-600">
              To become Africa&apos;s most trusted and innovative classifieds marketplace, helping millions
              of people discover opportunities every day.
            </p>
          </div>
        </section>

        {/* What You Can Do */}
        <section id="what-you-can-do" className="scroll-mt-20 space-y-14">
          <h2 className="text-center font-logo text-3xl font-bold text-neutral-800">
            What You Can Do on Flikax
          </h2>

          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-neutral-800">Sell Almost Anything</h3>
              <p className="mt-2 text-neutral-600">
                Create a listing in minutes by uploading photos, adding a description, setting your price,
                and publishing your advert. Reach thousands of potential buyers across your country.
              </p>
              <SellCta label="Create a Listing" className="mt-4" />
            </div>
            <IllustrationCard icon={Tag} />
          </div>

          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div className="order-2 sm:order-1">
              <IllustrationCard icon={Compass} />
            </div>
            <div className="order-1 sm:order-2">
              <h3 className="text-xl font-bold text-neutral-800">Find Great Deals</h3>
              <p className="mt-2 text-neutral-600">
                Browse thousands of listings across multiple categories, including:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand"
                  >
                    {cat}
                  </span>
                ))}
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                  And many more
                </span>
              </div>
            </div>
          </div>

          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-neutral-800">Connect Directly</h3>
              <p className="mt-2 text-neutral-600">
                Communicate with buyers and sellers through Flikax Chat or the contact information provided
                on listings to arrange inspections, negotiate prices, and complete transactions.
              </p>
            </div>
            <IllustrationCard icon={MessageCircle} />
          </div>
        </section>

        {/* Why Choose Flikax */}
        <section className="space-y-8">
          <h2 className="text-center font-logo text-3xl font-bold text-neutral-800">Why Choose Flikax?</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-md">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-light text-brand">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-bold text-neutral-800">{item.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Sell */}
        <section id="how-to-sell" className="scroll-mt-20 grid items-center gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-logo text-3xl font-bold text-neutral-800">How to Sell on Flikax</h2>
            <div className="mt-6">
              <StepList steps={SELL_STEPS} />
            </div>
            <SellCta label="Start Selling" className="mt-6" />
          </div>
          <IllustrationCard icon={Camera} badges={[{ label: "Quick & Easy", position: "top-right" }]} />
        </section>

        {/* How to Buy */}
        <section id="how-to-buy" className="scroll-mt-20 grid items-center gap-10 sm:grid-cols-2">
          <div className="order-2 sm:order-1">
            <IllustrationCard icon={Search} badges={[{ label: "Verified Sellers", position: "bottom-left" }]} />
          </div>
          <div className="order-1 sm:order-2">
            <h2 className="font-logo text-3xl font-bold text-neutral-800">How to Buy on Flikax</h2>
            <div className="mt-6">
              <StepList steps={BUY_STEPS} />
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand-light"
            >
              Browse Listings
            </Link>
          </div>
        </section>

        {/* Safety */}
        <section
          id="safety"
          className="scroll-mt-20 grid items-center gap-10 rounded-3xl bg-white p-8 shadow-lg sm:grid-cols-2 sm:p-10"
        >
          <div>
            <h2 className="font-logo text-3xl font-bold text-neutral-800">Safety Comes First</h2>
            <p className="mt-3 text-neutral-600">
              At Flikax, we&apos;re committed to creating a trusted marketplace. While we work hard to
              detect fraudulent activity and moderate listings, every user also plays an important role in
              keeping the community safe.
            </p>
            <ul className="mt-5 space-y-2.5">
              {SAFETY_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-neutral-700">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                  {tip}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-neutral-500">
              Read more on our <span className="font-bold text-neutral-700">Trust &amp; Safety</span> page.
            </p>
          </div>
          <IllustrationCard
            icon={ShieldCheck}
            badges={[
              { label: "5.0 ★★★★★", position: "top-right" },
              { label: "Verified ID", icon: ShieldCheck, position: "bottom-left" },
            ]}
          />
        </section>

        {/* Premium */}
        <section id="premium" className="scroll-mt-20 grid items-center gap-10 sm:grid-cols-2">
          <IllustrationCard
            icon={Coins}
            tone="amber"
            badges={[
              { label: "VIP", icon: Gem, position: "top-left" },
              { label: "Enterprise", position: "bottom-right" },
            ]}
          />
          <div>
            <h2 className="font-logo text-3xl font-bold text-neutral-800">Premium Services</h2>
            <p className="mt-3 text-neutral-600">
              Businesses and frequent sellers can boost visibility through our premium advertising
              solutions. Premium listings receive increased exposure, helping sellers reach more potential
              buyers and sell faster.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              More premium features will continue to be introduced as Flikax grows.
            </p>
            <Link
              href="/premium"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600"
            >
              <Gem className="size-4" />
              Go Premium
            </Link>
          </div>
        </section>

        {/* Sell like a pro */}
        <section className="rounded-3xl bg-brand-light p-8 sm:p-10">
          <h2 className="text-center font-logo text-3xl font-bold text-neutral-800">Sell Like a Pro!</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {PRO_TIPS.map((tip, i) => (
              <div key={tip.title} className="rounded-2xl bg-white p-5 shadow-md">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-bold text-neutral-800">{tip.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{tip.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <SellCta label="Start Selling" size="lg" icon={Sparkles} />
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mx-auto max-w-2xl text-center">
          <h2 className="font-logo text-3xl font-bold text-neutral-800">Our Commitment</h2>
          <p className="mt-3 text-neutral-600">
            We&apos;re continuously improving Flikax by introducing better search tools, stronger security,
            smarter recommendations, improved seller features, and a faster user experience.
          </p>
          <p className="mt-2 font-semibold text-neutral-700">
            Our goal is to build a marketplace that people trust every day.
          </p>
        </section>
      </main>

      {/* Closing CTA */}
      <section className="bg-brand px-4 py-14 text-center text-white sm:px-6">
        <div className="mx-auto max-w-2xl">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/15 mx-auto">
            <Handshake className="size-6" />
          </span>
          <h2 className="mt-4 font-logo text-2xl font-bold sm:text-3xl">Join the Flikax Community</h2>
          <p className="mt-3 text-white/90">
            Whether you&apos;re buying your first phone, selling your car, renting a property, promoting
            your business, or discovering local opportunities, Flikax is here to help you connect with
            confidence.
          </p>
          <p className="mt-2 font-logo text-lg font-bold">Flikax — Buy. Sell. Discover.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <SellCta label="Start Selling" size="lg" className="bg-white !text-brand hover:bg-brand-light" />
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-base font-bold text-white hover:bg-white/10"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
