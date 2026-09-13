# Borrowing / Loan History

## Purpose

Track when a friend borrows a physical book and whether it came back.

## Current State

Borrowing is not implemented yet.

## Wanted State

The app should store a history of book loans:

- Borrower name.
- Borrowed date.
- Returned date when returned.
- Optional notes.
- Current borrowed status derived from an open loan.

The detail page and books list should make it obvious when a book is currently
borrowed and by whom.

## Child Component Specs

- `../components/borrowing/loan-history.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Mark a book as borrowed.
- Record who borrowed it.
- Record the borrowed date.
- Add optional notes.
- Mark the book as returned.
- View previous borrowing history.

## Data Shown

- Current borrower if any.
- Borrowed date.
- Returned date for past loans.
- Loan notes.

## States

- No borrowing history.
- Currently borrowed.
- Returned.
- Save error.

## UX Notes

Keep this practical. It does not need a complex CRM-like workflow. The main
goal is to answer: who has my book, since when, and did it come back?
