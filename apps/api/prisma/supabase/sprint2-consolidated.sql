-- =============================================================================
-- jv-dine Sprint 2 — Supabase PostgreSQL migration (consolidated)
-- =============================================================================
--
-- Mirrors Prisma migrations (in order):
--   20260514120000_restaurant_edit_fields
--   20260515120000_menu_review_fields
--
-- Safe to re-run in Supabase SQL Editor: uses IF NOT EXISTS / conditional blocks.
-- Does NOT modify Prisma _prisma_migrations; run this manually on Supabase only.
--
-- MANUAL STEPS (Supabase Dashboard):
--   1. Project → SQL → New query
--   2. Paste this entire file → Run
--   3. Verify with the queries at the bottom of this file
--   4. Confirm to the team before API/endpoint QA
--
-- Prerequisite: base schema from init (roles, users, restaurants, menus, reviews, …).
-- If image_url on restaurants is missing, it is added idempotently in section 0.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: add a column only when it does not exist (public schema)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._jv_add_column_if_missing(
  p_table text,
  p_column text,
  p_definition text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = p_table
      AND c.column_name = p_column
  ) THEN
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN %I %s',
      p_table,
      p_column,
      p_definition
    );
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- Section 0: restaurants.image_url (Prisma 20260509163342 — often already applied)
-- -----------------------------------------------------------------------------
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'image_url',
  'VARCHAR(2048)'
);

-- -----------------------------------------------------------------------------
-- Section 1: Restaurant edit fields (Prisma 20260514120000_restaurant_edit_fields)
-- Owner edit / register: JP+VN names, descriptions, contact, amenities
-- -----------------------------------------------------------------------------
SELECT public._jv_add_column_if_missing('restaurants', 'name_vn', 'VARCHAR(255)');
SELECT public._jv_add_column_if_missing('restaurants', 'description_ja', 'TEXT');
SELECT public._jv_add_column_if_missing('restaurants', 'description_vn', 'TEXT');
SELECT public._jv_add_column_if_missing('restaurants', 'phone', 'VARCHAR(64)');
SELECT public._jv_add_column_if_missing('restaurants', 'cuisine', 'VARCHAR(128)');
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'has_wifi',
  'BOOLEAN NOT NULL DEFAULT false'
);
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'has_parking',
  'BOOLEAN NOT NULL DEFAULT false'
);
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'has_english_support',
  'BOOLEAN NOT NULL DEFAULT false'
);
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'accepts_cards',
  'BOOLEAN NOT NULL DEFAULT false'
);
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'has_delivery',
  'BOOLEAN NOT NULL DEFAULT false'
);
SELECT public._jv_add_column_if_missing(
  'restaurants',
  'accepts_reservations',
  'BOOLEAN NOT NULL DEFAULT false'
);

-- -----------------------------------------------------------------------------
-- Section 2: Menu fields (Prisma 20260515120000_menu_review_fields — menus part)
-- Sprint 2 menu CRUD: Vietnamese name, description, Japanese-friendly badge
-- -----------------------------------------------------------------------------
SELECT public._jv_add_column_if_missing('menus', 'name_vn', 'VARCHAR(255)');
SELECT public._jv_add_column_if_missing('menus', 'description', 'TEXT');
SELECT public._jv_add_column_if_missing(
  'menus',
  'is_japanese_friendly',
  'BOOLEAN NOT NULL DEFAULT false'
);

-- -----------------------------------------------------------------------------
-- Section 3: Review overall rating 1–5 (Prisma 20260515120000 — reviews part)
-- UI spec: single 1–5 star rating; legacy 3-dimension columns become optional
-- -----------------------------------------------------------------------------
SELECT public._jv_add_column_if_missing('reviews', 'rating', 'INTEGER');

-- Backfill overall rating from legacy taste/cleanliness/service (average → 1–5)
UPDATE public.reviews
SET rating = GREATEST(
  1,
  LEAST(
    5,
    ROUND(
      (rating_taste + rating_cleanliness + rating_service)::numeric / 3.0
    )::integer
  )
)
WHERE rating IS NULL
  AND rating_taste IS NOT NULL
  AND rating_cleanliness IS NOT NULL
  AND rating_service IS NOT NULL;

-- Rows with no legacy data: default to neutral 3 (only if still null)
UPDATE public.reviews
SET rating = 3
WHERE rating IS NULL;

-- Enforce NOT NULL on rating (matches Prisma schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'reviews'
      AND column_name = 'rating'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.reviews
      ALTER COLUMN rating SET NOT NULL;
  END IF;
END;
$$;

-- Legacy dimension columns: nullable (Prisma: rating_taste?, rating_cleanliness?, rating_service?)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'rating_taste'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.reviews ALTER COLUMN rating_taste DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'rating_cleanliness'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.reviews ALTER COLUMN rating_cleanliness DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'rating_service'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.reviews ALTER COLUMN rating_service DROP NOT NULL;
  END IF;
END;
$$;

-- Optional integrity: overall rating in 1–5 (PLAN spec; not in Prisma migration SQL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_rating_range_check'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_rating_range_check
      CHECK (rating >= 1 AND rating <= 5);
  END IF;
END;
$$;

-- Drop helper (keep DB tidy)
DROP FUNCTION IF EXISTS public._jv_add_column_if_missing(text, text, text);

-- =============================================================================
-- Verification (run separately after migration; read-only)
-- =============================================================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'restaurants'
--   AND column_name IN (
--     'name_vn', 'description_ja', 'description_vn', 'phone', 'cuisine',
--     'has_wifi', 'has_parking', 'has_english_support', 'accepts_cards',
--     'has_delivery', 'accepts_reservations', 'image_url'
--   )
-- ORDER BY column_name;
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'menus'
--   AND column_name IN ('name_vn', 'description', 'is_japanese_friendly')
-- ORDER BY column_name;
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'reviews'
--   AND column_name IN (
--     'rating', 'rating_taste', 'rating_cleanliness', 'rating_service'
--   )
-- ORDER BY column_name;
--
-- SELECT conname FROM pg_constraint
-- WHERE conrelid = 'public.reviews'::regclass AND conname = 'reviews_rating_range_check';
