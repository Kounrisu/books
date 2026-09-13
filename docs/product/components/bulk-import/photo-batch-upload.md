# Photo Import: Single Or Batch Upload

## Parent Page

`docs/product/pages/09-bulk-photo-import.md`

## Purpose

Accept one or many cover photos and prepare them for import as placeholder book
records.

## Current State

Single-photo upload exists inside the full add book form. A dedicated quick
photo-intake flow does not exist yet, and batch upload does not exist.

## Wanted State

The component should support:

- Multi-file image selection.
- Single-file image selection.
- Drag-and-drop if practical.
- Preview thumbnails.
- File validation.
- Optional batch defaults.
- Upload progress.
- Per-file error reporting.

## Inputs / Data

- Selected image files.
- Optional default ownership format.
- Optional default location.
- Optional default category/type.
- Optional default language.

## User Actions

- Select files.
- Remove a file before upload.
- Set defaults.
- Start upload.
- Cancel before upload starts.

## Output / Effects

- Sends image files and defaults to the backend.
- Creates placeholder books for successful uploads.
- Reports failures without losing the whole batch.

## States

- Empty.
- Ready to upload.
- Uploading.
- Partial success.
- Error.

## Acceptance Criteria

- One photo or multiple photos can be selected in one session.
- Each successful photo creates one book record.
- Failed files show understandable errors.
- Placeholder books are marked as needing metadata.
- The UI does not freeze on large batches.

## UX Notes

Use Angular Material buttons, progress bars, lists, and error messaging in
Phase 1. Avoid complex custom upload UI until the workflow is proven.
