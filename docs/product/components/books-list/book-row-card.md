# Books List: Book Row / Card

## Parent Page

`docs/product/pages/02-books-list.md`

## Purpose

Show enough information about a book for browsing without turning the list into
a full detail page.

## Current State

The table row shows cover, title, author, category, personal note, ranking,
recommendation marker, and location.

## Wanted State

Each row/card should show:

- Cover thumbnail.
- Title and author.
- Subtitle if useful and available.
- Category/type.
- Library status: owned, wishlist, want to read, want to buy, or saved.
- Favorite/saved/project marker when relevant.
- Collection area/media type/level marker when relevant.
- Format and reading status.
- Ownership format.
- Current location for physical books, or unknown/lost status.
- Current borrower if borrowed.
- External source and due status if borrowed/rented from a library, company
  library, friend, or rental service.
- Personal note/rating.
- Personal rank.
- External rating/rank when known.
- Publication year, series, or publisher when useful for disambiguation.
- Purchase date when known.
- Small indicators for description, spoiler notes, personal notes, tags, ebook
  availability, metadata status, and possible duplicates.

## User Actions

- Open book detail.
- Edit book.
- Delete book.
- Mark as borrowed or returned if available from the list.

## Acceptance Criteria

- The row/card remains readable with long titles and missing covers.
- The user can distinguish personal rating from external rating.
- Borrowed books are visibly marked.
- Wishlist/not-owned books are visually distinct from owned books.
- Favorite and saved-for-project books are distinguishable.
- Area books show beginner/intermediate/advanced/reference status when
  relevant.
- Lost and unknown-location books are visibly marked.
- Metadata-needs-review and possible-duplicate states are visible without
  overwhelming the row/card.
- The layout does not break on mobile.

## UX Notes

Phase 1 may keep a table. Phase 2 should likely move to a cover-forward list or
card layout for a more premium library feel.
