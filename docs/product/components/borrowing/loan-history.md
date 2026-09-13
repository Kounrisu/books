# Borrowing: Loan History

## Parent Page

`docs/product/pages/06-borrowing.md`

## Purpose

Track who borrowed a physical book, when it left, and when it came back.

## Current State

Borrowing is not implemented.

## Wanted State

Store each loan as history:

- Borrower name.
- Borrowed date.
- Returned date.
- Optional notes.

The current book state should show an active borrower when there is an open
loan.

## Acceptance Criteria

- A book can have multiple historical loans.
- Only one active loan should be open for a physical book at a time.
- Returning a book closes the active loan without deleting history.
- Borrowed status appears on the book detail page and books list.

## UX Notes

Keep this lightweight: it answers who has the book and whether it came back.

