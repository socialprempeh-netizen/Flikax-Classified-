import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
