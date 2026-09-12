# Personal Book Library Manager — Design Spec

## Context and Problem

The user owns a large personal book collection spread across multiple physical
storage locations (shelves, boxes, garage) and has no way to track what they
own, what a book is about, or where it physically is. They want a webapp to
catalog books with photos and rich personal metadata (review, rating,
category, purchase info), and to track physical location (also via photos of
the location, with geolocation). The project should start as a private tool
for the user, but be architected so it can be opened to other users later
without a rework.

**Cost constraint (drives the phasing below):** the user does not want to pay
for API calls yet. v1 is entirely manual data entry — no AI vision calls, no
external book-API calls. Automated cover recognition and metadata enrichment
is an explicit, clearly-scoped **v2** to build later once the manual version
is working and the user decides the convenience is worth the API cost.

## Goals (v1)

- Catalog books by taking/uploading a cover photo, then filling in a form
  with rich personal metadata (see Data Model).
- Track *where* each book physically is, using simple named locations that
  can optionally carry a reference photo and a geolocation.
- Show, per book, its rank within its category and overall, computed
  automatically from the user's own ratings — no manual ranking upkeep.
- Support one user privately today, many users (each with their own private
  collection) later, with no architectural rework needed to get there.
- Ship self-hosted on the user's own VPS, consistent with the user's other
  projects (Docker, Postgres, Caddy).

## Goals (v2 — explicitly deferred, not built now)

- Automatic cover identification via AI vision (Claude), auto-filling
  title/author from a photo instead of typing them in.
- Metadata enrichment (description, cover art, price/reviews) from a public
  book API (Google Books / Open Library), pre-filling the form the user
  would otherwise fill by hand.
- Bulk photo upload with a review list (multiple covers processed in one
  batch) — makes the most sense once auto-fill exists; without it, bulk
  upload just means filling out N forms back-to-back, which the v1 UI
  already supports one at a time.

v2 reuses the same `Book`/`Location` data model — the only change is *how* a
book's fields get populated (AI + API call vs. the user typing them in), so
building v1 first creates no rework for v2.

## Non-Goals

- No shared/collaborative libraries (each user's collection is private to
  them — see "Multi-user model" below).
- No barcode/ISBN scanning (not requested; could be added later as another
  optional way to prefill the form, same as v2's AI vision path).
- No native iOS app or share-sheet extension — camera access goes through
  the browser's native file input.
- No S3/object storage — photos live on local disk via a Docker volume, both
  in local dev and once deployed.
- No manually-entered rankings — rank is always computed (see "Ranking").

## Decisions

### Multi-user model
Multi-tenant from day one: every book, location, and photo belongs to a
single owning user. The user will be the only real account initially, but
the schema and auth already support additional users signing up later with
zero migration.

### Frontend stack
Angular (standalone components, signals — matching the user's other
2025-era apps such as `09_lenormand` and `06-lotokarma`) with **Angular
Material + CDK** for UI components: cards for book listings, a reactive form
for adding/editing a book, chips for locations and categories, a rating
control for "my note".

### Backend stack
NestJS + Prisma + Postgres, following the same structure as
`06-lotokarma/backend` and `09_lenormand`'s backend (`PrismaService`/
`PrismaModule` pattern, `Dockerfile`, `prisma.config.ts`).

### Adding a book (v1 core flow — fully manual)
1. User opens "Add book," takes or picks a cover photo
   (`<input type="file" accept="image/*" capture="environment">` — a single
   photo per book in v1, since there's no batch AI step to justify a
   multi-select review list yet).
2. User fills in a form with every field listed under Data Model below
   (title, author, category, language, my note, my review, recommend
   flag, description, location, purchase date, purchase price).
3. Saving the form creates the `Book` row and stores the cover photo on
   disk.
4. For local development (no live camera access available on this
   machine), the same upload control is exercised by picking existing
   image files from a `docs/sample-covers/` folder kept in this repo — no
   separate "dev mode" code path, since a file input accepts a pre-existing
   file exactly like a live camera capture.

