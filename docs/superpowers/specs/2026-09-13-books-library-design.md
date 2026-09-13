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
- Import one or many book cover photos to create book records quickly, then
  complete their metadata later through manual edits or AI-assisted
  export/import. Single-photo and bulk-photo intake are the same capability,
  with bulk simply allowing multiple files in one session.
- Track *where* each book physically is, using a hierarchy of named places
  and sublocations that can optionally carry a reference photo and a
  geolocation.
- Track whether the user owns the book physically, as an ebook, or both.
- Track books the user temporarily gets from outside sources such as a public
  library, company library, friend, rental service, or other lender.
- Track books the user does not own yet but wants to buy, own, or read someday.
- Track books the user owns but has not read yet, favorite books, and books
  saved for a project or learning goal even if they are not favorites.
- Support focused collection areas for genres, media formats, subjects, or
  learning/project goals, such as romance, western, polar/crime, manga, bande
  dessinee, magazines, programming, or language learning.
- Track uncertain physical states such as unknown location or lost.
- Track history over time: when the user read a book, bought/acquired it,
  rented/borrowed it from an external library/source, lent it to someone else,
  returned it, or got it back.
- Support multiple timeline views, including personal history, publication
  history, original composition/writing period, historical era, and approximate
  or unknown dates.
- Support borrowing history so the user can know who borrowed a book, when it
  left, and whether it was returned.
- Make the library browsable at real collection size with sorting, name
  search, type/category filters, and an advanced filter panel that can be
  toggled open only when needed.
- Show, per book, its rank within its category and overall, computed
  automatically from the user's own ratings — no manual ranking upkeep.
- Store both the user's own review/note and optional external public signals
  such as Amazon rating/rank when the user knows them or imports them.
- Store rich bibliographic, physical-copy, reading-status, ebook, external-id,
  and AI-metadata-review fields so the user's database can become a serious
  personal library record rather than a minimal reading list.
- Support export/import so the database can be exported to the computer,
  completed or enriched with AI tools such as ChatGPT/Claude, then fed back
  into Postgres.
- Support roles so an admin can manage users while regular users only manage
  their own private library.
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
- Optional external marketplace/public review enrichment (for example Amazon
  rating and Amazon rank) when a reliable and acceptable data source is chosen.
- Bulk photo upload with a review list (multiple covers processed in one
  batch) with automatic recognition and prefill.

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

### Product/design documentation
Global product requirements live in this spec. Page-level requirements live in
`docs/product/pages/`, with one spec per screen or major workflow describing
the current state and the wanted state. Future moodboards, visual references,
and product-design assets live in `docs/product/assets/`.

### Multi-user model
Multi-tenant from day one: every book, location, and photo belongs to a
single owning user. The user will be the only real account initially, but
the schema and auth already support additional users signing up later with
zero migration.

### Roles and administration
Users have roles. The minimum roles are:
- `admin`: can manage users and access admin-only screens.
- `user`: can manage only their own private library.

Regular library data remains user-scoped: books, locations, uploads, loans,
and imports belong to a single owning user. Admin access does not make the app
a shared/collaborative library; it only allows operational user management.

The first account can be made admin during initial setup or via a controlled
database/admin script. Self-registration should not allow a user to choose the
admin role.

Admin capabilities should eventually include:
- viewing registered users;
- creating or inviting users if self-registration is disabled later;
- changing a user's role;
- disabling/reactivating users;
- resetting operational account state when needed;
- seeing basic account metadata such as email, role, created date, and active
  status.

Admin actions should be auditable enough for a private self-hosted tool. At
minimum, destructive or privilege-changing actions should require explicit
confirmation in the UI and server-side role checks.

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
   (identity, bibliographic metadata, contributors, tags/subjects, reading
   status, notes/reviews, physical/ebook ownership, location, purchase data,
   external ids, and optional external rating/rank).
3. Saving the form creates the `Book` row and stores the cover photo on
   disk.
4. For local development (no live camera access available on this
   machine), the same upload control is exercised by picking existing
   image files from a `docs/sample-covers/` folder kept in this repo — no
   separate "dev mode" code path, since a file input accepts a pre-existing
   file exactly like a live camera capture.

