# Book Detail Page

## Purpose

Show the complete record for one book in a readable way, including metadata,
personal notes, ownership/location, borrowing status, and ranking.

## Current State

There is no dedicated book detail page yet. The list table is carrying too much
information.

## Wanted State

The detail page should display everything important without overloading the
books list:

- Cover, title, author, type/category, language.
- Full bibliographic metadata: subtitle, original title, ISBNs, publisher,
  publication date/year, edition, page count, series, tags, genres, subjects,
  audience, original language, and contributors.
- Original writing/composition date or era, historical period, setting period,
  print date, and date precision.
- Personal note/rating, review, recommendation, and personal ranking.
- Library status, favorite status, saved list/project label, and priority.
- Collection areas this book belongs to, plus area-specific level, priority,
  and notes.
- Description, spoiler/summary notes, personal notes, favorite quotes/passages,
  and content warnings.
- Reading status and dates started/finished.
- Full reading history, including rereads and abandoned/paused periods.
- External rating/rank and source.
- External ids and source URL.
- Ownership format, physical status, physical format, condition, inventory
  code, barcode, copy notes, dimensions, weight, current location, unknown
  location state, and lost state.
- Ebook metadata: ebook format, source, file path if stored/linked, and DRM
  status.
- Purchase date, price, currency, and acquisition source.
- Acquisition, external borrow/rental, due date, and return history.
- Metadata confidence, metadata reviewed date, and duplicate/review flags.
- Current borrowed status and borrowing history.
- Timeline events related to the book.
- Edit/delete actions.

## Child Component Specs

- `../components/book-detail/notes-and-spoilers.md`
- `../components/borrowing/loan-history.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Read all metadata for a book.
- Edit the book.
- Delete the book.
- Mark book as lent to a friend.
- Mark borrowed book as returned.

## Data Shown

- Full book metadata.
- Current loan status.
- Loan history.
- Reading, acquisition, external borrow/rental, and timeline history.
- Ranking and external signals.

## States

- Loading.
- Missing book / not found.
- Load error.
- Delete confirmation.

## UX Notes

Phase 1 can be a clean Material layout with sections. Phase 2 should become a
premium, cover-forward reading record with richer typography and motion.
