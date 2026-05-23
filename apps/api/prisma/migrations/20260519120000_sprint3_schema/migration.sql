-- AlterTable
ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(64),
ADD COLUMN "location" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "avatar_url" VARCHAR(2048);

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "views_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN "name_ja" VARCHAR(255),
ADD COLUMN "name_vn" VARCHAR(255),
ADD COLUMN "description_ja" TEXT,
ADD COLUMN "description_vn" TEXT,
ADD COLUMN "discount_type" VARCHAR(32) NOT NULL DEFAULT 'percentage',
ADD COLUMN "discount_value" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "start_date" DATE,
ADD COLUMN "usage_limit" INTEGER,
ADD COLUMN "status" VARCHAR(32) NOT NULL DEFAULT 'active',
ADD COLUMN "views_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "usages_count" INTEGER NOT NULL DEFAULT 0;

UPDATE "coupons" SET "discount_value" = "discount_rate" WHERE "discount_value" = 0;

-- CreateTable
CREATE TABLE "user_favorites" (
    "user_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("user_id","restaurant_id")
);

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
