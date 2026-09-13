# Locations Page

## Purpose

Help the user model where physical books are kept.

## Current State

Locations are currently flat records with a name, optional photo, and optional
geolocation.

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

## Data Shown

- Location name.
- Parent location.
- Reference photo.
- Geolocation if captured.
- Book count per location.

## States

- Loading.
- No locations yet.
- Save error.
- Geolocation denied/unavailable.

## UX Notes

Phase 1 can use cards/tree/list controls from Angular Material/CDK. Phase 2 can
make this feel more spatial and visual, but the hierarchy and edit workflow
matter first.
