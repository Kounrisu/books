# Books Webapp Roadmap

This roadmap tracks product progress from the current functional prototype
toward the full personal library system.

Use checkbox progress here for product-level status. Use implementation plans
or GitHub Issues for task-level execution.

The roadmap follows a content-before-delivery sequence. Phases 0-7 define and
prove what the app needs to contain, remember, search, edit, import, export,
and manage. Phase 8 focuses on how that content should be delivered through a
premium UX/UI system. The experience phase is not optional polish; it is a
separate product phase that should start after the content and workflows are
stable enough to design around.

## Git Workflow Strategy

Use a simple industry-style branching model that keeps stable work protected
without turning this solo/prototype project into process theater.

- Stable release branch: use `main` as the long-term release/stable branch.
  This repository currently uses `master`; either keep `master` as the stable
  branch for now or rename it to `main` during a dedicated git cleanup.
- Integration branch: use `develop` for the current working product. Feature
  branches should normally branch from and merge back into `develop`.
- Feature branches: use short-lived branches such as
  `feature/book-filters`, `feature/admin-users`, or
  `feature/photo-import`.
- Prototype preservation: before the premium redesign starts, tag the stable
  Angular Material prototype and preserve it with a branch. This keeps a clean
  reference point for future webapps that may reuse the functional prototype.
- Premium UX/UI work: create a separate long-running branch from `develop`,
  preferably `feature/premium-ux-ui` or `design/premium-ux-ui`. Treat it as a
  design/feature branch, not as a replacement for `develop`. Merge it back to
  `develop` only when the redesigned app is ready to become the next product
  direction.

## Phase 0: Freeze The Vision

Goal: keep the current product vision stable long enough to build a usable
prototype.

- [x] Write the global product spec.
- [x] Add page-level specs.
- [x] Add component-level specs.
- [x] Add product overview.
- [x] Add documentation architecture.
- [ ] Avoid adding more major concepts unless they are truly missing.
  (Exception logged: Phase 2's fields were pulled forward alongside Phase 1
  work, and later the same session Phases 3 through 7 in full — timeline/
  lending, collection areas, admin roles, rich metadata core fields, photo
  intake/export/import — all at explicit user request ("carry on directly
  up to phase 7"). See each phase's own section for what's done vs.
  intentionally deferred.)

## Phase 1: Make The Current App Useful

Goal: turn the existing prototype into a comfortable daily catalog.

- [x] Add books list search (title, author, description, my review).
- [x] Add books list sorting, directly on the column headers (title,
  author, category, favorite; ascending/descending — status and reading
  are filterable but intentionally not sortable, per explicit product
  direction). Click a header to sort by only that column; shift-click adds
  it as a secondary/tertiary criterion for multi-column sort, with a small
  priority badge shown next to each active column's arrow. Defaults to
  date-added descending when no header is active.
- [x] Add basic filters: category, location, reading status, ownership
  status. The reading/ownership status filters were originally deferred
  (see below) but unblocked once Phase 2's `readingStatus`/`libraryStatus`
  fields were pulled forward.
- [x] Add no-results state (distinct from the "no books at all" empty
  state — shown when filters/search produce zero matches).
- [x] Add loading/error states for book and location pages.
- [x] Add submitting/saving states for forms.
- [x] Add book detail page (`/books/:id`).
- [x] Add edit book UI (`/books/:id/edit`, reuses the add-book form).
- [x] Add delete book UI (from the list row and the detail page, with a
  confirmation prompt).
- [x] Add edit location UI (`/locations/:id/edit`, reuses the add-location
  form).
- [x] Add location browsing (`/locations/:id`): top-level places → nested
  shelves/rooms/boxes, breadcrumbs, recursive book counts, scoped book search,
  direct/nested scope toggle, and parent/location defaults for creation.
  Implemented 2026-09-14 at explicit user request; see `BOOK_APP_RESEARCH.md`.
- [x] Add delete location UI (from the location card, with a confirmation
  prompt; deleting a location clears `locationId` on its books rather than
  blocking, per the `ON DELETE SET NULL` foreign key).
- [x] Improve responsive behavior of the books list (horizontal scroll for
  the table and a stacked filter bar under 600px).

Phase 1 is complete.

### Note: computed ranking removed from the UI

The books list and detail page used to show a computed "#N in category /
#N overall" ranking badge (derived from `myNote`, per the global spec's
Ranking section). Per explicit product direction, this was removed from
both views — it's not useful yet and the product wants a richer,
multi-source ranking model (your own rating plus one or more external
signals like an Amazon rating) before ranking is shown again. The backend
computation (`ranking.ts`, `computeRankings`) is untouched and still runs;
only the frontend display was removed, so it's cheap to reintroduce for a
specific rework rather than from scratch.

