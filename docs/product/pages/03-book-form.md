# Add / Edit Book Page

## Purpose

Let the user create or update a book with both practical metadata and personal
reading notes.

## Current State

The current add form supports title, author, category, language, description,
personal review, personal note, recommendation, location, purchase date,
purchase price, and cover photo upload. It is currently a long vertical stack.

## Wanted State

The form should support the full book model while staying manageable:

- Core identity: cover, title, author, category/type, language.
- Bibliographic metadata: ISBNs, publisher, publication date/year, edition,
  format, page count, series, contributors, tags, genres, subjects, and
  audience.
- Timeline metadata: original writing/composition date or era, historical
  period, setting date/period, print date, and date precision.
- Library state: owned, wishlist, want to read, want to buy, saved for later,
  favorite, saved list/project label, and priority.
- Area metadata: media type, global area level when relevant, and optional
  association with collection areas.
- Ownership: none/physical/ebook/both, physical status, current location for
  physical copies, unknown location, and lost state.
- Reading notes: reading status, dates started/finished, personal rating,
  review, recommendation, quotes, content warnings, and personal notes.
- Description/spoiler: public-style description and private spoiler/summary
  notes kept visually distinct.
- External metadata: external rating, external rank, and external source such
  as Amazon when known/imported.
- External ids/import review: source URL, Amazon ASIN, Google Books ID, Open
  Library ID, Goodreads ID, LibraryThing ID, metadata confidence, metadata
  reviewed date, and duplicate flags.
- Physical/ebook details: condition, inventory code, barcode, copy notes,
  dimensions, weight, ebook format, ebook source, ebook file path, and DRM
  status.
- Purchase info: purchase date, price, currency, and acquisition source.
- Approximate purchase/acquisition date text when the exact date is unknown.

## Child Component Specs

- `../components/book-form/metadata-fields.md`
- `../components/book-form/ownership-and-location.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Upload or replace cover photo.
- Enter required title and author.
- Choose or type category/type.
- Choose ownership format.
- Choose whether the record is owned, wishlist, want-to-read, want-to-buy, or
  saved for a project/learning goal.
- Mark a book as favorite or saved for a specific list/project.
- Add/remove the book from collection areas and set an area level where
  appropriate.
- Assign a physical location if needed.
- Add notes, rating, review, recommendation, description, and spoiler notes.
- Add bibliographic, contributor, classification, physical-copy, ebook, and
  external-id metadata.
- Add purchase info.
- Add external rating/rank if known.
- Save changes.

## Data Shown

- All editable book fields.
- Selected cover file name or preview.
- Validation errors.
- Save/submitting state.

## States

- New book.
- Editing existing book.
- Saving.
- Save error.
- Validation error.

## UX Notes

Group fields into sections. Avoid one flat stack. Use Angular Material form
fields, selects, checkboxes, expansion panels, or tabs as needed. Keep Phase 1
clear and functional; save premium layout and motion for Phase 2.
