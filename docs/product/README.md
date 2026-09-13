# Product Design Specs

This folder is the product/design source of truth for the Books webapp.

Use it alongside, not instead of, the main implementation spec:
`docs/superpowers/specs/2026-09-13-books-library-design.md`.

Start with `PRODUCT_OVERVIEW.md` for a concise description of what the webapp
is.

Use `ROADMAP.md` to track product progress by phase.

Use `REFERENCE_PROJECTS.md` to understand lessons borrowed from sibling
projects such as LotoKarma, Lucky Stocks, and Lenormand.

Use `../AI_HANDOFF.md` when sharing the project with another AI assistant.

## How to Work With AI and Designers

- Keep one global product spec for the overall app direction, data model, and
  cross-cutting rules.
- Keep one page spec per screen or major workflow.
- Treat each page like a container component. The page spec describes the
  screen-level goal, composition, and states.
- Treat each feature inside a page like a child component. Each child component
  gets its own markdown file and is linked from the page spec.
- Keep visual references, moodboards, screenshots, and brand inspiration in
  `assets/`.
- Update the relevant page spec and component spec before asking an AI agent or
  designer to build or redesign that area.
- Describe both the current state and the desired state. This helps avoid
  losing existing behavior while improving the page.

## Folder Structure

- `pages/` — one spec per screen or workflow.
- `components/` — one spec per feature/component inside a page.
- `assets/moodboard/` — future product moodboards, screenshots, palettes,
  typography references, and visual direction.
- `assets/references/` — competitor screenshots, UX references, diagrams, or
  annotated examples.

## Suggested Workflow

1. Start from the global product spec for app-wide rules.
2. Open the relevant page spec in `pages/`.
3. Open the linked component specs in `components/`.
4. Add any visual references to `assets/moodboard/` or `assets/references/`.
5. Ask AI or a designer for a prototype/implementation plan using the global
   product spec, the page spec, and the relevant component specs.
6. Implement the feature.
7. Update page/component specs when decisions change.

## Page Spec Index

- `pages/00-template.md` — reusable template.
- `pages/01-login.md` — authentication entry point.
- `pages/02-books-list.md` — main library browsing page.
- `pages/03-book-form.md` — add/edit book workflow.
- `pages/04-book-detail.md` — individual book detail page.
- `pages/05-locations.md` — places, sublocations, and location management.
- `pages/06-borrowing.md` — loan/return history workflow.
- `pages/07-import-export.md` — AI-assisted database export/import workflow.
- `pages/08-admin.md` — admin-only user and role management.
- `pages/09-bulk-photo-import.md` — single or bulk cover photo intake workflow.
- `pages/10-collection-areas.md` — collection area / genre / learning workspace.
- `pages/11-timeline.md` — reading, acquisition, rental, and borrowing history.

## Component Spec Index

- `components/00-component-template.md` — reusable component spec template.
- `components/books-list/search-and-filters.md`
- `components/books-list/sorting.md`
- `components/books-list/book-row-card.md`
- `components/book-form/metadata-fields.md`
- `components/book-form/ownership-and-location.md`
- `components/book-detail/notes-and-spoilers.md`
- `components/locations/location-hierarchy.md`
- `components/borrowing/loan-history.md`
- `components/import-export/export-import-format.md`
- `components/admin/user-management.md`
- `components/admin/roles-and-permissions.md`
- `components/bulk-import/photo-batch-upload.md`
- `components/bulk-import/import-review-queue.md`
- `components/areas/area-overview.md`
- `components/areas/area-book-list.md`
- `components/areas/area-notes-objectives.md`
- `components/timeline/timeline-feed.md`
- `components/timeline/reading-history.md`
- `components/timeline/acquisition-rental-history.md`
- `components/shared/loading-empty-error-states.md`
