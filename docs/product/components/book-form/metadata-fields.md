# Book Form: Metadata Fields

## Parent Page

`docs/product/pages/03-book-form.md`

## Purpose

Capture the full metadata needed to describe, sort, filter, and enrich a book.

## Current State

The form captures basic metadata but is presented as one long vertical stack.

## Wanted State

Group metadata into clear sections:

- Core identity: cover, title, subtitle, original title, author, category/type,
  language, and original language.
- Bibliographic metadata: ISBN-10, ISBN-13, publisher, published date,
  publication year, edition, page count, series name, and series number.
- Timeline metadata: original year/date text, historical period, setting date
  text, print date, and date precision.
- Contributors: translator, illustrator, editor, and other contributors.
- Classification: tags, genres, subjects, and audience.
- Description: spoiler-free description.
- Private notes: spoiler/summary notes and personal notes.
- Review: personal review, personal note/rating, recommendation, favorite
  quotes/passages, and content warnings.
- Reading status: unread, reading, read, abandoned, reference only, date
  started, and date finished.
- Physical copy: format, condition, inventory code, barcode, copy notes,
  dimensions, and weight.
- Ebook metadata: ebook format, ebook source, ebook file path, and DRM status.
- External metadata: external rating, external rank, external source.
- External ids: Amazon ASIN, Google Books ID, Open Library ID, Goodreads ID,
  LibraryThing ID, source URL, and other identifiers.
- AI/import review: metadata confidence, metadata reviewed date, duplicate
  group, and possible duplicate flag.
- Area metadata: media type, global area level where relevant, and optional
  collection-area associations.
- Purchase metadata: purchase date, purchase price, currency, and acquisition
  source, plus approximate purchase/acquisition date text when the exact date is
  unknown.

## Acceptance Criteria

- Title and author are required.
- Optional fields can be left empty.
- Personal rating and external rating are visually distinct.
- Spoiler notes are not confused with spoiler-free description.
- Long text fields are comfortable to type into.
- Dense bibliographic fields are grouped/collapsible so the form stays usable.
- External ids and AI/import fields can be edited but do not dominate the
  everyday add-book flow.

## UX Notes

Use Material form fields and section grouping in Phase 1. Avoid a single flat
form wall.
