import { NextResponse } from "next/server";
import { buildUrlsetXml, XML_HEADERS } from "@/lib/sitemap-xml";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PAGES = ["", "/about", "/contact", "/privacy", "/terms", "/trust-safety"];

export async function GET() {
  const entries = STATIC_PAGES.map((path) => ({
    loc: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "hourly" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));

  return new NextResponse(buildUrlsetXml(entries), { headers: XML_HEADERS });
}