### Photo intake and AI-assisted completion
The app must support importing either one book cover photo or many book cover
photos at once. This is a fast capture workflow for an existing physical
collection, not the same as fully automatic AI recognition.

Phase 1 photo intake should:
- accept a single image file or multiple image files in one import session;
- create one incomplete `Book` record per photo;
- store each uploaded photo as that record's `coverImagePath`;
- mark imported records as needing metadata completion;
- allow optional shared defaults for the batch, such as ownership format,
  location, category/type, or language;
- show an import review/result screen with created records and upload errors.

After photo intake, the user can export the incomplete database, use AI tools
such as ChatGPT/Claude/Gemini to identify books and complete metadata, then
import the enriched data back into Postgres through the import workflow.

Automatic title/author extraction directly from the uploaded photos remains a
v2 enhancement unless the user explicitly decides to add AI/API cost earlier.

### Browsing, sorting, and filtering
The book list must scale beyond a handful of rows. The default browsing view
should support:
- sorting by title, author, category/type, user note, external rating, purchase
  date, created date, publication year, page count, reading status, condition,
  ownership format, and location;
- quick text search by title, author, description, spoiler/summary notes, and
  personal notes;
- visible high-value filters such as category/type and ownership format;
- an advanced filter panel that can be toggled open for less common filters
  such as location hierarchy, borrowed status, purchase date range, user note
  range, external rating/rank range, recommendation status, language, and
  missing metadata. Additional advanced filters should include format,
  condition, reading status, publisher, publication year range, series, tags,
  genres, subjects, audience, acquisition source, ebook format/source, metadata
  confidence, and metadata review status.

The table can remain useful for dense comparison, but the product should also
support a more readable book browsing layout later (cards or list rows with
cover-forward hierarchy).

### Location and ownership tracking
A `Location` is a named place or sublocation. Top-level locations are broad,
renameable places such as "Home", "Garage", or "Second home". Each top-level
place can contain more specific sublocations such as "Living room shelf",
"Office bookcase", "Garage box 3", or "Second home bedroom shelf".

Each location can optionally have:
- one reference photo, so the user can visually recognize the box/shelf;
- a geolocation (latitude/longitude), captured via the browser's
  `navigator.geolocation` API at the moment the user adds/edits that
  location (opt-in, only if the browser grants permission — not parsed from
  photo EXIF data, which is unreliable once a photo has been resized,
  re-picked from a gallery, or stripped of metadata by the OS).

Each physical book is assigned to zero or one current location. A book can
exist before it has been placed anywhere. A book can also be owned as an ebook
instead of a physical copy, or as both physical and ebook. Ebook-only books do
not require a physical location.

Physical books may also have uncertain status. A book can be marked as unknown
location when the user knows they own it but does not know where it is, or lost
when it is believed missing. These states are separate from the named
`Location` hierarchy and should be filterable.

The app also supports non-owned intention records: books the user wants to
have, buy, read, or remember. These records can exist without purchase data or
physical location. If the user later acquires the book, the record can move
from wishlist/intention into owned physical/ebook/both status.

### Collection areas, genres, media types, and learning focus
The app should support focused collection areas. A collection area is a
workspace around a genre, media type, subject, or learning/project goal. It can
be used for romance, western, polar/crime, manga, bande dessinee, magazine,
real/physical books, programming, Japanese, French, design, finance, or another
topic.

An area is stronger than a tag because it can have its own page, notes, goals,
book list, owned/missing split, and area-specific ranking. Some areas are
simple catalog groupings (for example manga or romance). Other areas are
learning/project workspaces (for example programming or language learning).

Each collection area should support:
- a title/name;
- area kind, such as genre, media type, subject, learning project, research
  project, or custom;
- optional description;
- optional objectives/goals, especially for learning/project areas;
- free-form notes and ideas;
- status, such as planned, active, paused, completed, or reference;
- related books the user owns;
- related books the user wants/needs but does not own;
- per-book area level, such as beginner, intermediate, advanced, reference, or
  unknown when relevant;
