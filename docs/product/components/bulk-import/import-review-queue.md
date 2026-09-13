# Photo Import: Import Review Queue

## Parent Page

`docs/product/pages/09-bulk-photo-import.md`

## Purpose

Show the user what was created from a photo batch and what still needs metadata.

## Current State

No review queue exists.

## Wanted State

After a single-photo or batch upload, the user should see:

- Created placeholder book records.
- Cover thumbnail for each record.
- Metadata status.
- Any defaults applied.
- Per-file upload errors.
- Links to edit individual books.
- Link/action to export incomplete records for AI enrichment.

## Inputs / Data

- Batch upload result.
- Created book records.
- Upload errors.

## User Actions

- Open a created book.
- Export incomplete records.
- Continue to books list.
- Retry failed files if supported.

## Output / Effects

- Helps the user continue the workflow after photo capture.
- Makes incomplete metadata visible instead of silently hiding it.

## States

- No results.
- Results loaded.
- Partial success.
- Error.

## Acceptance Criteria

- User can see every file's result.
- Created placeholder records are linked.
- Incomplete records are clearly marked as needing metadata.
- Export/enrichment next step is obvious.

## UX Notes

This component should make the AI-assisted workflow legible: photos first,
metadata later.
