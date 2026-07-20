import Link from "next/link";
import { PencilLine } from "lucide-react";
import { FaXTwitter, FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaApple, FaGooglePlay } from "react-icons/fa6";
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

// No real social accounts exist yet -- these render as plain icons (not
// links to profiles that don't exist).
const socialIcons = [
  { label: "X", icon: FaXTwitter },
  { label: "Facebook", icon: FaFacebookF },
  { label: "Instagram", icon: FaInstagram },
  { label: "TikTok", icon: FaTiktok },
  { label: "LinkedIn", icon: FaLinkedinIn },
];

export function SiteFooter() {
  return (
    <footer className="rounded-t-[2.5rem] bg-[#0F172A] px-6 py-10 text-white sm:px-10 sm:py-12">
      <JsonLd data={localBusinessJsonLd} />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-lg font-extrabold">
              F
            </span>
            <span className="font-logo text-3xl font-extrabold lowercase">flikax</span>
          </div>
          <div className="space-y-1">
            <p className="text-white/70">Your Trusted Classifieds Marketplace.</p>
            <p className="text-sm text-white/50">
              Accra, Ghana <span className="px-1">•</span> © 2026 Flikax Inc.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socialIcons.map(({ label, icon: Icon }) => (
              <span
                key={label}
                title={label}
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/80"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-5">
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

          <div>
            <h3 className="mb-3 text-sm font-bold text-white/90">Get the App</h3>
            <div className="flex flex-col gap-2">
              <span className="flex cursor-default items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                <FaApple className="size-5 shrink-0" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-white/50">Coming Soon</span>
                  <span className="block text-xs font-semibold">App Store</span>
                </span>
              </span>
              <span className="flex cursor-default items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                <FaGooglePlay className="size-4 shrink-0" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-white/50">Coming Soon</span>
                  <span className="block text-xs font-semibold">Google Play</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