- per-book priority/usefulness within that area;
- optional area-specific notes for why a book matters.

The same book can belong to multiple collection areas with different levels,
priority, and notes in each area.

### Borrowing history
The app must support lending a physical book to a friend and keeping history.
For each loan, store who borrowed the book, when it was borrowed, optional
notes, and when it was returned. The current book state should make it obvious
when a book is currently borrowed and by whom, while preserving past loans even
after the book is returned.

The app must also support books the user borrows or rents from outside sources,
such as a public library, company library, friend, rental service, school, or
other institution. These are not owned books, but they may still have reading
history, notes, ratings, and return due dates.

### Reading, acquisition, rental, and timeline history
The app should preserve history instead of only storing the latest state. The
user should be able to see when they read a book, when they bought/acquired it
if known, when they borrowed or rented it from an external source, when it was
due, when it was returned, and when they lent owned books to others.

The app should also support timelines that are not about the user's personal
life. Some books may be ancient, historical, republished many times, or known
only by approximate dates. For example, a Greek classical text may have an
original composition era centuries before the user's edition was printed.

The app should support a timeline page that combines important events across
the library:
- reading started/finished;
- book acquired/bought/gifted/inherited;
- book borrowed from an external source;
- external borrow/rental due date;
- external borrow/rental returned;
- owned book lent to someone else;
- owned book returned by borrower;
- book marked lost/found;
- metadata imported/reviewed if useful.

Timeline modes should include:
- personal timeline: reading, acquisition, external borrow/rental, lending,
  lost/found, metadata review;
- publication timeline: publication year/date of the edition in the user's
  catalog;
- original work timeline: original writing/composition date or era;
- historical/setting timeline: historical period represented by the book,
  when relevant;
- print/edition timeline: print date, edition date, or release date of the
  physical copy/edition if known.

Dates can be exact, approximate, partial, or unknown. The UI must not pretend
an approximate date is exact. This timeline helps answer "what did I read and
when?", "when did I buy or rent this?", "what is currently due or borrowed?",
"when was this edition published?", and "where does this work sit in history?".

### Ranking
"Ranking in its category" and "ranking overall" are **computed on read, not
stored**: within a user's collection, books are sorted by `myNote`
(descending) to produce a position — once within the subset sharing the same
`category`, once across every book the user owns. Example: "Ranked #2 of 14
in Dystopia, #5 of 90 overall." This keeps rankings always consistent and
means adding, editing, or removing a book never requires renumbering
anything by hand. Books without a `myNote` yet are excluded from ranking
(not shown as "unranked #0").

External public signals are separate from personal ranking. The user's own
`myNote` drives personal category/overall ranking; optional fields such as
Amazon rating or Amazon rank are stored/displayed as external metadata and can
be used for sorting/filtering, but they do not replace personal ranking.

**UI status (2026-09-13):** the computed category/overall ranking badge was
removed from the books list and detail page. The single-source, `myNote`-only
ranking wasn't useful yet, and the product wants a proper multi-source
ranking view — the user's own rating alongside one or more external ratings
(Amazon-style) — before showing ranking again. `externalRating`,
`externalRank`, and `externalSource` now exist on `Book` (schema, API, and
frontend type) for exactly this, but are intentionally not wired into any
form or display yet. The backend computation in `ranking.ts` is untouched.
Future ranking UI work should design around these multi-source fields
instead of reintroducing the old single computed badge as-is.
The app must support exporting the user's library database to local files so
AI tools such as ChatGPT or Claude can inspect and complete missing metadata
outside the app. The import flow must then feed the completed data back into
Postgres.

The export/import format should be human-editable and scriptable, such as CSV
for tabular metadata plus a JSON option for nested data like locations and
borrowing history. Import must validate required fields, preserve ownership
scoping, and avoid blindly corrupting existing rows; exact conflict behavior is
decided during implementation.

For photo intake workflows, exports must include enough stable identifiers to map
AI-completed metadata back to the placeholder book records created from photos.
At minimum this means book id, cover image path or filename, and any available
metadata fields.

