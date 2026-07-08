# Flikax

Classifieds marketplace for Ghana. Next.js 15 (App Router) + Tailwind CSS + Supabase.

## Getting Started

Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Stack

- Next.js 15 (App Router), TypeScript
- Tailwind CSS v4 — brand color `--color-brand` (`#1DA1F2`) set in `src/app/globals.css`
- Font: Baloo 2, loaded via `next/font/google` in `src/app/layout.tsx`
- Supabase client helpers in `src/lib/supabase/` (`client.ts` for the browser, `server.ts` for server components, `middleware.ts` for session refresh)
- Supabase project: `flikax` (ref `yrpwlbemtyxrzjlobilt`, region `eu-west-1`)

## Auth

Phone number sign-up/login lives at `/auth/login` (`src/components/auth/phone-auth-form.tsx`): enter a Ghana phone number → verify the 6-digit SMS code → set a display name on first sign-up. Backed by Supabase Auth phone OTP and a `profiles` table (id, phone, full_name) with RLS and an auto-provisioning trigger on `auth.users` insert.

**Before OTP codes can actually send:** enable the Phone provider and configure an SMS provider (Twilio, MessageBird, Vonage, etc.) with your own account in the [Supabase dashboard](https://supabase.com/dashboard/project/yrpwlbemtyxrzjlobilt/auth/providers) — Authentication → Providers → Phone. Until then, `signInWithOtp` returns "Unsupported phone provider".

## Posting a listing

`/sell` (`src/components/listings/listing-form.tsx`) is a two-step wizard shared with the edit flow (`/my-adverts/[id]/edit`):

- **Step 1**: category + subcategory (required first, since it drives which fields show next), category-specific dynamic fields, description, price, negotiable (yes/no/not sure).
- **Step 2**: title, category (read-only recap with a "Change" link back to step 1), location, up to 6 photos, optional video link.
- **Dynamic fields**: defined per top-level category in `src/lib/listing-fields.ts` (e.g. Vehicles gets make/model/year/color/condition/transmission/VIN/registered/exchange-possible; Property gets bedrooms/bathrooms/furnished/type; etc.) and stored in `listings.attributes` (jsonb) — add a category or field by editing that one config file, no migration needed.
- **Images**: uploaded to `POST /api/listings/images`, which runs server-side in the Node runtime, watermarks the photo with Sharp (resizes to max 1600px, stamps a semi-transparent "flikax" pill in the bottom-right corner), and stores the result in the `listing-images` Supabase Storage bucket under `{user_id}/{uuid}.jpg`.
- **Data model**: `categories` (flattened, 2 levels — 5 top-level, 16 subcategories, seeded), `listings` (+ `attributes` jsonb, `negotiable`, `video_url`, `declined_reason`), `listing_images`. All RLS-protected (owners can manage their own; everyone can read active listings, owners can also read their own non-active ones).
- Perceptual-hash duplicate detection isn't built yet — later build-sequence step.

## Dashboard

`/dashboard` (`src/app/dashboard/layout.tsx` + `page.tsx`) is the signed-in user's account hub: a sidebar (profile card, a declined-ads alert card, and a menu of account features — most still "Coming soon" placeholders) plus the "Manage My Listings" panel, tabbed **Active / Declined / Closed** (closed = sold + removed) with a category filter, Edit (→ the wizard above in edit mode) and Delete (server action, confirm-gated). "Declined" is schema-ready (`listings.status = 'declined'`, `declined_reason`) but nothing sets it yet — that lands with the admin moderation dashboard (a later build-sequence step). The old `/my-adverts` route now just redirects here (preserving `tab`/`category` params) for backwards compatibility; the edit route itself is unchanged at `/my-adverts/[id]/edit`.

## Settings

`/settings`: personal details (name, location, birthday, sex → `profiles`), a static "Verified ID" badge placeholder (no verification workflow built), change phone (OTP-gated, same SMS-provider dependency as login), change email (Supabase's built-in confirmation email — no custom confirmation-landing page built), change password, notification toggles (new message / new call — matches the brief's notification scope), log out, and delete-account.

**Delete account** calls `supabase.auth.admin.deleteUser` via a service-role-gated server action (`src/app/settings/actions.ts`, `src/lib/supabase/admin.ts`) — this needs `SUPABASE_SERVICE_ROLE_KEY` set as a **server-only** env var (see `.env.example`; get it from Supabase dashboard → Project Settings → API). Until set, the button surfaces a clear "not configured yet" error instead of failing silently.

## Browse & search

The homepage (`src/app/page.tsx`) is the browse/search surface, driven entirely by URL query params (`q`, `location`, `category`, `minPrice`, `maxPrice`) so every filter combination is a plain, linkable, server-rendered GET — no client JS required.

- **Search**: `public.search_listings(...)` (Postgres function) does typo-tolerant matching via `pg_trgm` `word_similarity()` (threshold tuned to `> 0.25` — catches real typos like "ihpone" → iPhone and "corola" → Corolla without matching unrelated titles) plus an `ILIKE` fallback, combined with category/location/price filters, ranked by match quality then recency.
- **Category structure**: sidebar (`category-sidebar.tsx`) shows the 5 top-level categories with live counts (`public.category_counts()`, parent totals include child categories). Selecting one filters listings and shows a breadcrumb + subcategory chips (`listings/filter-bar.tsx`) to drill down or move across siblings — all via `src/lib/filters.ts`'s `buildListingsHref`, which preserves the other active filters.
- Verified against seeded test data (inserted and removed via SQL) across all four filter types before confirming — see conversation for screenshots.

See `flikax-build-brief.md` for the full product/tech brief.
