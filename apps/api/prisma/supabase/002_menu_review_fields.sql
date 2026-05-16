-- =============================================================================
-- 002 — Menu + review fields (Prisma 20260515120000_menu_review_fields)
-- Requires 001 (or equivalent restaurant columns). Idempotent for Supabase.
-- =============================================================================

CREATE OR REPLACE FUNCTION public._jv_add_column_if_missing(
  p_table text,
  p_column text,
  p_definition text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = p_table
      AND c.column_name = p_column
  ) THEN
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN %I %s',
      p_table, p_column, p_definition
    );
  END IF;
END;
$$;

-- Menus: name_vn, description, is_japanese_friendly
SELECT public._jv_add_column_if_missing('menus', 'name_vn', 'VARCHAR(255)');
SELECT public._jv_add_column_if_missing('menus', 'description', 'TEXT');
SELECT public._jv_add_column_if_missing(
  'menus', 'is_japanese_friendly', 'BOOLEAN NOT NULL DEFAULT false'
);

-- Reviews: overall rating 1–5
SELECT public._jv_add_column_if_missing('reviews', 'rating', 'INTEGER');

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

UPDATE public.reviews SET rating = 3 WHERE rating IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews'
      AND column_name = 'rating' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.reviews ALTER COLUMN rating SET NOT NULL;
  END IF;
END;
$$;

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

DROP FUNCTION IF EXISTS public._jv_add_column_if_missing(text, text, text);
