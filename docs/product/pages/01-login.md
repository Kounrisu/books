# Login / Register Page

## Purpose

Let the user register, log in, and enter their private library.

## Current State

The app has a simple Angular Material card with email/password fields, login
and register modes, and inline error messaging.

## Wanted State

For the prototype, keep this page simple and reliable. It needs clear errors,
disabled/submitting states, and a clean redirect into the books page after
auth.

For the premium design phase, this can become a more polished brand entry
screen, but it should not become a marketing homepage during the prototype.

## Child Component Specs

- `../components/shared/loading-empty-error-states.md`

## User Actions

- Log in with email and password.
- Register a new account.
- Toggle between login and register mode.
- Log out from the authenticated app shell.

## Data Shown

- Email field.
- Password field.
- Current auth mode.
- Inline auth error if login/register fails.

## States

- Idle.
- Submitting.
- Invalid credentials / registration failed.
- Successful auth and redirect.

## UX Notes

Use Angular Material form fields and buttons. Keep the page centered, compact,
and readable on mobile.
