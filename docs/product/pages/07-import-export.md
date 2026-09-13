# Import / Export For AI-Assisted Enrichment

## Purpose

Let the user export the library to local files, complete or enrich metadata
with AI tools such as ChatGPT or Claude, and import the completed data back
into Postgres.

## Current State

No export/import workflow exists yet.

## Wanted State

The app should support:

- Exporting book metadata to a human-editable file.
- Exporting incomplete placeholder books created from bulk photo imports.
- Exporting nested data such as locations and borrowing history.
- Importing enriched data back into the database.
- Validating required fields.
- Preserving user ownership boundaries.
- Avoiding blind destructive updates.

## Child Component Specs

- `../components/import-export/export-import-format.md`
- `../components/bulk-import/import-review-queue.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Export current library data.
- Open the exported file on the computer.
- Use AI to fill missing descriptions, categories, notes, external rating/rank,
  or other metadata.
- Import the edited file back into the app.
- Review validation errors or conflicts.

## Data Shown

- Export file type and scope.
- Import preview.
- Validation errors.
- Update/create counts.
- Conflict warnings.

## States

- Exporting.
- Import file selected.
- Validating.
- Import success.
- Import failed with row-level errors.

## UX Notes

CSV is good for flat book metadata. JSON is better for nested data like
locations and borrowing history. The exact import conflict policy should be
decided before implementation.