Also removed from the books **list table** (kept in the data model, the
add/edit form, and the detail page): "My note" and "Location" columns.
These stay editable and visible on the book detail page; they were just
crowding the table view.

## Phase 2: First Data Model Upgrade

Goal: support the most important real-life library states.

Pulled forward early (before the rest of this phase) at explicit product
request, alongside Phase 1 work:

- [x] Add `ownershipFormat`: physical, ebook, both, none. Editable in the
  add/edit form, shown on the detail page as "Format". Not yet a books-list
  column or filter (not requested).
- [x] Add `libraryStatus`: owned, wishlist, want_to_read, want_to_buy,
  borrowed (a pragmatic subset of the spec's fuller list — extend as
  needed). Editable in the form, shown as "Status" in both the list and
  detail page, filterable.
- [x] Add `readingStatus`: unread, reading, read, abandoned,
  reference_only. Editable in the form, shown as "Reading" in both the
  list and detail page, filterable.
- [x] Add `externalRating`, `externalRank`, `externalSource` (from the
  global spec's Descriptions/notes/review section — an Amazon-style
  external rating alongside your own `myNote`). Present in the schema,
  API, and frontend `BookRow` type only — intentionally **not** wired into
  any form or display yet, per explicit product direction ("keep the model,
  don't use it in the front"). The next ranking-related UI work should
  read from here instead of re-deriving a single-source ranking.
- [x] Add `isFavorite`. Editable in the form (separate checkbox from
  `recommend` — they're different concepts: `isFavorite` is "this is one of
  my favorites," `recommend` is "I'd recommend this to someone else"), a
  sortable ⭐ column in the list (replacing what used to be a `recommend`
  👍 column there), and a chip on the detail page. `recommend` itself is
  unchanged — still in the model, the form, and the detail page — just no
  longer a list column.
- [x] Add `physicalStatus`: in_collection, unknown_location, lost, lent_out.
  Editable in the form, shown on the detail page as "Physical status."
  Not yet a books-list column or filter (not requested, same treatment as
  `ownershipFormat`).
- [x] Add `savedList`: a free-form text field (e.g. "Project learning,"
  "Someday"). Editable in the form, shown on the detail page when set. Not
  a books-list column/filter (free text isn't a great filter axis without
  a fixed value set — revisit if the user wants one).

- [x] Add `personalNotes`. Free-text field in the add/edit form, shown on
  the detail page when set.
- [x] Add `spoilerNotes`. Free-text field in the form; shown on the detail
  page behind a "Show spoilers" click (hidden by default).
- [x] Add `metadataStatus`. Select in the form (complete/needs_metadata/
  needs_review); shows as a 🏷️ badge on the list and detail page when not
  "complete." This is also how Phase 3's bulk photo intake marks
  placeholder records as needing attention.

Phase 2 is now fully done (9 of 9 user-facing items), plus the dormant
`externalRating`/`externalRank`/`externalSource` fields for a future
multi-source ranking view.

## Phase 3: Photo Intake And Metadata Completion Loop — COMPLETE

Goal: capture the real collection quickly and complete missing metadata through
AI-assisted export/import.

- [x] Add single-photo quick intake. (Already existed via the normal add-book
  form's cover photo field.)
- [x] Add multi-photo batch intake. `POST /books/bulk-import` (multipart,
  field `photos`, up to 50 files) + a frontend page at `/books/import`
  ("Bulk photo intake" section): pick multiple cover photos, optional shared
  defaults (format, location, category, language), submit.
- [x] Create placeholder book records from uploaded photos. One `Book` per
  photo, `title` from the filename (extension stripped), `author: "Unknown"`.
- [x] Mark placeholder records as needing metadata. `metadataStatus:
  'needs_metadata'` set automatically on bulk-imported books.
- [x] Add import review queue. The bulk-import page shows created count +
  per-file errors immediately after submit; the books list/detail's 🏷️
  "Needs metadata" badge is the ongoing review signal.
- [x] Export incomplete records as CSV/JSON. `GET /books/export?format=json|
  csv&all=true|false` (defaults to only `metadataStatus != 'complete'`); the
  "Export for AI-assisted enrichment" section has buttons for both formats,
  downloaded client-side as a blob (the API requires the auth header, so a
  plain `<a href>` to the API wouldn't carry it).
- [x] Import enriched records back into Postgres. `POST /books/import`
  accepts `{ rows: [...] }`; the "Import enriched metadata" section accepts a
  JSON file (parsed client-side) and posts it. **CSV re-import is not
  supported** — only JSON round-trips. This is a deliberate scope cut (a
  correct CSV parser handling quoted commas is nontrivial); documented in the
  UI copy so it doesn't surprise anyone.
- [x] Validate import rows and show row-level errors. Each row's `id` is
  matched independently; not-found or failed rows are collected into
  `errors[]` and shown in the UI without failing the whole batch.
- [x] Preserve stable ids so AI-enriched rows map back to the correct photo
  records. The export includes `id`; import matches on it.

**Security note (found and fixed during manual verification):** the import
endpoint's row type only *declares* a narrow set of editable fields, but the
service was initially spreading the *entire* uploaded row into the Prisma
update — since the export intentionally includes the full book record (so AI
tools have full context), a naive re-upload of an unedited export would have
tried to overwrite `userId`, `createdAt`, `purchaseDate` (as a string, wrong
type for Prisma), etc. Fixed with an explicit field whitelist
(`pickImportableFields` in `books.service.ts`) — confirmed by importing a row
with a forged `userId`/`createdAt` and verifying they were silently ignored
while the legitimate fields (`publisher`, `isbn13`) updated correctly.

## Phase 4: Rich Metadata Expansion — CORE FIELDS COMPLETE, REST SCHEMA-ONLY

Goal: make the database a serious personal-library record.

The commonly-useful fields are fully wired (schema, API, add/edit form,
detail page):

- [x] Add ISBN-10 and ISBN-13.
- [x] Add publisher and publication year (not the fuller `publishedDate`).
- [x] Add edition and page count.
- [x] Add series name and series number.
- [x] Add translator (not illustrator/editor/other contributors).
- [x] Add tags (comma-separated input, stored as a `String[]`).
- [x] Add condition.

Deliberately **schema/API-only** (present in the database and `BookRow` type,
no form/display), per the same "keep the model, don't use it in the front
yet" pattern established for `externalRating` earlier — added now because
building a good form/detail UI for ~20 more fields (several needing bespoke
editors for JSON/array data) would have bloated the form past usability
without a specific request for them:

- [ ] Original title and original language.
- [ ] Physical `format` (hardcover/paperback/etc — distinct from
  `ownershipFormat`), illustrator, editor, `contributors` (JSON).
- [ ] Genres, subjects, audience.
- [ ] Inventory code, barcode, copy notes, dimensions, weight.
- [ ] Acquisition source, acquisition type, currency, `purchaseDateText`.
- [ ] Ebook format, ebook source, ebook file path, DRM status.
- [ ] External ids (JSON), source URL.
- [ ] Metadata confidence, metadata reviewed date, duplicate group id,
  possible-duplicate flag.
- [ ] Quotes (JSON), content warnings (array).

Add UI for any of these the same way the core set was added: on explicit
request, one field (or small group) at a time.

## Phase 5: Borrowing, Rental, And Timeline — CORE COMPLETE

Goal: track book history over time.

Implemented as a **unified event log** (`BookTimelineEvent`) rather than the
spec's fuller set of typed tables (`BookExternalBorrow`, `BookReadEvent`,
`BookAcquisitionEvent`) — the spec explicitly allows this ("optional
denormalized/event-log model"), and it's far more tractable to build well in
one pass than four parallel tables recording the same shape of fact. A
separate `BookLoan` table exists alongside it specifically because "who
currently has this book" needs to be queried directly, not derived by
scanning events; creating/returning a loan also writes a matching timeline
event automatically, so the Timeline page shows lending activity without
duplicating loan logic.

- [x] Add lending history for owned books lent to friends. `BookLoan` +
  `POST /loans`, `PATCH /loans/:id/return`; a "Lending" section on the book
  detail page shows the active loan (if any) with a "Mark returned" button,
  or a "Lend to ___" form otherwise.
- [ ] Add external borrow/rental records for public libraries, company
  libraries, friends, schools, and rental services. (The `external_borrowed`/
  `external_returned` timeline event types exist for logging this manually
  via the Timeline page's "Add an event" form, but there's no dedicated
  due-date/source-tracking workflow like `BookLoan` has for personal lending.)
- [ ] Add due dates and return dates. (Only `BookLoan.returnedAt` exists; no
  due-date field anywhere yet.)
- [x] Add reading history with multiple read events/rereads. `read_started`/
  `read_finished` timeline event types, addable from the Timeline page,
  optionally linked to a book.
- [x] Add acquisition history. `acquired` timeline event type.
- [x] Add timeline page. `/timeline` — add-event form (title, type, optional
  book, date, notes) plus a reverse-chronological list with an icon per event
  type.
- [ ] Add personal/publication/original-work/print timeline *modes* (i.e.
  separate filtered views of the timeline by date-axis meaning). Currently
  there's one flat list, not yet split into these modes.
- [ ] Support approximate, partial, unknown, BCE/CE, and century-level dates.
  `occurredAt` is a plain `DateTime` today.

## Phase 6: Collection Areas — COMPLETE

Goal: organize books around genres, media types, subjects, or learning/project
workspaces.

- [x] Add collection area model. `CollectionArea` + `CollectionAreaBook` join
  table (with `areaLevel`, `priority`, `relationStatus`, `notes` per link).
- [x] Add area kinds: genre, media type, subject, learning project, research
  project, custom. Free-text `kind` field with those six as select options in
  the form (extend the option list, not the schema, if more are needed).
- [x] Add area page. `/areas` (list, create, delete) and `/areas/:id` (detail
  — description/objectives/notes, linked books).
- [x] Add area notes/objectives. Fields on `CollectionArea`, shown on the
  detail page when set.
- [x] Add area book list. `/areas/:id` lists linked books with a
  remove-from-area action, and a dropdown to add any not-yet-linked book.
- [x] Support owned vs wanted books inside an area. `relationStatus` field
  exists on `CollectionAreaBook` (API-level; not yet a form control on the
  add-book-to-area UI — it always adds with no explicit status).
- [ ] Support media types as a controlled vocabulary on the area book link.
  (`areaLevel`/`priority` exist as free-form API fields; no dedicated
  media-type field or UI control yet.)
- [x] Support area levels: beginner, intermediate, advanced, reference,
  unknown. `areaLevel` field exists on the link (API-level; not yet exposed
  as a form control in the add-book-to-area UI — same gap as above).
- [x] Support area-specific priority/usefulness. `priority` field (same
  API-level-only caveat).
- [x] Support area-specific notes. `notes` field on the link (same caveat).

**Known gap:** the "add book to area" UI only sends `bookId` — it doesn't yet
expose `areaLevel`/`priority`/`relationStatus`/`notes` as form fields, even
though the API accepts them. Add that form when per-book area metadata is
actually needed day-to-day.

## Phase 7: Admin And Multi-User Controls — COMPLETE

Goal: support operational user management without making libraries shared.

- [x] Add user roles: admin and user. `User.role` (`'admin' | 'user'`,
  default `'user'`).
- [x] Add active/disabled user state. `User.isActive` (default `true`);
  `AuthService.login` now rejects disabled accounts.
- [x] Add admin-only API guard. `AdminGuard` (checks the current user's role
  live from the database — not from JWT claims, so a demotion takes effect
  immediately without waiting for the token to expire), applied to
  `AdminController` alongside `JwtAuthGuard`.
- [x] Add admin page. `/admin` (frontend `adminGuard` redirects non-admins to
  `/books`; the backend guard is the real enforcement).
- [x] Add user list. `GET /admin/users`.
- [x] Add role changes. `PATCH /admin/users/:id/role`, a `<mat-select>` per
  row on the admin page.
- [x] Add enable/disable user actions. `PATCH /admin/users/:id/active`, a
  toggle button per row.
- [x] Prevent disabling or demoting the last active admin. Enforced
  server-side in `AdminService` (`activeAdminCount` check) for both the role
  and active-status endpoints.
- [x] Hide admin navigation from non-admin users. The toolbar's "Admin" link
  only renders when `authService.isAdmin()`.

**Bootstrapping note:** self-registration can never grant `admin` (the
register endpoint doesn't accept a role at all), so the very first admin has
to be promoted directly in the database. Done for this session via
`UPDATE users SET role = 'admin' WHERE email = 'test@test.com'` against the
running Postgres container — there's no in-app "become admin" flow, by
design, matching the spec's "self-registration should not allow a user to
choose the admin role."

## Phase 8: Premium UX/UI

Goal: redesign the working product into a beautiful, polished experience.

Before starting this phase:

- [ ] Verify the Angular Material prototype is stable.
- [ ] Run backend tests, frontend tests, and frontend build.
- [ ] Commit all prototype work.
- [ ] Create a git tag for the stable prototype checkpoint, e.g.
  `prototype-material-v1`.
- [ ] Create/preserve a branch for the Angular Material prototype, e.g.
  `prototype/angular-material`.
- [ ] Create a separate premium redesign branch from `develop`, e.g.
  `feature/premium-ux-ui` or `design/premium-ux-ui`.
- [ ] Document the branch/tag names in `AI_CONVERSATION_LOG.md`.

The premium redesign should happen on its own branch. The Angular Material
prototype branch should remain available as a stable fallback/reference and as
a reusable starting point for future webapps that need a functional Material
prototype before premium visual design.

- [ ] Build moodboard in `docs/product/assets/moodboard/` and/or Figma.
- [ ] Define brand direction.
- [ ] Define custom Material theme and design tokens.
- [ ] Design cover-forward book browsing.
- [ ] Design premium book detail page.
- [ ] Design collection area dashboards.
- [ ] Design timeline experience.
- [ ] Improve mobile-first photo intake.
- [ ] Add useful animation and page transitions.
- [ ] Keep accessibility and responsiveness intact.

## Immediate Recommended Focus

**Update 2026-09-13 (Claude Code):** at explicit user request ("carry on
directly up to phase 7"), Phases 2 through 7 were all implemented in one
session, verified with backend type-check + tests, frontend build + tests,
and a manual walkthrough of every new page/flow in the live app (including
finding and fixing a real security gap in the import endpoint — see Phase
3). Status:

- Phase 1: complete.
- Phase 2: complete (9/9 user-facing items), plus dormant external-rating
  fields for later.
- Phase 3: complete.
- Phase 4: core fields complete (ISBN, publisher, year, edition, page count,
  series, translator, tags, condition); ~20 more fields exist in the schema
  only, intentionally without UI (see Phase 4 section for the exact list).
- Phase 5: core complete (lending with active-loan tracking, a unified
  timeline of reading/acquisition/lost-found/external-borrow events); a few
  spec items remain open (due dates, timeline "modes," fuzzy dates — see
  Phase 5 section).
- Phase 6: complete, with one known UI gap (per-book area level/priority/
  notes aren't editable from the add-book-to-area form yet, though the API
  supports them).
- Phase 7: complete, including server-side last-admin protection and a
  documented manual bootstrapping step for the first admin.

Recommended next steps, in order:

1. Use the app for a while as-is before adding more schema. Every phase
   above has intentionally-deferred pieces (see each phase's notes) — treat
   those as a backlog to pull from on explicit request, not a to-do list to
   race through.
2. Revisit ranking: design a multi-source ranking view (personal `myNote`
   + `externalRating`/`externalSource`) instead of reintroducing the old
   single-source badge.
3. Phase 8 (premium UX/UI) is the only phase left with nothing implemented.
   Follow its own checklist above (git checkpoint first) before starting
   visual/design work — do not blend it into further content/workflow
   changes.
