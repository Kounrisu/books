# Admin: User Management

## Parent Page

`docs/product/pages/08-admin.md`

## Purpose

Allow an admin to manage accounts for a private multi-user deployment.

## Current State

No user management UI exists.

## Wanted State

The component should support:

- Listing users.
- Searching/filtering users.
- Creating/inviting users if enabled.
- Disabling/reactivating users.
- Showing account metadata such as email, role, active status, and created
  date.

## Inputs / Data

- User list.
- Available roles.
- Current admin user's id/role.

## User Actions

- Search users.
- Change active status.
- Open a user action menu.
- Create/invite a user if enabled.

## Output / Effects

- Updates user account records.
- Blocks disabled users from normal app access.
- Keeps each user's library data scoped to that user.

## States

- Loading.
- Empty.
- Error.
- Saving.
- Confirmation required.

## Acceptance Criteria

- Non-admin users cannot access the component.
- User changes are enforced server-side, not only hidden in the UI.
- Admin cannot accidentally remove the last usable admin account.
- Disabling a user does not delete their books, locations, uploads, or loans.

## UX Notes

Use a compact Material table or list. This should feel utilitarian in Phase 1.

