-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "name_vn" VARCHAR(255),
ADD COLUMN "description_ja" TEXT,
ADD COLUMN "description_vn" TEXT,
ADD COLUMN "phone" VARCHAR(64),
ADD COLUMN "cuisine" VARCHAR(128),
ADD COLUMN "has_wifi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "has_parking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "has_english_support" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "accepts_cards" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "has_delivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "accepts_reservations" BOOLEAN NOT NULL DEFAULT false;
