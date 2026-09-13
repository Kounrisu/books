# Books List / Library Browse Page

## Purpose

This is the main library page. It must help the user find books quickly, see
where they are, compare ratings/ranks, and understand what metadata is missing.

## Current State

The current page shows books in a Material table with cover, title, author,
category, personal note, computed ranking, recommendation marker, and location.
It does not yet support sorting, name search, advanced filtering, book detail
navigation, edit/delete actions, or responsive mobile browsing.

## Wanted State

The page should support real collection browsing:

- Sort books by title, author, category/type, personal note, external rating,
  purchase date, created date, ownership format, and location.
- Search by title, author, description, spoiler/summary notes, and personal
  notes.
- Filter by category/type, ownership format, location hierarchy, borrowed
  status, purchase date range, personal note range, external rating/rank range,
  recommendation status, language, missing metadata, library status,
  favorite/saved status, physical status, reading status, and project/learning
  saved lists.
- Hide advanced filters behind a toggle so the default page remains calm.
- Show description/spoiler/personal-note indicators without making the list
  unreadably dense.
- Open a detail page for the selected book.
- Provide edit and delete actions.

## Child Component Specs

- `../components/books-list/search-and-filters.md`
- `../components/books-list/sorting.md`
- `../components/books-list/book-row-card.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Browse all books.
- Search by name/title/author.
- Toggle advanced filters.
- Sort columns or list controls.
- Filter by type/category and ownership format.
- Filter by wishlist, want-to-read, favorites, saved/project list, unread,
  unknown-location, and lost status.
- Filter by collection area, media type, and area level.
- Filter by external borrow/rental status and due/overdue state.
- Open a book detail page.
- Add a new book.
- Edit or delete an existing book.

## Data Shown

- Cover thumbnail.
- Title and author.
- Category/type.
- Ownership format: physical, ebook, or both.
- Library status and ownership format.
- Favorite/saved/project marker.
- Collection area marker when a book belongs to active areas.
- Current physical location if relevant.
- Unknown/lost location state when relevant.
- External borrowed/rented/due status when relevant.
- Borrowed status if currently lent out.
- Personal note/rating.
- Personal rank in category and overall.
- External rating/rank source when known, such as Amazon.
- Purchase date if known.
- Description/spoiler/personal-note presence.

## States

- Loading books.
- No books yet.
- No books match filters.
- Load error.
- Delete confirmation.

## UX Notes

During Phase 1, Material table sorting/filter controls are acceptable if they
are practical. If the table becomes too dense, use list rows or cards for the
main browsing experience and reserve tables for comparison views.

Phase 2 should make this the visual center of the product: cover-forward,
beautiful, fast to scan, and pleasant on mobile.
