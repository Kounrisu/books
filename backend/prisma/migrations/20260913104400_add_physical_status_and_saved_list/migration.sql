-- AlterTable
ALTER TABLE "books" ADD COLUMN     "physical_status" TEXT NOT NULL DEFAULT 'in_collection',
ADD COLUMN     "saved_list" TEXT;
