# Project improvement review — 2026-09-14

The project already covers the main library workflows. The next proposed milestone is reliability and daily usability before the premium visual redesign. These are proposals, not approved scope changes; no application code was changed in this review.

## Verification and limits

- Backend: 42 tests passed across 10 files; production build passed.
- Frontend: 11 tests passed in ChromeHeadless; production build passed.
- Frontend initial bundle: 972.51 kB raw, approximately 200.51 kB estimated transfer; exceeds the configured 500 kB warning budget.
- Findings below are grounded in source inspection. Database integration and full application/browser flows were not run because the Docker daemon is unavailable.
- The 21st UI review skill was read. The `21st` executable and `.21st/design.json` are absent, so the automated design review was unavailable. Interface findings are from templates, styles, and component logic, not rendered visual QA.
- Existing tests do not cover the admin service, JWT guard, timeline service, ZIP restoration, or book editor component.

## Highest-priority defects

### 1. Account deactivation does not revoke access

Evidence: `backend/src/auth/jwt-auth.guard.ts:13`, `backend/src/auth/admin.guard.ts:9`, `backend/src/auth/auth.service.ts:23`.

The JWT guard only checks the token, and tokens last 30 days. Account activity is checked at login but not on ordinary authenticated requests; the admin guard checks role but not activity. A disabled account with an existing token can continue accessing its library, and a disabled admin can still use admin endpoints.

Proposal: enforce user existence and activity centrally on protected requests; define session revocation behavior. Fail startup in production if JWT_SECRET is absent instead of using the development fallback in `auth.module.ts`.

Acceptance: a token obtained before deactivation is rejected by book and admin endpoints immediately afterward.

### 2. Admin responses expose password hashes

Evidence: `backend/src/admin/admin.service.ts:10`, `:37`, `:51`.

List and update methods return complete Prisma user objects. The narrower TypeScript interface does not remove `passwordHash` at runtime. Exposure is to authenticated admins, not an unauthenticated endpoint.

Proposal: reuse an explicit safe field selection for all admin user responses.

Acceptance: HTTP response tests assert that password hashes never appear in list, role-update, or activation-update responses.

### 3. Uploaded files are public and insufficiently validated

Evidence: `backend/src/main.ts:9`, `backend/src/uploads/multer.config.ts:18`, `backend/src/uploads/zip-upload.config.ts:9`, `backend/src/books/books.service.ts:313`.

Static `/uploads/` bypasses user authorization: anyone knowing a URL can retrieve it. Normal uploads trust a supplied image MIME type and retain the original extension. ZIP import writes referenced entry bytes with their extension without image decoding; the 500 MiB compressed upload limit does not limit decompressed bytes. Files are written before confirming the target book belongs to the caller, allowing orphan files on failure. Book deletion and cover replacement also leave old files behind.

Proposal: serve private media through ownership checks; decode and re-encode supported image formats; restrict decompressed size, entry count, and metadata rows; check ownership before writing; clean up failed/replaced/deleted uploads. Use streaming or bounded temporary storage for large archives.

