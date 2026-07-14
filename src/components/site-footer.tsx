import Link from "next/link";
import { PencilLine } from "lucide-react";
import { PAYMENTS_ENABLED } from "@/lib/payments/config";
import { SellCta } from "@/components/cta/sell-cta";
import { JsonLd } from "@/components/seo/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Flikax",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tema, Accra",
    addressCountry: "GH",
  },
};

const exploreLinks = [
  { label: "Vehicles", href: "/?category=vehicles" },
  { label: "Property", href: "/?category=property" },
  { label: "Electronics", href: "/?category=electronics" },
  { label: "Services", href: "/?category=services" },
];
const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Trust & Safety", href: "/trust-safety" },
  { label: "Contact Us", href: "/contact" },
];
const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="rounded-t-[2.5rem] bg-brand-dark px-6 py-10 text-white sm:px-10 sm:py-12">
      <JsonLd data={localBusinessJsonLd} />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="font-logo text-4xl font-extrabold lowercase sm:text-5xl">flikax</span>
          <p className="text-white/70">Your Trusted Classifieds Marketplace.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-5">
          <div className="col-span-2 space-y-2 sm:col-span-1">
            <span className="font-logo text-xl font-extrabold lowercase">flikax</span>
            <p className="text-sm text-white/70">Accra, Ghana</p>
            <p className="text-sm text-white/50">© 2026 Flikax Inc.</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-white/90">Explore</h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-white/90">Post an Ad</h3>
            <SellCta
              label="Create Your Listing"
              variant="footer"
              icon={PencilLine}
              className="!justify-start !font-medium"
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-white/90">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-white/90">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {PAYMENTS_ENABLED && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              Paystack
            </span>
            <span className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              Flutterwave
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
