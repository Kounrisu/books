# Locations Page

## Purpose

Help the user model where physical books are kept.

## Current State

Locations support parent/child records, optional photos, and geolocation.
The index at `/locations` shows top-level places only. Opening a place at
`/locations/:id` shows its immediate child locations, breadcrumbs, and books.
For example: Locations → Home → Living room bookshelf → Shelf 1.

Implemented on 2026-09-14 following the user's request to open Home and see
the bookshelves inside it. This extends the functional prototype, not the
premium visual redesign.

## Wanted State

Locations should support hierarchy:

- Top-level places such as Home, Garage, and Second home.
- Renameable top-level places.
- Sublocations inside each place, such as shelves, rooms, boxes, or bookcases.
- Optional reference photo for each location.
- Optional geolocation for broad places when useful.

Physical books can be assigned to a specific sublocation. Ebook-only books do
not need a physical location.

## Child Component Specs

- `../components/locations/location-hierarchy.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Create a top-level location.
- Rename a location.
- Create sublocations.
- Add/replace a location photo.
- Capture geolocation.
- View books in a location.
- Open a location to browse its immediate children at any depth.
- Navigate back through clickable breadcrumbs.
- Add a child with the current parent preselected; saving returns to the parent.
- Add a book with the current location preselected.
- Search books within the current location by title, author, ISBN, series, or tag.
- Include/exclude books in nested locations (included by default).

## Data Shown

- Location name.
- Parent location.
- Reference photo.
- Geolocation if captured.
- Book count per location.

Card book counts include the location and all descendants. The book list
shows each book's full location path, linking to that exact shelf or box.
Locations without books can still contain other locations. Existing books
can be assigned through the book editor or the catalog's location selector.

## States

- Loading.
- No locations yet.
- Save error.
- Geolocation denied/unavailable.
- Empty child location list, distinct from an empty book list or no search matches.
- Unknown/deleted/inaccessible location, with a return link.
- Book loading failure leaves child navigation available and hides unreliable counts.
- Delete failure retains the card and shows a visible error.

## UX Notes

Phase 1 can use cards/tree/list controls from Angular Material/CDK. Phase 2 can
make this feel more spatial and visual, but the hierarchy and edit workflow
matter first.

Research and follow-up ideas: `../BOOK_APP_RESEARCH.md`.
