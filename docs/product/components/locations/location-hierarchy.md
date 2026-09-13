# Locations: Hierarchy

## Parent Page

`docs/product/pages/05-locations.md`

## Purpose

Model real physical storage: broad places contain more specific shelves, boxes,
rooms, or bookcases.

## Current State

Locations are flat.

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

## UX Notes

Use Material tree/list/select patterns in Phase 1. Keep hierarchy shallow unless
the user later needs deeper nesting.

