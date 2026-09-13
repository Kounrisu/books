# Books
> Generated: 2026-09-13 | Path: `C:\dev\dev-projects\21-books`

## Purpose

Books is a private, self-hosted personal library manager for cataloging,
locating, annotating, importing, exporting, and understanding a personal book
collection.

## Why This Exists

The app is not only a reading tracker. It is a personal knowledge and inventory
system for books: owned books, ebooks, wanted books, unread books, project
books, borrowed books, library/rental books, missing books, favorites, notes,
reviews, timelines, and learning or genre areas.

It is also intended to become a reusable development pattern: first build a
complete Angular Material functional prototype, then preserve it and run a
separate premium UX/UI transformation once the content model and workflows are
proven.

## What Has Been Done

- Built a real Angular frontend and NestJS backend.
- Added Prisma/PostgreSQL persistence.
- Added authentication and private user-scoped library behavior.
- Added book and location workflows with real backend integration.
- Added product documentation under `docs/product/`.
- Added a global product/design spec under `docs/superpowers/specs/`.
- Added shared AI handoff guidance in `docs/AI_HANDOFF.md`.
- Added `AI_CONVERSATION_LOG.md` as cross-agent working memory.
- Added a phase strategy: functional prototype first, premium UX/UI second.

## Current Product Direction

Phase 1 through Phase 7 focus on content, data, workflows, and reliability:
what the app needs to know, store, search, edit, import, export, and manage.

Phase 8 focuses on delivery and experience design: how that content should be
presented through layout, hierarchy, brand, motion, mobile capture, and a
premium browsing experience.

## Technical Stack

- Frontend: Angular, TypeScript, Angular Material/CDK.
- Backend: NestJS, Prisma, PostgreSQL.
- Uploads: local uploaded image storage through Docker volumes.
- Local/dev deployment: Docker Compose.
- Documentation: componentized product specs plus shared AI handoff docs.

## How To Run

From the project root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Sample cover images: `docs/sample-covers/`

## AI Notes

Start with these files:

1. `README.md`
2. `CLAUDE.md`
3. `PROJECT_OVERVIEW.md`
4. `docs/AI_HANDOFF.md`
5. `docs/product/PRODUCT_OVERVIEW.md`
6. `docs/product/ROADMAP.md`
7. `docs/superpowers/specs/2026-09-13-books-library-design.md`
8. `AI_CONVERSATION_LOG.md`

Do not bury product decisions only in chat. If the user gives a new product
idea, triage it against the roadmap and update the correct global, page,
component, or conversation-log document.
