# Photo Import Page

## Purpose

Let the user import one or many book cover photos quickly, create placeholder
book records for each photo, and complete metadata later through manual editing
or AI-assisted export/import.

## Current State

The app supports adding one book with one cover photo through the add book
form. There is no dedicated photo intake workflow yet for either single-photo
quick capture or multi-photo batch capture.

## Wanted State

The page should support:

- Selecting or dragging many image files.
- Selecting a single image file.
- Previewing the selected photo batch before upload.
- Optional shared defaults for all imported books, such as ownership format,
  location, category/type, and language.
- Creating one incomplete book record per uploaded photo.
- Marking created books as needing metadata completion.
- Showing upload success/error results per photo.
- Linking the user to export/import so AI can complete missing metadata later.

This workflow is not expected to identify books automatically in Phase 1.
Automatic recognition is a later AI/enrichment feature.

## Child Component Specs

- `../components/bulk-import/photo-batch-upload.md`
- `../components/bulk-import/import-review-queue.md`
- `../components/import-export/export-import-format.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Select many cover photos.
- Select one cover photo.
- Review selected photos.
- Set optional batch defaults.
- Upload the batch.
- View created placeholder books.
- Export incomplete records for AI enrichment.
- Import completed metadata later.

## Data Shown

- Selected photo previews.
- File names and sizes.
- Batch defaults.
- Upload progress.
- Per-photo result: created, failed, duplicate/suspected duplicate if supported
  later.
- Created book ids / links.

## States

- No files selected.
- Files selected.
- Uploading.
- Partial success.
- All succeeded.
- Upload failed.

## UX Notes

This is a power-user capture workflow. Phase 1 should be practical and robust:
clear progress, resumable mental model, and no accidental data loss. Phase 2 can
make the import flow more visual and polished.