### Photo storage
All uploaded images (book covers and location reference photos) are written
to local disk under a Docker-managed volume. The same Docker Compose setup
runs identically in local development and on the VPS — no code branches on
environment for storage, and no S3-compatible service is used.

### Data model (Prisma, sketch — final field list decided during
implementation)

- `User { id, email, passwordHash, role, isActive, createdAt }`
- `Location { id, userId, parentLocationId?, name, photoPath?, latitude?,
  longitude?, createdAt }`
- `BookLoan { id, userId, bookId, borrowerName, borrowedAt, returnedAt?,
  notes?, createdAt }`
- `BookExternalBorrow { id, userId, bookId, sourceName, sourceType,
  borrowedAt, dueAt?, returnedAt?, cost?, currency?, notes?, createdAt }`
- `BookReadEvent { id, userId, bookId, startedAt?, finishedAt?, status,
  notes?, createdAt }`
- `BookAcquisitionEvent { id, userId, bookId, acquisitionType, acquiredAt?,
  sourceName?, price?, currency?, notes?, createdAt }`
- `BookTimelineEvent { id, userId, bookId?, eventType, occurredAt, title,
  notes?, createdAt }` (optional denormalized/event-log model if implementation
  chooses a unified timeline table instead of deriving from typed event tables)
- `CollectionArea { id, userId, title, kind, description?, objectives?,
  notes?, ideas?, status, createdAt, updatedAt }`
- `CollectionAreaBook { id, userId, areaId, bookId, areaLevel?, priority?,
  relationStatus?, notes?, createdAt }`
