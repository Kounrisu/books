# Import / Export: File Format

## Parent Page

`docs/product/pages/07-import-export.md`

## Purpose

Define how library data leaves the app, gets enriched by AI, and comes back
without corrupting the database.

## Current State

No import/export exists.

## Wanted State

Support:

- CSV export/import for flat book metadata.
- CSV export/import for incomplete placeholder records created by bulk photo
  import.
- JSON export/import for nested data such as locations and borrowing history.
- Stable identifiers for existing rows.
- Cover image filename/path fields so AI-enriched rows can map back to the
  right photo-created placeholder book.
- Complete book metadata fields, including bibliographic data, contributors,
  tags/genres/subjects, reading status, ownership/format/condition,
  physical-copy data, ebook data, purchase/acquisition data, external ids, and
  AI metadata review fields.
- Collection area data, including areas, kind, objectives, notes,
  area-book associations, media types, area levels, area-specific priority, and
  area-specific notes.
- Timeline/history data, including reading history, acquisition history,
  external borrow/rental records, due dates, return dates, and lending history.
- Import preview before applying changes.
- Row-level validation errors.

## Acceptance Criteria

- Exported files are human-editable.
- Imported data validates required fields.
- Existing rows can be updated without duplicating everything.
- Placeholder books from bulk photo imports can be completed through import.
- All rich metadata fields can round-trip through export/import without data
  loss.
- User ownership boundaries are preserved.
- Import reports create/update/error counts.

## UX Notes

This is a power-user/admin workflow. It can be practical and plain in Phase 1.
