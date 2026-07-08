# Flikax — Build Brief for Claude Code

## Project Summary
Clone jiji.com.gh's core classifieds functionality, simplified, branded as **Flikax**, launching nationwide in Ghana. Free for first 7 months, monetization built-in but toggled off at launch.

## Reference
Primary UI/UX reference: **jiji.com.gh** (live site — study layout, category nav, listing cards, post flow)

## Branding
- Name: Flikax (lowercase "flikax" for logo/wordmark)
- Domain: flikax.com
- Color: #1DA1F2 (old Twitter blue) — set as primary brand color in Tailwind config
- Font: Baloo 2 (chunky, rounded, approachable — matches Jiji's style). Load via `next/font/google`, not CSS @import
- Logo: lowercase wordmark, white text on #1DA1F2 background, Baloo 2 ExtraBold. See flikax-logo.svg
- Icon/favicon: separate square version needed — single "f" centered, same color/font treatment (not yet built)

## Tech Stack
- Frontend: Next.js 15 (App Router), Tailwind CSS, shadcn/ui
- Backend/DB: Supabase (Postgres, Auth, Storage, Realtime)
- Search: Meilisearch or Algolia (location + category filters)
- Payments: Paystack + Flutterwave (integrated, disabled via feature flag)
- Image processing: Sharp (server-side watermarking)
- Hosting: Vercel (frontend) + Supabase (backend)
- Security: Cloudflare (DDoS/bot protection) in front of the app

## Core Features (Build)
1. User signup/login with phone number verification
2. Post listing: photo(s), title, price, category, location, description
3. Auto-watermark on every uploaded image (Flikax logo stamp)
4. Perceptual image hash check — flag duplicate/stolen images on upload
5. Browse/search: category + location + price filters, fast typo-tolerant search
6. Listing detail page
7. In-app chat (buyer/seller), phone number hidden until both parties agree
8. Direct call button (optional alongside chat)
9. Flattened category structure (max 2 levels deep)
10. "Mark as sold" button on listings
11. Admin dashboard: moderate/approve/delete listings, manage users, view analytics by category/city, seed-content tracking
12. Paystack/Flutterwave integration — fully wired, controlled by `payments_enabled` config flag (default: false)
13. Subscription/Featured-listing tier — one simple paid tier only, built but hidden until `payments_enabled = true`
14. "Share to WhatsApp" button on every listing (pre-formatted message + link)
15. Seller "last active" / response-rate badge

## Explicitly Excluded (do not build)
- Jobs board
- Services marketplace
- Fashion/store verticals
- Safety tips popup
- "Similar ads" section
- "Request a callback" feature
- Search-within-chats
- Multi-tier ad promotion system (Top/VIP/Diamond) — one "Featured" tier only
- Non-essential notifications (keep only: new message, new call)

## Launch Plan
- Phase 1: Build core app, payments dormant, no business registration needed yet
- Phase 2: Seed 50-100 listings per category using hired listers (staggered posting, varied formatting to look organic)
- Phase 3: Launch free, WhatsApp/Facebook group + local radio/community push
- Phase 4 (~month 7): Register business, verify Paystack/Flutterwave, enable payments flag, launch Featured tier at ~40-50% below Jiji's pricing

## Build Sequence (suggested order for Claude Code)
1. Auth + phone verification
2. Listing post flow + image upload/watermarking
3. Browse/search + category structure
4. Listing detail page + chat
5. Admin dashboard
6. Payments/subscription (built, flagged off)
7. Polish: WhatsApp share, badges, notifications
