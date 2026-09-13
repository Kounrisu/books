# Timeline Page

## Purpose

Show timelines for the user's book life and for the books themselves: what the
user read and when, when books were bought/acquired if known, when books were
borrowed or rented from outside sources, when owned books were lent out or
returned, when editions were published/printed, and when works were originally
written or historically situated.

## Current State

The app has simple fields such as purchase date and reading status, but no
timeline page, no event history model, and no support for approximate
publication/original-work timelines.

## Wanted State

The timeline should combine:

- Reading started.
- Reading finished.
- Book acquired/bought/gifted/inherited.
- Book borrowed from a public library, company library, friend, school, rental
  service, or other source.
- External borrow/rental due date.
- External borrow/rental returned.
- Owned book lent to someone else.
- Owned book returned by borrower.
- Book marked lost/found.
- Metadata imported/reviewed if useful.
- Publication date/year of the cataloged edition.
- Print/edition date if known.
- Original writing/composition date or era.
- Historical/setting period when relevant.

Timeline modes should include:

- Personal timeline.
- Publication timeline.
- Original work / historical timeline.
- Print / edition timeline.
- Combined timeline.

Dates may be exact, approximate, partial, unknown, BCE/CE, century-level, or
plain text. Approximate dates must be displayed as approximate.

## Child Component Specs

- `../components/timeline/timeline-feed.md`
- `../components/timeline/reading-history.md`
- `../components/timeline/acquisition-rental-history.md`
- `../components/borrowing/loan-history.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- View chronological history.
- Filter by event type.
- Switch timeline mode.
- Filter by book, collection area, source, or date range.
- Open a book from a timeline event.
- Add or edit reading history.
- Add or edit external borrow/rental history.
- See currently due external loans/rentals.

## Data Shown

- Event type.
- Book title and cover if available.
- Date.
- Source or person if relevant.
- Notes.
- Due/returned status for borrowed/rented books.
- Date precision or fuzzy date label for approximate historical/publication
  dates.

## States

- Empty timeline.
- Loading.
- Load error.
- No events matching filters.

## UX Notes

Phase 1 can be a simple chronological list with filters. Phase 2 can make this
feel more like a personal reading/history journal.
