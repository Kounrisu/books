-- AlterTable
ALTER TABLE "books" ADD COLUMN     "library_status" TEXT NOT NULL DEFAULT 'owned',
ADD COLUMN     "reading_status" TEXT NOT NULL DEFAULT 'unread';
