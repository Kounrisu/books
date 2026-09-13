# Admin Page

## Purpose

Let an admin manage users and roles without turning the app into a shared
library product.

## Current State

There is no admin page yet. Authentication exists, but users do not currently
have roles in the implemented schema.

## Wanted State

The admin page should be available only to users with the `admin` role. It
should support basic operational user management:

- View registered users.
- See email, role, active status, and created date.
- Change a user's role.
- Disable/reactivate users.
- Create or invite users if self-registration is disabled later.
- Confirm destructive or privilege-changing actions.

Regular users should never see admin navigation or access admin routes.

## Child Component Specs

- `../components/admin/user-management.md`
- `../components/admin/roles-and-permissions.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Open the admin area.
- Browse users.
- Search/filter users.
- Change a user role.
- Disable/reactivate a user.
- Create/invite a user if enabled.

## Data Shown

- User email.
- Role.
- Active/disabled status.
- Created date.
- Optional last login date if added later.

## States

- Loading users.
- No users.
- Load error.
- Saving role/status changes.
- Confirmation dialogs.

## UX Notes

This is an operational page, not a public-facing experience. Keep Phase 1
simple, dense, and clear. Use Angular Material table/list controls, dialogs,
menus, and form fields.

