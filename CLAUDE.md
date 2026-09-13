# Project Context: Books Management Webapp

## Goal
A real, working personal book library manager — not a throwaway mock-up. The backend (NestJS + Prisma + Postgres) and frontend (Angular + Material) are both real and already verified end-to-end (auth, multi-tenant scoping, photo uploads, computed rankings). Keep components decoupled, modular, and cleanly separated between logic and presentation so the app stays easy to extend (v2: AI-assisted cover recognition, book-API enrichment — see the design spec).

Product requirements live in `docs/superpowers/specs/2026-09-13-books-library-design.md`. Use that spec as the source of truth for feature scope, data-model changes, and workflow expectations; keep this file focused on engineering and phase guidance.

For AI-to-AI handoff, read `docs/AI_HANDOFF.md`. Despite this file's name,
the guidance applies to Claude Code, ChatGPT, Codex, Gemini, Cursor-style
agents, and GitHub issue/PR agents.

When the user gives new product instructions, first triage them through
`docs/AI_HANDOFF.md`: check whether they belong to the current roadmap phase,
should be documented for later, require a new page/component spec, or need
clarification. Do not bury valid product decisions only in chat.

After meaningful product or implementation conversations, append a concise
entry to `AI_CONVERSATION_LOG.md` so other AI assistants can understand
what the user asked, how it was interpreted, what changed, and what remains
open.

## Tech Stack & Conventions
- Angular (Modern standalone components, Signals for state, inject(), modern control flow @if / @for)
- Angular Material + Angular CDK for fast accessible primitives
- Tailwind CSS or simple flex/grid utility layout (no inline CSS spaghetti)

## Product Phase Strategy
Build the app in two deliberate phases. Do not collapse the premium redesign
into the prototype phase.

The product philosophy is content first, delivery second, with both phases
treated as important product work. First define what the app needs to know,
store, search, edit, import, export, and explain. Then decide how that content
should be delivered through layout, hierarchy, brand, motion, and emotion.
Phase 2 is not cosmetic cleanup; it is the dedicated experience-design phase
that turns the proven content/workflow system into something beautiful and
memorable.

### Phase 1: Functional Prototype
The current phase is about a complete, reliable, self-hosted personal library
manager. Use Angular Material/CDK heavily for speed, accessible primitives, and
predictable behavior. Prioritize complete workflows over visual flourish:
auth, books, locations, photo upload, edit/delete flows, search/filter/sort,
detail views, loading states, error states, empty states, and responsive basics.

Phase 1 styling should be clean and restrained: coherent spacing, readable
hierarchy, sensible responsive layout, and no raw unstructured Material stacks.
Avoid expensive visual systems, custom animation, heavy branding, marketing
heroes, showcase-style presentation pages, or bespoke controls unless they
directly improve the prototype's usability. This phase should answer: what
content exists, what data is needed, what workflows must work, and what states
the app must handle.

### Phase 2: Premium UX/UI Transformation
After the prototype works end-to-end, treat the visual upgrade as a separate
design sprint. This is where to create the custom theme, brand direction, art
direction, motion system, richer book presentation, photography/cover-forward
layouts, and polished transitions. The target can be a beautiful,
presentation-quality experience, but only after the core workflows are proven.

In Phase 2, replace the generic Material feel with composed custom surfaces
while keeping Material/CDK behavior where it remains useful. This phase should
answer: how should the content be discovered, felt, compared, remembered, and
presented so the app becomes a premium product rather than only a working tool.

## Prototype Success Criteria
The prototype is done when:
- A user can register/login and manage their private library.
- Books can be created with cover photo, title, author, category, language,
  rating, review, recommendation, purchase info, and location.
- Locations can be created with photo and optional geolocation.
- Books can be browsed, searched, filtered, sorted, viewed in detail, edited,
  and deleted.
- Loading, empty, error, and submit states are visible.
- The app works on desktop and mobile without layout breakage.
- The backend, database, upload storage, auth, and Docker flow are real, not
  mocked.

## UI & Visual Guidelines (Avoid "Unstyled Material" Look)
1. Shell & Layout First:
   - Every view must sit inside a coherent structure: App bar / Topbar (`mat-toolbar`), responsive main container (`max-w-6xl mx-auto px-4 py-6`), or a standard sidebar layout (`mat-sidenav-container`).
   - Never stack raw `<mat-card>` or inputs vertically without explicit grid or flex gaps (`gap-4` or `gap-6`).

2. Angular Material Setup:
   - Ensure an Angular Material theme (e.g., indigo-pink or azure-blue) and Material Symbols/Icons font are correctly loaded in `styles.scss` / `index.html`.
   - Use consistent form-field density: `<mat-form-field appearance="outline" class="w-full">`.

3. Visual Hierarchy & Minimalism:
   - Neutral backgrounds (`bg-slate-50` or `#f8fafc`) with white surface cards (`bg-white`).
   - Use cards sparingly: group functional zones logically rather than wrapping every single input or label in a card.
   - Primary action buttons: `mat-flat-button` with `color="primary"`. Secondary: `mat-stroked-button`.

4. Phase 1 UX Rules:
   - Prefer Angular Material components over custom controls.
   - Use tables only where comparison matters; use book cards or list rows for browsing.
   - Group long forms into meaningful sections instead of one flat stack.
   - Add search/filter/sort before visual flourish.
   - Use simple responsive layouts and accessible controls.
   - Do not add decorative animation unless it supports feedback, transition, or clarity.
   - Do not spend time on a marketing-style hero or showcase homepage during the prototype.

5. Phase 2 UX Direction:
   - Create a separate UX/UI redesign plan before starting the premium visual pass.
   - Define brand direction, visual mood, custom Material theme, and design tokens.
   - Design a premium book browsing experience with large covers and rich detail views.
   - Define motion for page transitions, list interactions, upload feedback, hover states, and focus states.
   - Revisit the mobile-first capture flow for adding books.
   - Add an optional public/demo presentation layer only if the app needs to impress other people.

## Code & Architecture Strategy
- Demo/Seed Data: Lives in the real Postgres database, added through the real API (register a user, then `POST /locations` and `POST /books`) — never faked in `*.mock.ts` files or in-memory services. If you need a quick batch of demo rows, script it against the running API (see how the current demo books/locations were seeded), not by hardcoding fixtures in the frontend.
- Thin Components: Split features into clear presenter screens and smart containers. Do not write monolithic 500-line components.
- Portability: Keep business logic inside pure TypeScript classes/services (`BooksService`, `LocationsService`, `AuthService`, etc.) so it stays easy to extend or port without rewriting UI logic.
