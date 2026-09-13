# Project Context: Fast Functional Prototyping

## Goal
Build a rapid, functional mock-up/prototype to validate user flows, core data interactions, and screen layouts. The core logic will later migrate to another architecture/design system, so keep components decoupled, modular, and cleanly separated between logic and presentation.

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
- Mock Data: Keep mock datasets in dedicated `*.mock.ts` or light mock services returning Signals / observables so the UI is immediately interactive without a real backend.
- Thin Components: Split features into clear presenter screens and smart containers. Do not write monolithic 500-line components.
- Portability: Keep business logic inside pure TypeScript classes/services so it can be ported to another framework or library later without rewriting UI logic.