### Location tracking
A `Location` is a simple named tag (e.g. "Garage — Box 3", "Living room
shelf") that can optionally have:
- one reference photo, so the user can visually recognize the box/shelf;
- a geolocation (latitude/longitude), captured via the browser's
  `navigator.geolocation` API at the moment the user adds/edits that
  location (opt-in, only if the browser grants permission — not parsed from
  photo EXIF data, which is unreliable once a photo has been resized,
  re-picked from a gallery, or stripped of metadata by the OS).

Each book is assigned to exactly one location (nullable — a book can exist
before it's been placed anywhere). Locations are flat (no hierarchy) — a
deliberate scope cut.

### Ranking
"Ranking in its category" and "ranking overall" are **computed on read, not
stored**: within a user's collection, books are sorted by `myNote`
(descending) to produce a position — once within the subset sharing the same
`category`, once across every book the user owns. Example: "Ranked #2 of 14
in Dystopia, #5 of 90 overall." This keeps rankings always consistent and
means adding, editing, or removing a book never requires renumbering
anything by hand. Books without a `myNote` yet are excluded from ranking
(not shown as "unranked #0").

### Photo storage
All uploaded images (book covers and location reference photos) are written
to local disk under a Docker-managed volume. The same Docker Compose setup
runs identically in local development and on the VPS — no code branches on
environment for storage, and no S3-compatible service is used.

### Data model (Prisma, sketch — final field list decided during
implementation)

- `User { id, email, passwordHash, createdAt }`
- `Location { id, userId, name, photoPath?, latitude?, longitude?, createdAt }`
- `Book`:
  - `id`, `userId`
  - `title` (string, required)
  - `author` (string, required)
  - `category` (string — free-form or a small fixed set decided during
    implementation, e.g. "Fiction", "Sci-Fi", "Essay")
  - `language` (string, e.g. "French", "English")
  - `description` (text, optional — the publisher/back-cover blurb, typed in
    by the user in v1; auto-filled from a book API in v2)
  - `myReview` (text, optional — the user's own written review)
  - `myNote` (integer, optional — the user's own rating, scale decided during
    implementation, e.g. 1–10)
  - `recommend` (boolean, optional — "would I recommend this book")
  - `coverImagePath` (string — path to the stored cover photo)
  - `locationId` (nullable FK to `Location`)
  - `purchaseDate` (date, optional)
  - `purchasePrice` (decimal, optional)
  - `source` (`'manual' | 'ai-vision'` — always `'manual'` in v1; the column
    exists now so v2 doesn't need a migration to add it)
  - `createdAt`

`category` and `language` are plain string columns in v1 rather than lookup
tables — simplest thing that works for one user's collection; can become a
proper reference table later if it ever needs to (e.g. multi-language
category translation) without changing how `Book` relates to everything
else.

## Architecture

```
[Angular PWA] --HTTPS--> [NestJS API] --Prisma--> [Postgres]
     |                         |
     | (photo + form data)     | (disk read/write)
     v                         v
                    [Docker volume: /uploads]
```

v2 adds two more outbound calls from the backend, triggered from the same
"add book" endpoint instead of requiring the user to type everything:

```
                 [Claude API (vision)]   <- extracts title/author from photo
                         |
                         v
              [Google Books / Open Library API]  <- enriches description/etc.
```

- Angular app calls the NestJS API directly for everything: auth, book
  CRUD, location CRUD, and photo upload — all synchronous request/response,
  no queue/worker needed at this scale.
- Deployment follows the existing shared-VPS-Caddy convention documented in
  the `RiskLens` repo's runbook: a `docker-compose.yml` for local dev and a
  `docker-compose.prod.yml` for the VPS, Caddy reverse-proxying
  `books.sn8w.com` to the app container.

## Error Handling

- Photo upload failures (disk full, invalid file type) surface an inline
  form error and do not save the book until resolved.
- All book fields besides `title` and `author` are optional — the user can
  save a minimal record and fill in review/rating/location/etc. later by
  editing the book.
- A book with no `myNote` is simply excluded from both ranking
  computations (never shown as rank "0" or "unranked" noise in the list).

## Testing

- Backend: unit tests for book CRUD (create/update/delete) and for the
  ranking computation (given a fixed set of books with known `myNote`
  values, the category and overall rank returned are correct), matching the
  testing conventions already used in `09_lenormand`'s backend.
- Frontend: component tests for the add/edit book form (validation on
  required fields, photo preview) using the sample cover images in
  `docs/sample-covers/`.
- Manual end-to-end check before shipping: add a handful of books by hand
  covering multiple categories and ratings, confirm the computed rankings
  match a manual sort, assign one to a new location with a photo and
  geolocation, confirm it displays correctly in the book list.

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
- v2 (AI vision + book API enrichment) is picked up as a separate follow-on
  spec once v1 is live and the user decides to take on the API cost.
