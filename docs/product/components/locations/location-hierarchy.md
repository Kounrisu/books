# Locations: Hierarchy

## Parent Page

`docs/product/pages/05-locations.md`

## Purpose

Model real physical storage: broad places contain more specific shelves, boxes,
rooms, or bookcases.

## Current State

The existing `parentLocationId` data model now drives folder-style browsing.
The index shows roots; each location page shows direct children and provides
breadcrumbs through its ancestors. No new database model was needed.

## Wanted State

Support:

- Top-level locations such as Home, Garage, and Second home.
- Renameable locations.
- Sublocations nested under top-level locations.
- Optional photo and geolocation per location.
- Book counts per location.

## Acceptance Criteria

- User can create top-level and child locations.
- User can rename locations.
- User can assign a physical book to a child location.
- Location hierarchy is readable in selects and lists.
- Ebook-only books do not require a location.
- Opening Home shows its bookshelves, not every location in the library.
- Opening a bookshelf shows its children and assigned books.
- Child cards include book totals across all descendants, without counting books elsewhere.
- Breadcrumb links and browser back/forward work between locations.
- A direct bookmarked location URL loads the hierarchy and books.
- Add location inside preselects the current parent; saving returns there.
- Add book here preselects the current location.
- Location search matches title, author, ISBN, series, or tags within the chosen scope.
- Include locations inside toggles recursive versus direct-book scope.
- Unknown locations and failed requests have explicit states.

Deletion retains the existing policy: books directly assigned to the deleted
location become unassigned; its immediate child locations become top-level.
Books in surviving child locations retain their assignments. The confirmation
explains this before deletion.

## UX Notes

Use Material tree/list/select patterns in Phase 1. Keep hierarchy shallow unless
the user later needs deeper nesting.
