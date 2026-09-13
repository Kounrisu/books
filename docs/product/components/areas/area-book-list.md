# Collection Area: Book List

## Parent Page

`docs/product/pages/10-collection-areas.md`

## Purpose

Show books connected to a collection area and make it clear which books are
owned, missing, important, unread, or reference material.

## Wanted State

The area book list should support:

- Owned books.
- Wanted/not-owned books.
- Area level when relevant: beginner, intermediate, advanced, reference,
  unknown.
- Area-specific priority/usefulness.
- Area-specific notes.
- Media type: real book, ebook, audiobook, manga, bande dessinee, magazine,
  etc.
- Reading status.
- Ownership/location status.
- Filters by owned/missing, media type, level, priority, reading status, and
  favorite.

## Acceptance Criteria

- Same book can belong to multiple areas.
- Area-specific level/priority does not overwrite the book's global metadata
  unless explicitly intended.
- Missing/not-owned books are visually distinct.
- User can filter to "what should I read next?"
