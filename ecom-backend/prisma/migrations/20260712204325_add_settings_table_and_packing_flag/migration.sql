-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "requires_packing" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "settings" (
    "id" BIGSERIAL NOT NULL,
    "delivery_charge_enabled" BOOLEAN NOT NULL DEFAULT false,
    "delivery_charge_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "packing_charge_enabled" BOOLEAN NOT NULL DEFAULT false,
    "packing_charge_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
