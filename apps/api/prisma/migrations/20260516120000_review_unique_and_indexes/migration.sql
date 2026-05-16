-- CreateIndex
CREATE INDEX IF NOT EXISTS "menus_restaurant_id_idx" ON "menus"("restaurant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reviews_restaurant_id_idx" ON "reviews"("restaurant_id");

-- Deduplicate existing reviews before unique constraint (keep newest per user + restaurant)
DELETE FROM "reviews" AS r
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, restaurant_id
        ORDER BY created_at DESC, id DESC
      ) AS rn
    FROM "reviews"
  ) ranked
  WHERE ranked.rn > 1
) AS duplicates
WHERE r.id = duplicates.id;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_restaurant_id_key" ON "reviews"("user_id", "restaurant_id");
