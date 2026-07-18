-- Performance indexes for the columns the app actually filters/sorts/joins
-- on (search_listings RPC, category browsing, dashboard, moderation,
-- messaging). Written entirely as `CREATE INDEX IF NOT EXISTS` so it's safe
-- to run against a database whose current index state is unknown or partly
-- overlapping -- nothing here can duplicate or conflict with an existing
-- index, it will just no-op for anything already present.
--
-- IMPORTANT -- run in the Supabase SQL Editor ONE STATEMENT AT A TIME
-- (or with "Run selected"), not as one pasted block. `CONCURRENTLY` avoids
-- locking the table for the duration of the build (safe on a live site
-- with real traffic), but Postgres refuses to run CONCURRENTLY inside a
-- transaction block, and the SQL Editor wraps a multi-statement paste in
-- one implicit transaction. If you truly want to run it as a single paste,
-- delete every `CONCURRENTLY` keyword first and accept a brief write lock
-- per index (fine on a small/dev table, not recommended once the listings
-- table has meaningful production traffic).

-- === listings: the hot table ===
-- Every one of these composite indexes leads with `status` because nearly
-- every public-facing query filters `status = 'active'` first -- Postgres
-- can use a composite index for queries that filter on a *prefix* of its
-- columns, so a single (status, category_id, created_at) index also serves
-- plain (status) and (status, category_id) lookups, not just the full
-- three-column filter+sort.

-- search_listings RPC / homepage: filter by category, sort newest-first.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_category_created
  ON listings (status, category_id, created_at DESC);

-- fetchCategoryListings "recommended" sort (is_featured, then bumped_at,
-- then created_at) -- the default sort for every category page.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_featured_bumped
  ON listings (status, is_featured DESC, bumped_at DESC NULLS LAST, created_at DESC);

-- price_asc / price_desc sort, scoped to a category.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_category_price
  ON listings (status, category_id, price);

-- Location filter (homepage's LocationPickerModal, exclude-location) and
-- the district-scoped listing pages under /[category]/[slug].
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_location
  ON listings (status, location);

-- Dashboard / my-adverts: "all of my listings regardless of status".
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_user_id
  ON listings (user_id);

-- Listing detail page canonical lookup (getListingByShortId). UNIQUE
-- because short_id is meant to be a stable per-listing identifier already
-- -- if this fails because a unique index already exists under a
-- different name, that's fine, it means this is already covered.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_short_id
  ON listings (short_id);

-- Admin: expiry sweeps / "extend expiry" queries.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_expires_at
  ON listings (expires_at)
  WHERE expires_at IS NOT NULL;

-- search_listings' word_similarity(title) fuzzy match needs pg_trgm's
-- trigram index to avoid a sequential scan on every free-text search.
-- (no-op if pg_trgm isn't enabled -- enable it first if this errors:
--   CREATE EXTENSION IF NOT EXISTS pg_trgm;)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_title_trgm
  ON listings USING gist (title gist_trgm_ops);

-- === categories ===
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug
  ON categories (slug);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id
  ON categories (parent_id);

-- === locations ===
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_district_slug
  ON locations (district_slug);

-- === saved_listings: toggle-save lookup + "my saved ads" page ===
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_listings_user_listing
  ON saved_listings (user_id, listing_id);

-- === conversations: unread-badge / inbox queries (buyer OR seller) ===
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_buyer_id
  ON conversations (buyer_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_seller_id
  ON conversations (seller_id);

-- === messages: fetching a conversation's history ===
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id
  ON messages (conversation_id, created_at);

-- === listing_images: gallery/cover-photo lookups ===
-- Postgres does NOT automatically index foreign key columns (only PRIMARY
-- KEY / UNIQUE constraints get an index for free) -- this one is easy to
-- miss since every listing card and gallery joins through it.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listing_images_listing_id
  ON listing_images (listing_id, position);

-- === reports / moderation ===
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_listing_reporter
  ON reports (listing_id, reporter_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_flags_listing_id
  ON listing_moderation_flags (listing_id);

-- === Verification ===
-- After running, confirm what's actually there and check for any that
-- Postgres decided not to use (idx_scan = 0 after a few days of real
-- traffic is worth investigating, not necessarily worth dropping):
--
--   select schemaname, relname, indexrelname, idx_scan, idx_tup_read
--   from pg_stat_user_indexes
--   where schemaname = 'public'
--   order by idx_scan asc;
--
-- Or list all indexes on a specific table:
--
--   select indexname, indexdef from pg_indexes where tablename = 'listings';
