-- AlterTable
ALTER TABLE "books" ADD COLUMN     "acquisition_source" TEXT,
ADD COLUMN     "acquisition_type" TEXT,
ADD COLUMN     "audience" TEXT,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "content_warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "contributors" JSONB,
ADD COLUMN     "copy_notes" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "drm_status" TEXT,
ADD COLUMN     "duplicate_group_id" TEXT,
ADD COLUMN     "ebook_file_path" TEXT,
ADD COLUMN     "ebook_format" TEXT,
ADD COLUMN     "ebook_source" TEXT,
ADD COLUMN     "edition" TEXT,
ADD COLUMN     "editor" TEXT,
ADD COLUMN     "external_ids" JSONB,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "illustrator" TEXT,
ADD COLUMN     "inventory_code" TEXT,
ADD COLUMN     "isbn_10" TEXT,
ADD COLUMN     "isbn_13" TEXT,
ADD COLUMN     "metadata_confidence" TEXT,
ADD COLUMN     "metadata_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "metadata_status" TEXT NOT NULL DEFAULT 'complete',
ADD COLUMN     "original_language" TEXT,
ADD COLUMN     "original_title" TEXT,
ADD COLUMN     "page_count" INTEGER,
ADD COLUMN     "personal_notes" TEXT,
ADD COLUMN     "possible_duplicate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publication_year" INTEGER,
ADD COLUMN     "publisher" TEXT,
ADD COLUMN     "purchase_date_text" TEXT,
ADD COLUMN     "quotes" JSONB,
ADD COLUMN     "series_name" TEXT,
ADD COLUMN     "series_number" TEXT,
ADD COLUMN     "source_url" TEXT,
ADD COLUMN     "spoiler_notes" TEXT,
ADD COLUMN     "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "translator" TEXT,
ADD COLUMN     "weight" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "book_loans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "borrower_name" TEXT NOT NULL,
    "borrowed_at" TIMESTAMP(3) NOT NULL,
    "returned_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_timeline_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT,
    "event_type" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_areas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_area_books" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "area_level" TEXT,
    "priority" TEXT,
    "relation_status" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_area_books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_area_books_area_id_book_id_key" ON "collection_area_books"("area_id", "book_id");

-- AddForeignKey
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_timeline_events" ADD CONSTRAINT "book_timeline_events_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_area_books" ADD CONSTRAINT "collection_area_books_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "collection_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_area_books" ADD CONSTRAINT "collection_area_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