Acceptance: unauthenticated and cross-user media requests fail; non-images and oversized expanded archives fail cleanly; rejected imports leave no files behind. See [OWASP file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

### 4. “Full local backup” cannot restore a lost library

Evidence: `frontend/src/app/features/books/book-bulk-import.html:126`, `book-bulk-import.ts:50` and `:153`, `backend/src/books/books.service.ts:347` and `:377`.

The backup defaults to incomplete books only. It contains books and compressed covers, excludes locations/loans/areas/timeline/settings, and import only updates records already present. The import whitelist also excludes personal fields such as notes and reading state. It is useful for enrichment, but it cannot reconstruct a deleted or empty library.

Proposal: label the existing flow as an enrichment archive. Separately implement a versioned full backup and restore covering relationships and original media; default full backup to all records. Maintain database and upload-volume backups in the deployment procedure.

Acceptance: restore into an empty test database and verify records, relationships, private notes, states, and media.

### 5. Clearing fields in the editor silently preserves old values

Evidence: `frontend/src/app/features/books/book-detail.ts:313` and `backend/src/books/dto/book-transforms.ts`.

The editor omits empty optional values from PATCH requests. Clearing category, location, personal notes, ISBN, price, or rating therefore leaves the previous value stored. Number/date transforms additionally turn empty values into `undefined`.

Proposal: define a consistent distinction between omitted (unchanged), null (clear), and a supplied value (replace). Share form serialization between create/edit where appropriate while retaining their different semantics.

Acceptance: populate, clear, save, and reload representative text, relation, number, and date fields.

### 6. Lending and timeline consistency need server enforcement

Evidence: `backend/src/timeline/timeline.service.ts:21`, `:29`, `:48`.

Creating a timeline event does not verify ownership of its referenced book. Lending allows multiple open loans for the same book; loan and event writes are separate; repeated return calls rewrite the date and add more events. Lending also leaves `physicalStatus` unchanged, allowing contradictory stored states.

Proposal: validate book ownership, make loan/event changes transactional, enforce one active loan per copy, make returning idempotent, and define how lending interacts with physical status. Make concurrent last-admin checks atomic too.

Acceptance: cross-user timeline associations fail; concurrent lending yields one active loan; a failed event write leaves no partial loan; repeating a return creates no duplicate history.

## Daily usability and performance

### 7. Make sorting usable on mobile and by keyboard

Evidence: `frontend/src/app/features/books/book-list.html:126` and `book-list.scss`.

Sorting is attached to clickable table headers without focus or keyboard handling. Below 700 px the table is hidden in favor of cards, removing the sort controls entirely.

Proposal: semantic sort buttons with announced sort state, plus a visible sort control for cards. Keep multi-column sorting accessible without requiring Shift-click. Also add current-page navigation indication and reduced-motion behavior for animated progress indicators.

### 8. Make mutations observable and predictable

Evidence: inline edit methods in `frontend/src/app/features/books/book-list.ts`; `frontend/src/app/core/books.service.ts:110`.

Inline edit failures silently roll back. List deletion uses `finally` without displaying a mutation error. Rapid edits can overlap; each response replaces the whole cached book, so out-of-order responses can overwrite newer local state.

Proposal: show row-level saving/error feedback with retry, serialize or coalesce writes per book, and handle deletion failures explicitly. Add an unsaved-change guard to the detail editor.

### 9. Prepare for a large collection

Evidence: `backend/src/books/books.service.ts:87`, `frontend/src/app/core/books.service.ts:87`, `frontend/src/app/app.routes.ts`.

The list returns every field of every book and computes rankings no longer displayed. Search and sorting run in the browser; detail lookup depends on the full cached collection. Routes eagerly import all feature pages, consistent with the observed bundle-budget warning.

Proposal: add a single-book endpoint, a paginated compact list response, server-side filtering/sorting, and query-appropriate user/date indexes. Load secondary screens lazily and load only the visible presentation of large lists. Measure against representative collection sizes before adding specialized search infrastructure. See [Angular lazy-route guidance](https://angular.dev/best-practices/performance/lazy-loaded-routes).

### 10. Validate the remaining API boundaries and test complete workflows

Evidence: interface-only request bodies in `backend/src/books/books.controller.ts` and `backend/src/timeline/timeline.controller.ts`.

The global ValidationPipe cannot enforce constraints that exist only in TypeScript interfaces. Imports whitelist fields but do not apply the same value constraints as ordinary book DTOs; malformed row collections can fail outside row-level error handling.

Proposal: concrete validated DTOs for imports, timeline, loans, and admin payloads; bounded collections; consistent field constraints and safe row-level errors. Add focused HTTP/database tests for the defects above and a small browser suite covering create/edit/clear, lending/return, and archive import. Run builds and tests in CI; no `.github` workflow directory is present.

See [NestJS validation documentation](https://docs.nestjs.com/techniques/validation) for runtime limitations of interfaces.

## Product suggestions, separate from defects

- Turn metadata completion into a real queue: filter by metadata status, show the cover beside proposed fields, accept/reject changes, and advance to the next incomplete book. The current badges do not provide this workflow.
- Preserve filters and sorting in URL parameters so opening a book and returning keeps the user's place. Consider named views such as Needs metadata, Currently reading, and Lent out.
- Make bulk capture recoverable: validate count/size before upload, show thumbnails and per-file progress, preserve failures for retry, and provide duplicate suggestions that distinguish editions and intentional extra copies.
- Keep a compact table for inventory work and offer cover-oriented browsing. Existing mobile cards are a useful starting point; validate layouts with actual desktop/mobile rendering during the dedicated design phase.
- Reconcile documentation with current behavior: the roadmap still describes edit routes and mobile horizontal scrolling that have since changed.

## Proposed sequence

1. Access and storage hardening: findings 1–3, ownership checks from 6, and boundary tests from 10.
2. Trustworthy workflows: restore semantics, field clearing, loan consistency, mutation feedback, and keyboard/mobile sorting.
3. Scale and daily use: compact paginated API, lazy routes, persistent list state, and metadata review queue.
4. Premium visual redesign after these workflows are verified, retaining the project's prototype checkpoint strategy.
