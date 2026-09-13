-- AlterTable
ALTER TABLE "books" ADD COLUMN     "external_rank" TEXT,
ADD COLUMN     "external_rating" DECIMAL(3,1),
ADD COLUMN     "external_source" TEXT,
ADD COLUMN     "ownership_format" TEXT NOT NULL DEFAULT 'physical';
