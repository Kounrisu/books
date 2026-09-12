# Personal Book Library Manager — Design Spec

## Context and Problem

The user owns a large personal book collection spread across multiple physical
storage locations (shelves, boxes, garage) and has no way to track what they
own, what a book is about, or where it physically is. They want a webapp to
catalog books by photographing covers, with AI-assisted metadata lookup, and
to track physical location (also via photos of the location itself). The
project should start as a private tool for the user, but be architected so it
can be opened to other users later without a rework.

## Goals

- Catalog books by taking (or bulk-uploading) cover photos.
- Automatically identify title/author from a cover photo via AI vision, then
  enrich with metadata (description, cover art, price/reviews) from a public
  book API.
- Track *where* each book physically is, using simple named locations that
  can optionally carry a reference photo.
- Support one user privately today, many users (each with their own private
  collection) later, with no architectural rework needed to get there.
- Ship self-hosted on the user's own VPS, consistent with their other
  projects (Docker, Postgres, Caddy).

## Non-Goals

- No shared/collaborative libraries (each user's collection is private to
  them — see "Multi-user model" below).
- No barcode/ISBN scanning in v1 (AI vision on the cover photo is the sole
  identification method; ISBN scanning could be added later without changing
  the data model).
- No native iOS app or share-sheet extension — camera access goes through
  the browser's native file input.
- No S3/object storage — photos live on local disk via a Docker volume, both
  in local dev and once deployed.

## Decisions

### Multi-user model
Multi-tenant from day one: every book, location, and photo belongs to a
single owning user. The user will be the only real account initially, but
the schema and auth already support additional users signing up later with
zero migration.

### Frontend stack
Angular (standalone components, signals — matching the user's other
2025-era apps such as `09_lenormand` and `06-lotokarma`) with **Angular
Material + CDK** for UI components: cards for book listings, dialogs for the
photo-review-before-confirm step, list/selection patterns for bulk photo
review, chips for locations.

### Backend stack
NestJS + Prisma + Postgres, following the same structure as
`06-lotokarma/backend` and `09_lenormand`'s backend (`PrismaService`/
`PrismaModule` pattern, `Dockerfile`, `prisma.config.ts`).

### Adding a book (core flow)
1. User opens "Add books" and either takes a photo (native camera via
   `<input type="file" capture="environment">` / `getUserMedia`) or
   multi-selects several existing photos from their device
   (`<input type="file" multiple accept="image/*">`) — the same upload
   control handles both a live photo and a bulk pick from the gallery.
2. Each photo is sent to the Claude API (vision-capable model, called from
   the NestJS backend with an API key in the environment config) to read the
   title/author directly off the cover.
3. The extracted title/author is used to query a free book API (Google
   Books API and/or Open Library) for the rest of the metadata: description,
   cover art, and whatever pricing/review data is available.
4. Results are shown as a **review list** — one entry per photo — where the
   user can correct a misread title/author before confirming. Confirming
   saves the book (plus its original cover photo) to their collection.
5. For local development (no live camera access available), the same upload
   flow is exercised against a folder of sample cover images kept in
   `docs/sample-covers/` in this repo — no separate "dev mode" code path is
   needed since file-input upload already accepts pre-existing files
   identically to a live camera capture.

### Location tracking
A `Location` is a simple named tag (e.g. "Garage — Box 3", "Living room
shelf") that can optionally have one reference photo attached, so the user
can visually recognize the box/shelf. Each book is assigned to exactly one
location. Locations are flat (no hierarchy) — this is a deliberate scope cut;
see Non-Goals.

### Photo storage
All uploaded images (book covers and location reference photos) are written
to local disk under a Docker-managed volume. The same Docker Compose setup
runs identically in local development and on the VPS — no code branches on
environment for storage, and no S3-compatible service is used.

### Data model (Prisma, sketch — final field list decided during
implementation)

- `User { id, email, passwordHash, createdAt }`
- `Book { id, userId, title, author, description?, coverImagePath,
  sourceApiId?, source ('google-books' | 'open-library' | 'manual'),
  locationId?, createdAt }`
- `Location { id, userId, name, photoPath?, createdAt }`

`Book.locationId` is nullable (a book can exist before it's been assigned a
place), `Location` belongs to a `User` (multi-tenant from the start, per the
decision above).

## Architecture

```
[Angular PWA] --HTTPS--> [NestJS API] --Prisma--> [Postgres]
     |                         |
     | (photo upload)          | (disk read/write)
     v                         v
                    [Docker volume: /uploads]
                         |
                         v
              (title/author extraction)
                 [Claude API (vision)]
                         |
                         v
              [Google Books / Open Library API]
```

- Angular app calls the NestJS API directly for everything: auth, book
  CRUD, location CRUD, and photo upload.
- Photo upload endpoint writes the file to the Docker volume and kicks off
  the vision-AI + book-API enrichment synchronously (small personal-scale
  workload — no queue/worker needed for v1).
- Deployment follows the existing shared-VPS-Caddy convention documented in
  the `RiskLens` repo's runbook: a `docker-compose.yml` for local dev and a
  `docker-compose.prod.yml` for the VPS, Caddy reverse-proxying
  `books.sn8w.com` to the app container.

## Error Handling

- If the vision AI fails to read a cover (blurry photo, no title visible),
  the review-list entry shows an empty title/author for manual entry rather
  than blocking the whole batch.
- If the book API returns no match for an extracted title/author, the book
  is still saved with just the AI-read title/author and no extra metadata —
  enrichment is best-effort, never a hard requirement to save a book.
- Photo upload failures (disk full, invalid file type) surface an inline
  error on that specific photo in the review list; other photos in the same
  batch are unaffected.

## Testing

- Backend: unit tests for the book-creation flow (given a mocked vision-AI
  response and a mocked book-API response, the correct `Book` row is
  created), matching the testing conventions already used in
  `09_lenormand`'s backend.
- Frontend: component tests for the review-list (confirm/edit/discard a
  reviewed photo) using the sample cover images in `docs/sample-covers/`.
- Manual end-to-end check before shipping: upload a batch of sample covers
  locally, confirm each is correctly identified and enriched, assign one to
  a new location with a photo, confirm it displays correctly in the book
  list.

## Repository and Deployment

- New local project at `C:\dev\dev-projects\21-books`.
- Private local-only git repo initially (no remote configured yet, per this
  session's `dev-projects` conventions); a private "Kounrisu" GitHub repo
  (`kounrisu/books`) will be created and pushed to once the user is ready —
  this is a separate, explicit step, not part of initial scaffolding.
- Eventual public URL: `books.sn8w.com`.
- Deploy to the VPS only after the app is fully built and verified locally,
  as an explicit follow-up step (matching how the kanji-stroke-animator
  project was sequenced).
