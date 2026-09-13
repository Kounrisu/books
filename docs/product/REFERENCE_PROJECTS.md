# Reference Projects

These sibling projects are useful references for how Books should evolve as a
product and as an AI-assisted codebase.

## Projects Reviewed

### LotoKarma

Path: `C:\dev\dev-projects\06-lotokarma`

What is useful for Books:

- Strong `CLAUDE.md` design guardrails with concrete tokens, component rules,
  and banned patterns.
- Root `PROJECT_OVERVIEW.md` that helps a new AI session understand the app
  quickly.
- Public `docs/` plus local `docs_sensitive/` convention for screenshots,
  heavy references, private deployment notes, and moodboard material.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` pattern for
  separating product/design intent from execution plans.
- Worktree usage under `.claude/worktrees/` for isolated AI implementation
  work.

Books takeaway:

- Keep the phase/product guidance in `CLAUDE.md` concrete.
- When Phase 8 begins, write similarly strict design guardrails so the premium
  style does not drift screen by screen.
- Use `docs_sensitive/` later for private/heavy moodboard material if those
  references should not be committed.

### Lucky Stocks / Stock Tracker

Path: `C:\dev\dev-projects\03-stock-events\stock-tracker`

What is useful for Books:

- Rich `docs/ARCHITECTURE.md` describing stack, structure, routes, services,
  auth, deployment, testing, quality, and reuse.
- `.ai/` folder with reusable AI context concepts: `CONTEXT.md`,
  `CONVENTIONS.md`, `CURRENT_TASK.md`, `DECISIONS.md`, `PROGRESS.md`,
  `SESSION_LOG.md`, prompts, patterns, and pitfalls.
- Strong import/export behavior, which is especially relevant to Books'
  future AI metadata enrichment loop.
- Vitest, Playwright e2e tests, formatting, Sonar, CI, Docker, proxy, and
  deployment scripts.
- Admin/demo concepts that may inform Books' future admin and demo flows.

Books takeaway:

- Books already has `AI_CONVERSATION_LOG.md` and `docs/AI_HANDOFF.md`; if the
  project grows, consider adding a lightweight `.ai/` folder with decisions,
  current task, progress, reusable prompts, patterns, and pitfalls.
- Add an architecture document before the backend/frontend/data model becomes
  harder to summarize.
- Treat import/export as a first-class product workflow, not a hidden utility.
- Add e2e tests once the core workflows stabilize.

### Lenormand

Path: `C:\dev\dev-projects\09-lenormand`

What is useful for Books:

- Extremely clear product boundary in `CLAUDE.md`: what the app is, what it is
  not, and what should not be added.
- Strong atmosphere and visual identity rules, including copy tone, assets,
  colors, typography, and interaction behavior.
- Root `PROJECT_OVERVIEW.md` with timeline, improvement roadmap, and token /
  process-efficiency lessons.
- PWA/mobile-first thinking and careful viewport-fit notes.
- Local asset-heavy experience where visuals are part of the product, not
  decoration.

Books takeaway:

- Phase 2 should get a similarly specific visual identity document before
  redesign work starts.
- Books should eventually define copy tone, asset rules, cover/photo treatment,
  motion rules, and mobile capture behavior as product rules.
- Add screenshots and visual references intentionally, with clear public vs.
  private/heavy asset handling.

## Cross-Project Lessons For Books

- Add a root `PROJECT_OVERVIEW.md` so AI agents have a fast entry point.
- Keep `CLAUDE.md` focused on strong behavioral and design boundaries.
- Keep product specs separate from implementation plans.
- Keep a shared conversation/session memory updated after meaningful user
  decisions.
- Preserve stable branches/checkpoints before large visual transformations.
- Create strict design rules only after the functional content model is proven.
- Add architecture and decision docs before the system becomes difficult to
  explain.
- Import/export deserves tests and explicit data contracts because users may
  rely on it for AI-assisted enrichment.

## Books As A Future Template For Other Projects

Books should also become a reference project for LotoKarma, Lucky Stocks, and
Lenormand. The goal is not to copy Books' library features into those apps.
The goal is to reuse the operating model:

- root `PROJECT_OVERVIEW.md`;
- root `AI_CONVERSATION_LOG.md`;
- AI handoff guide;
- roadmap by phase;
- product overview;
- global product spec;
- page specs;
- component specs;
- clear placement rules for new user instructions;
- branch/checkpoint rules before large redesigns;
- separation between content/workflow phases and premium delivery phases.

When applying the Books model to sibling projects, preserve each product's own
identity:

- LotoKarma should keep its playful lottery identity and strict game-specific
  visual rules.
- Lucky Stocks should keep its finance seriousness, import/export rigor, and
  testing/CI maturity.
- Lenormand should keep its light yes/no game boundary, atmosphere, assets, and
  mobile-first feel.

Use `C:\dev\dev-projects\AI_template_suggestions\docs\product\CROSS_PROJECT_ADOPTION.md`
as the neutral migration guide when retrofitting this structure elsewhere.

Important: the sibling projects already have valuable `PROJECT_OVERVIEW.md`
files. When applying the Books operating model to them, start from those
overviews and preserve their existing timeline, roadmap, lessons, and product
identity. The Books template should organize and extend that context, not
replace it.
