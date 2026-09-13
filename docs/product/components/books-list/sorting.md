# Books List: Sorting

## Parent Page

`docs/product/pages/02-books-list.md`

## Purpose

Let the user reorder the library by the fields that matter for browsing and
comparison.

## Current State

The current table has no sorting.

## Wanted State

Support sorting by:

- Title.
- Author.
- Publisher.
- Publication year/date.
- Category/type.
- Format.
- Condition.
- Reading status.
- Personal note.
- External rating.
- Page count.
- Series name/number.
- Purchase date.
- Created date.
- Acquisition source.
- Metadata confidence/status.
- Ownership format.
- Location.

## Inputs / Data

- Visible filtered book list.
- Sort field.
- Sort direction.

## User Actions

- Choose sort field.
- Toggle ascending/descending direction.

## Output / Effects

- Reorders the visible book list.
- Keeps active filters intact.

## Acceptance Criteria

- Sorting works after filters are applied.
- Numeric fields sort numerically, not alphabetically.
- Missing values sort predictably at the end.
- Mobile users can change sort without relying on tiny table headers.

## UX Notes

Material table sort headers are acceptable for Phase 1 if the table remains the
primary layout. If the page shifts to cards/list rows, use a compact sort
select plus direction toggle.
