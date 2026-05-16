-- AlterTable
ALTER TABLE "menus" ADD COLUMN "name_vn" VARCHAR(255),
ADD COLUMN "description" TEXT,
ADD COLUMN "is_japanese_friendly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: add overall rating, backfill from legacy dimensions, then relax legacy columns
ALTER TABLE "reviews" ADD COLUMN "rating" INTEGER;

UPDATE "reviews"
SET "rating" = GREATEST(
  1,
  LEAST(
    5,
    ROUND(
      ("rating_taste" + "rating_cleanliness" + "rating_service")::numeric / 3.0
    )::integer
  )
)
WHERE "rating" IS NULL;

ALTER TABLE "reviews" ALTER COLUMN "rating" SET NOT NULL;

ALTER TABLE "reviews" ALTER COLUMN "rating_taste" DROP NOT NULL,
ALTER COLUMN "rating_cleanliness" DROP NOT NULL,
ALTER COLUMN "rating_service" DROP NOT NULL;
