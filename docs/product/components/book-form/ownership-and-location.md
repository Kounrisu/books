# Book Form: Ownership And Location

## Parent Page

`docs/product/pages/03-book-form.md`

## Purpose

Capture whether the user owns a book physically, digitally, both, or not yet;
where the physical copy is stored; and whether a physical copy is lost or has
an unknown location.

## Current State

The form has a simple location select but no ownership format, library status,
or physical status.

## Wanted State

The component should support:

- Ownership format: physical, ebook, or both.
- Ownership format: none, physical, ebook, or both.
- Library status: owned, wishlist, want to read, want to buy, saved for later.
- Favorite marker.
- Optional saved list/project label for books saved for a project, learning
  goal, or later reading.
- Physical status: in collection, unknown location, lost, or lent out.
- Location selection for physical/both ownership.
- No required location for ebook-only or not-owned books.
- No required location when the physical status is unknown location or lost.
- Hierarchical location selection once locations support parent/child places.

## Acceptance Criteria

- Ebook-only books can be saved without a location.
- Wishlist/not-owned records can be saved without ownership or location.
- Physical and both-format books can be assigned to a location.
- Physical books can be marked unknown location or lost without choosing a
  named location.
- Favorite books and saved-for-project books can be distinguished.
- Location options show hierarchy clearly.
- Changing ownership format updates location requirements without losing user
  input unnecessarily.

## UX Notes

Use Material radio buttons, segmented controls, or select controls in Phase 1.
Phase 2 can make this more visual.
