# Project Context: Books Management Webapp

## Goal
A real, working personal book library manager — not a throwaway mock-up. The backend (NestJS + Prisma + Postgres) and frontend (Angular + Material) are both real and already verified end-to-end (auth, multi-tenant scoping, photo uploads, computed rankings). Keep components decoupled, modular, and cleanly separated between logic and presentation so the app stays easy to extend (v2: AI-assisted cover recognition, book-API enrichment — see the design spec).

## Tech Stack & Conventions
- Angular (Modern standalone components, Signals for state, inject(), modern control flow @if / @for)
- Angular Material + Angular CDK for fast accessible primitives
- Tailwind CSS or simple flex/grid utility layout (no inline CSS spaghetti)

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

## Code & Architecture Strategy
- Demo/Seed Data: Lives in the real Postgres database, added through the real API (register a user, then `POST /locations` and `POST /books`) — never faked in `*.mock.ts` files or in-memory services. If you need a quick batch of demo rows, script it against the running API (see how the current demo books/locations were seeded), not by hardcoding fixtures in the frontend.
- Thin Components: Split features into clear presenter screens and smart containers. Do not write monolithic 500-line components.
- Portability: Keep business logic inside pure TypeScript classes/services (`BooksService`, `LocationsService`, `AuthService`, etc.) so it stays easy to extend or port without rewriting UI logic.
