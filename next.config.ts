import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Explicit allowlist rather than leaving arbitrary quality values open
    // (Next.js otherwise accepts any integer, which is an easy resource-
    // exhaustion vector -- an attacker requesting a distinct quality on
    // every request generates a fresh cached variant each time). 75 is
    // Next's own default for anything that doesn't set `quality`; 82 is
    // used specifically for listing photos, which are already a
    // once-compressed WebP (see watermark.ts) -- re-encoding them a second
    // time at the framework default of 75 would compound quality loss more
    // than necessary for source images that were already optimized once.
    qualities: [75, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
        pathname: "/storage/v1/object/public/**",
      },
      // A large share of current listing_images rows are seed/demo data using
      // placehold.co placeholder images rather than real uploads through the
      // pipeline — real uploads only ever land on the Supabase host above.
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  async rewrites() {
    return [
      // Next.js dynamic segments can't be mixed with a literal prefix/suffix
      // in a single folder name (no "sitemap-[category].xml" route), so the
      // human-readable /sitemap-vehicles.xml URLs are rewritten internally to
      // a normal [category] dynamic route.
      { source: "/sitemap-:category.xml", destination: "/sitemap-category/:category" },
    ];
  },
};

export default nextConfig;
