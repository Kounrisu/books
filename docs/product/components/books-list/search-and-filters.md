# Books List: Search And Filters

## Parent Page

`docs/product/pages/02-books-list.md`

## Purpose

Help the user find books in a large personal collection without scanning every
row manually.

## Current State

The current books table has no search, no visible filters, and no advanced
filter panel.

## Wanted State

The component should provide:

- A quick text search for title/name, subtitle, original title, author,
  publisher, ISBN, series, tags, genres, subjects, description,
  spoiler/summary notes, and personal notes.
- Always-visible high-value filters for category/type, library status,
  ownership format, favorite/saved status, and reading status.
- A toggleable advanced filter panel for less common filters.
- Clear reset behavior.
- A no-results state when filters hide every book.

Advanced filters should include:

- Location hierarchy.
- Physical status: in collection, unknown location, lost, or lent out.
- Borrowed status.
- External borrowed/rented status.
- Due/overdue external loans or rentals.
- Library status: owned, wishlist, want to read, want to buy, saved for later.
- Favorites.
- Saved list/project label.
- Collection area.
- Media type.
- Area level: beginner, intermediate, advanced, reference, unknown.
- Purchase date range.
- Personal note range.
- External rating/rank range.
- Recommendation status.
- Language.
- Missing metadata.
- Format.
- Condition.
- Reading status.
- Publication year range.
- Publisher.
- Series.
- Tags, genres, subjects, and audience.
- Acquisition source.
- Ebook format/source.
- Metadata confidence and metadata review status.
- Possible duplicate status.

## Inputs / Data

- Full book list.
- Available categories/types.
- Available library statuses.
- Available ownership formats.
- Available locations.
- Available languages.
- Available formats, reading statuses, conditions, tags, genres, subjects,
  publishers, series names, acquisition sources, ebook sources, and metadata
  confidence values.

## User Actions

- Type a search query.
- Select category/type filters.
- Select ownership format filters.
- Select library status, favorite, saved-list, and reading status filters.
- Select collection area, media type, and area level filters.
- Select external borrow/rental and due/overdue filters.
- Open/close advanced filters.
- Apply advanced filter values.
- Clear all filters.

## Output / Effects

- Updates the visible book list.
- Updates the no-results state.
- Preserves filters while the user stays on the books page.

## Acceptance Criteria

- Search matches title, subtitle, original title, author, publisher, ISBN,
  series, tags, genres, subjects, description, spoiler notes, and personal
  notes.
- Category/type and ownership filters combine with text search.
- Wishlist, favorites, saved-for-project, unread, unknown-location, and lost
  filters combine correctly.
- Collection area, media type, and area-level filters combine correctly.
- Advanced filters are hidden until toggled open.
- Clear filters returns to the full list.
- The component works on mobile without horizontal overflow.

## UX Notes

Phase 1 can use Angular Material form fields, selects, chips, and expansion
panels. Phase 2 can make the filters more visually elegant, but the behavior
should already be complete.
