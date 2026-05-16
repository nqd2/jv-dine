-- =============================================================================
-- 001 — Restaurant edit fields (Prisma 20260514120000_restaurant_edit_fields)
-- Run before 002. Idempotent for Supabase SQL Editor.
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

SELECT public._jv_add_column_if_missing('restaurants', 'image_url', 'VARCHAR(2048)');
SELECT public._jv_add_column_if_missing('restaurants', 'name_vn', 'VARCHAR(255)');
SELECT public._jv_add_column_if_missing('restaurants', 'description_ja', 'TEXT');
SELECT public._jv_add_column_if_missing('restaurants', 'description_vn', 'TEXT');
SELECT public._jv_add_column_if_missing('restaurants', 'phone', 'VARCHAR(64)');
SELECT public._jv_add_column_if_missing('restaurants', 'cuisine', 'VARCHAR(128)');
SELECT public._jv_add_column_if_missing('restaurants', 'has_wifi', 'BOOLEAN NOT NULL DEFAULT false');
SELECT public._jv_add_column_if_missing('restaurants', 'has_parking', 'BOOLEAN NOT NULL DEFAULT false');
SELECT public._jv_add_column_if_missing('restaurants', 'has_english_support', 'BOOLEAN NOT NULL DEFAULT false');
SELECT public._jv_add_column_if_missing('restaurants', 'accepts_cards', 'BOOLEAN NOT NULL DEFAULT false');
SELECT public._jv_add_column_if_missing('restaurants', 'has_delivery', 'BOOLEAN NOT NULL DEFAULT false');
SELECT public._jv_add_column_if_missing('restaurants', 'accepts_reservations', 'BOOLEAN NOT NULL DEFAULT false');

DROP FUNCTION IF EXISTS public._jv_add_column_if_missing(text, text, text);
