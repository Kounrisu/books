# Admin: Roles And Permissions

## Parent Page

`docs/product/pages/08-admin.md`

## Purpose

Define who can access admin capabilities and protect user-scoped library data.

## Current State

Authentication exists, but the implemented schema does not yet include user
roles.

## Wanted State

Minimum roles:

- `admin`: can access admin pages and manage users.
- `user`: can manage only their own library.

Role rules:

- Self-registration cannot grant `admin`.
- Admin-only routes require server-side role checks.
- Regular library endpoints remain scoped by `userId`.
- Privilege-changing actions require confirmation in the UI.
- The app should prevent removing or disabling the last admin.

## Inputs / Data

- Authenticated user id.
- Authenticated user role.
- Target user id/role/status.

## Output / Effects

- Allows or denies admin routes/actions.
- Updates role/status when permitted.

## Acceptance Criteria

- A regular user cannot access admin API endpoints.
- A regular user cannot see admin navigation.
- Admin role changes are persisted.
- The last active admin cannot be disabled or demoted.

## UX Notes

Keep roles intentionally simple until the product needs more granularity. Avoid
introducing fine-grained permissions too early.

