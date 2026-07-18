-- Performance indexes -- revised after inspecting the live database via the
-- Supabase CLI (project yrpwlbemtyxrzjlobilt). The first draft of this file
-- was written without visibility into current index state and assumed
-- several columns were unindexed; they weren't, just named differently
-- (Postgres's CREATE INDEX IF NOT EXISTS checks by *name*, not by
-- equivalent definition, so re-running the original draft would have
-- created redundant duplicate indexes rather than skipping them). This
-- version only adds indexes for confirmed real gaps, and does not touch
-- anything that already exists correctly -- including two cases where the
-- existing index encodes real business logic more precisely than a naive
-- version would (see the locations/reports notes below).
--
-- Already present and NOT duplicated here:
--   listings_status_idx, listings_category_id_idx, listings_user_id_idx,
--   listings_short_id_idx (unique), listings_featured_idx (partial:
--   is_featured, featured_until WHERE is_featured = true),
--   listings_title_trgm_idx (functional: lower(title) gin_trgm_ops --
--   matches search_listings' word_similarity(lower(...)) exactly; a plain
--   `title` trigram index, which the original draft proposed, would NOT
--   have been usable by that query at all since it doesn't match the
--   lower() expression)
--   categories_slug_key (unique), categories_parent_id_idx
--   conversations_buyer_id_idx, conversations_seller_id_idx
--   messages_conversation_id_created_at_idx
--   listing_images_listing_id_idx
--   saved_listings_user_id_listing_id_key (unique), saved_listings_user_id_idx
--   reports_reporter_listing_open_uidx -- a PARTIAL unique index scoped to
--     WHERE status = 'open', which correctly allows a second report from
--     the same person on the same listing once the first is resolved. The
--     original draft's plain unconditional unique index would have been a
--     real behavior regression (blocking legitimate re-reports) and could
--     have failed to create outright if any such re-report already exists.
--
-- IMPORTANT -- run ONE STATEMENT AT A TIME in the SQL Editor (or "Run
-- selected"), not as one pasted block. CONCURRENTLY avoids locking the
-- table for the build, but Postgres refuses to run it inside a transaction
-- block, and the SQL Editor wraps a multi-statement paste in one implicit
-- transaction.

-- listings: no composite covers (status, category_id, created_at) -- every
-- category browse + "newest" sort currently falls back to the single-column
-- status/category_id indexes separately rather than one composite scan.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_category_created
  ON listings (status, category_id, created_at DESC);

-- fetchCategoryListings' default "recommended" sort (is_featured, then
-- bumped_at, then created_at) has no matching index -- the existing
-- listings_featured_idx is a *partial* index for a different purpose
-- (quickly finding currently-featured listings / checking featured_until),
-- not this three-column sort order.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_featured_bumped
  ON listings (status, is_featured DESC, bumped_at DESC NULLS LAST, created_at DESC);

-- price_asc / price_desc sort scoped to a category -- nothing covers this.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_category_price
  ON listings (status, category_id, price);

-- Location filtering (homepage LocationPickerModal, exclude-location, and
-- the district-scoped pages under /[category]/[slug]) -- confirmed there is
-- currently NO index on `location` at all.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_location
  ON listings (status, location);

-- Admin expiry sweeps / "extend expiry" -- no index on expires_at.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_expires_at
  ON listings (expires_at)
  WHERE expires_at IS NOT NULL;

-- === locations ===
-- resolveRoute() looks up a listing's location by district_slug ALONE (no
-- region_slug in the filter). The existing unique index is on the
-- *composite* (region_slug, district_slug), whose leftmost column is
-- region_slug -- Postgres can't use a composite index to serve a lookup
-- that only filters on its second column, so this exact query pattern is
-- currently unindexed. Deliberately NOT unique: district_slug alone isn't
-- guaranteed globally unique (that's exactly why the existing constraint is
-- scoped to the region_slug + district_slug pair) -- a standalone unique
-- index here could fail outright, or silently over-constrain future data.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_district_slug
  ON locations (district_slug);

-- === listing_moderation_flags ===
-- Confirmed genuinely missing -- only a primary key index exists on this
-- table today, so the moderation queue's listing_id lookups/joins scan.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_flags_listing_id
  ON listing_moderation_flags (listing_id);

-- === Verification ===
--   select schemaname, relname, indexrelname, idx_scan, idx_tup_read
--   from pg_stat_user_indexes
--   where schemaname = 'public'
--   order by idx_scan asc;