- `Book`:
  - `id`, `userId`

  **Identity and bibliographic metadata**
  - `title` (string, required)
  - `subtitle` (string, optional)
  - `originalTitle` (string, optional)
  - `author` (string, required)
  - `publisher` (string, optional)
  - `publishedDate` (date or string, optional)
  - `publicationYear` (integer, optional)
  - `originalYear` (integer, optional — original writing/composition year when
    known)
  - `originalDateText` (string, optional — fuzzy date/era such as "c. 750 BCE",
    "5th century BCE", "Greek antiquity")
  - `historicalPeriod` (string, optional — era/period represented by or
    associated with the work)
  - `settingDateText` (string, optional — fuzzy date/period of the story or
    subject if useful)
  - `printDate` (date or string, optional — physical edition/printing date
    when known)
  - `datePrecision` (string, optional — exact, year, decade, century,
    approximate, unknown)
  - `edition` (string, optional)
  - `isbn10` (string, optional)
  - `isbn13` (string, optional)
  - `pageCount` (integer, optional)
  - `category` / `type` (string — free-form in the prototype, filterable in
    the UI; can become a proper reference table later)
  - `language` (string, e.g. "French", "English")
  - `originalLanguage` (string, optional)
  - `seriesName` (string, optional)
  - `seriesNumber` (string or decimal, optional)
  - `genres` (string array or related table, optional)
  - `subjects` (string array or related table, optional)
  - `tags` (string array or related table, optional — free-form personal tags)
  - `audience` (string, optional — e.g. adult, YA, children, academic)

  **Library/intention state**
  - `libraryStatus` (`'owned' | 'wishlist' | 'want_to_read' | 'want_to_buy' |
    'saved_for_later' | 'borrowed_external' | 'rented'`) — whether this is
    owned, an intention/idea, or temporarily available from an outside source
  - `savedList` (string, optional — e.g. "Project learning", "Learning",
    "Research", "Someday", used for non-favorite saved books)
  - `areaLevel` (`'beginner' | 'intermediate' | 'advanced' | 'reference' |
    'unknown'`, optional — default/global level when relevant and not tied to
    a specific collection area)
  - `isFavorite` (boolean — user's preferred/favorite books)
  - `priority` (string or integer, optional — useful for reading/project queue)

  **Contributors**
  - `translator` (string, optional)
  - `illustrator` (string, optional)
  - `editor` (string, optional)
  - `contributors` (structured JSON or related table, optional — additional
    named contributors/roles)

  **Descriptions, notes, and review**
  - `description` (text, optional — the publisher/back-cover blurb, typed in
    by the user in v1; auto-filled from a book API in v2)
  - `spoilerNotes` (text, optional — private spoiler/summary notes for the
    user; should be visually distinct from spoiler-free description)
  - `personalNotes` (text, optional — loose notes about the book, separate
    from the structured review)
  - `myReview` (text, optional — the user's own written review)
  - `myNote` (integer, optional — the user's own rating, scale decided during
    implementation, e.g. 1–10)
  - `quotes` (structured JSON or related table, optional — favorite passages)
  - `contentWarnings` (string array or text, optional)
  - `externalRating` (decimal, optional — public/external rating such as
    Amazon rating when known/imported)
  - `externalRank` (string or number, optional — public/external rank such as
    Amazon sales/category rank when known/imported)
  - `externalSource` (string, optional — e.g. "Amazon", used to identify where
    the external rating/rank came from)
  - `recommend` (boolean, optional — "would I recommend this book")

  **Reading status**
  - `readingStatus` (`'unread' | 'reading' | 'read' | 'abandoned' |
    'reference_only'`)
  - `dateStarted` (date, optional)
  - `dateFinished` (date, optional)

  **Ownership and physical copy**
  - `ownershipFormat` (`'none' | 'physical' | 'ebook' | 'both'`) — `none` is
    for wishlist/intention records the user does not own yet
  - `mediaType` (string, optional — book, manga, bande dessinee, magazine,
    real/physical book, ebook, audiobook, etc.)
  - `physicalStatus` (`'in_collection' | 'unknown_location' | 'lost' |
    'lent_out'`, optional)
  - `format` (string, optional — hardcover, paperback, pocket, ebook,
    audiobook, etc.)
  - `condition` (string, optional — new, good, damaged, annotated, missing
    pages, etc.)
  - `inventoryCode` (string, optional — internal shelf/inventory code)
  - `barcode` (string, optional — user-created/internal barcode if labels are
    printed later)
  - `copyNotes` (text, optional — signed, gift from someone, annotated, rare
    edition, etc.)
  - `dimensions` (string or structured JSON, optional)
  - `weight` (decimal/string, optional)
  - `coverImagePath` (string — path to the stored cover photo)
  - `metadataStatus` (`'complete' | 'needs_metadata' | 'needs_review'`) —
    useful for photo imports and AI-assisted enrichment
  - `locationId` (nullable FK to `Location`)

  **Purchase and acquisition**
  - `purchaseDate` (date, optional)
  - `purchaseDateText` (string, optional — when exact date is unknown, e.g.
    "around 2018", "before moving", "unknown")
  - `purchasePrice` (decimal, optional)
  - `currency` (string, optional)
  - `acquisitionSource` (string, optional — Amazon, bookstore, gift,
    inherited, library sale, etc.)
  - `acquisitionType` (string, optional — bought, gift, inherited, borrowed
    external, rented, library loan, company library, etc.)

  **Ebook-specific data**
  - `ebookFormat` (string, optional — epub, pdf, mobi, azw, etc.)
  - `ebookSource` (string, optional — Kindle, Kobo, local file, public domain,
    etc.)
  - `ebookFilePath` (string, optional — only if the app later stores or links
    local ebook files)
  - `drmStatus` (string, optional)

  **External ids and AI/import metadata**
  - `externalIds` (structured JSON or related table, optional — Amazon ASIN,
    Google Books ID, Open Library ID, Goodreads ID, LibraryThing ID, etc.)
  - `sourceUrl` (string, optional)
  - `metadataConfidence` (`'high' | 'medium' | 'low'`, optional)
  - `metadataReviewedAt` (date, optional)
  - `duplicateGroupId` (string, optional — groups possible duplicates)
  - `possibleDuplicate` (boolean, optional)
  - `source` (`'manual' | 'ai-vision'` — always `'manual'` in v1; the column
    exists now so v2 doesn't need a migration to add it)
  - `createdAt`

`category`/`type` and `language` can remain plain string columns in the
prototype rather than lookup tables — simplest thing that works for one user's
collection. The UI still needs practical filtering around them. They can
become proper reference tables later if they ever need to (e.g. multi-language
category translation) without changing how `Book` relates to everything else.

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
