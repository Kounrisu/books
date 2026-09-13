# Timeline: Acquisition And Rental History

## Parent Page

`docs/product/pages/11-timeline.md`

## Purpose

Track how and when the user got access to a book, including owned acquisitions
and temporary external borrowing/rental.

## Wanted State

The component should support:

- Bought books.
- Gifted books.
- Inherited books.
- Library loans.
- Company library loans.
- Friend loans.
- Rentals.
- Due dates.
- Return dates.
- Cost/price and currency when relevant.
- Approximate purchase/acquisition text when the exact date is unknown.
- Notes.

## Acceptance Criteria

- A not-owned book can still have reading history if borrowed/rented from an
  external source.
- External borrow/rental records are distinct from lending owned books to other
  people.
- Due and returned states are visible.
- Unknown or approximate acquisition dates can be recorded without inventing an
  exact date.
- History appears on the timeline and book detail page.
