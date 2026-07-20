import Link from "next/link";
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

// Real top-level categories only -- "Jobs" and "Flikax Pay / Delivery" aren't
// actual features, so they're left out entirely rather than linking nowhere.
// "Hobbies" is the closest everyday name for the "Leisure & Activities" category.
const EXPLORE_ROWS: { label: string; category: string }[][] = [
  [
    { label: "Vehicles", category: "vehicles" },
    { label: "Property", category: "property" },
    { label: "Phones", category: "phones-tablets" },
  ],
  [
    { label: "Electronics", category: "electronics" },
    { label: "Fashion", category: "fashion" },
    { label: "Home", category: "home-furniture-appliances" },
  ],
  [
    { label: "Services", category: "services" },
    { label: "Hobbies", category: "leisure-activities" },
  ],
];

// Display name -> the actual supported district name (from GHANA_REGIONS) that
// listing locations are filtered against. Most match the everyday city name
// directly; Koforidua's official district name is "New Juaben South
// Municipal", so that's what the link resolves to even though the label
// stays the name people actually search for.
const CITY_ROWS: { label: string; location: string }[][] = [
  [
    { label: "Accra", location: "Accra Metropolitan" },
    { label: "Kumasi", location: "Kumasi Metropolitan" },
    { label: "Takoradi", location: "Sekondi Takoradi Metropolitan" },
  ],
  [
    { label: "Tamale", location: "Tamale Metropolitan" },
    { label: "Cape Coast", location: "Cape Coast Metropolitan" },
    { label: "Sunyani", location: "Sunyani Municipal" },
  ],
  [
    { label: "Tema", location: "Tema" },
    { label: "Koforidua", location: "New Juaben South Municipal" },
    { label: "Ho", location: "Ho Municipal" },
  ],
];

const BOTTOM_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Protect", href: "/trust-safety" },
];

export function SiteFooter() {
  return (
    <footer className="rounded-t-[2.5rem] bg-brand-dark px-6 py-10 text-white sm:px-10 sm:py-12">
      <JsonLd data={localBusinessJsonLd} />
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          <div className="col-span-2 space-y-3 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-lg font-extrabold">
                F
              </span>
              <span className="font-logo text-xl font-extrabold lowercase">flikax</span>
            </div>
            <p className="max-w-xs text-sm text-white/60">
              Ghana&apos;s premium marketplace. Built in Accra for 2026. Faster, safer, beautifully simple.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">Explore</h3>
            <ul className="space-y-2">
              {EXPLORE_ROWS.map((row, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-white/70">
                  {row.map((item, j) => (
                    <span key={item.category} className="flex items-center gap-x-1.5">
                      {j > 0 && <span className="text-white/30">•</span>}
                      <Link href={`/?category=${item.category}`} className="hover:text-white">
                        {item.label}
                      </Link>
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">Cities</h3>
            <ul className="space-y-2">
              {CITY_ROWS.map((row, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-white/70">
                  {row.map((item, j) => (
                    <span key={item.location} className="flex items-center gap-x-1.5">
                      {j > 0 && <span className="text-white/30">•</span>}
                      <Link href={`/?location=${encodeURIComponent(item.location)}`} className="hover:text-white">
                        {item.label}
                      </Link>
                    </span>
                  ))}
                </li>
              ))}
              <li className="text-sm text-white/70">
                <Link href="/" className="hover:text-white">
                  All Ghana — 16 regions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © 2026 Flikax Inc. <span className="px-1 text-white/30">•</span> Built in Accra{" "}
            <span className="px-1 text-white/30">•</span>{" "}
            <a href="mailto:hello@flikax.com" className="hover:text-white">
              hello@flikax.com
            </a>
          </p>

          <div className="flex items-center gap-5">
            {BOTTOM_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
            <span className="flex items-center gap-1.5 rounded-full bg-lime-400/90 px-2.5 py-1 text-[11px] font-bold text-lime-950">
              <span className="size-1.5 rounded-full bg-lime-950" />
              All systems normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
