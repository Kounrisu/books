# Shared: Loading, Empty, Error, And Submit States

## Parent Page

Used by all pages.

## Purpose

Make the app feel reliable and understandable when data is loading, missing,
failing, or being saved.

## Current State

Some pages show empty states, but services and forms do not consistently expose
loading, error, or submitting states.

## Wanted State

Every data-backed page/form should define:

- Loading state.
- Empty state.
- Error state.
- Submit/save state.
- Success/redirect behavior.

## Acceptance Criteria

- Users see feedback while data loads.
- Empty states explain the next useful action.
- Errors are visible and recoverable.
- Submit buttons are disabled or guarded during save.
- Double-submit is prevented.

## UX Notes

Use Material progress indicators, inline errors, snackbars where appropriate,
and disabled button states. Keep messaging concise.

