-- AlterTable
ALTER TABLE "eventinfo" ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
