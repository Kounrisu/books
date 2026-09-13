# AI Handoff Guide

This repository is designed to be shareable between different AI coding and
design assistants, including Claude Code, ChatGPT, Codex, Gemini, Cursor-style
agents, and GitHub issue/PR agents.

## Start Here

When an AI agent joins the project, read these files in order:

1. `README.md`
   - Basic project purpose and local development/deployment notes.

2. `CLAUDE.md`
   - Engineering conventions, product phase strategy, and repo-specific rules.
   - Despite the filename, this file is for all AI agents, not only Claude.

3. `PROJECT_OVERVIEW.md`
   - Concise AI-oriented orientation, current direction, stack, and start
     points.

4. `docs/product/PRODUCT_OVERVIEW.md`
   - Plain-language description of what the webapp is.

5. `docs/product/ROADMAP.md`
   - Current phase plan and progress checkboxes.

6. `docs/superpowers/specs/2026-09-13-books-library-design.md`
   - Global product spec and data-model direction.

7. `docs/product/DOCUMENTATION_ARCHITECTURE.md`
   - How docs are organized into global specs, page specs, component specs,
     assets, and implementation plans.

8. `docs/product/REFERENCE_PROJECTS.md`
   - Lessons borrowed from sibling projects such as LotoKarma, Lucky Stocks,
     and Lenormand.

9. `AI_CONVERSATION_LOG.md`
   - Shared memory of recent user instructions, AI interpretations, and
     implementation/documentation decisions.

10. Relevant page/component specs in `docs/product/pages/` and
   `docs/product/components/`.

## How To Work

- Treat `docs/product/ROADMAP.md` as the product progress tracker.
- Treat `docs/superpowers/specs/2026-09-13-books-library-design.md` as the
  global product truth.
- Treat `docs/product/pages/` as page-level truth.
- Treat `docs/product/components/` as feature/component-level truth.
- Keep implementation plans separate from product specs.
- Update docs when product decisions change.
- Update `AI_CONVERSATION_LOG.md` after meaningful product or
  implementation conversations.
- Do not silently rewrite or discard existing user work.

## Handling New User Instructions

When the user gives a new idea, requirement, correction, or feature request,
do not jump directly into implementation. First triage it against the roadmap
and documentation.

Also append a concise entry to `AI_CONVERSATION_LOG.md` when the
instruction changes product direction, roadmap priority, implementation scope,
or an important interpretation. Rephrase the user's request and explain what
you are implementing or documenting because of it.

For every new instruction, decide one of these outcomes:

1. **Implement now**
   - The request belongs to the current roadmap phase or is required to finish
     current work.
   - Update implementation and tests as needed.
   - Update `docs/product/ROADMAP.md` progress if relevant.

2. **Document for later**
   - The request is valid, but belongs to a later roadmap phase.
   - Add it to the correct global spec, page spec, component spec, or roadmap
     phase.
   - Do not implement it early unless the user explicitly changes priority.

3. **Create new documentation structure**
   - The request introduces a new page, workflow, component, data model, or
     asset category that does not fit existing docs.
   - Create the appropriate page/component/spec file.
   - Link it from `docs/product/README.md`, the relevant parent page, and the
     global spec if it affects the whole app.

4. **Ask for clarification**
   - The request is ambiguous enough that implementing or documenting it would
     likely be wrong.
   - Ask the smallest useful question, then document the decision.

5. **Reject or defer**
   - The request conflicts with established scope, security, privacy, or
     phase strategy.
   - Explain why, and if useful, document it as an explicit non-goal or future
     consideration.

## Documentation Placement Rules

Place new instructions according to their scope:

- Whole-app product behavior, data model, roles, architecture, or phase
  strategy:
  `docs/superpowers/specs/2026-09-13-books-library-design.md`

- Overall product description:
  `docs/product/PRODUCT_OVERVIEW.md`

- Phase/progress/order of work:
  `docs/product/ROADMAP.md`

- A whole screen or workflow:
  `docs/product/pages/`

- A feature inside a screen:
  `docs/product/components/`

- Visual direction, moodboards, references:
  `docs/product/assets/`

- AI collaboration or handoff rules:
  `docs/AI_HANDOFF.md`

- Cross-agent conversation memory:
  `AI_CONVERSATION_LOG.md`

- Engineering conventions for this repo:
  `CLAUDE.md`

If the right page/component file does not exist, create it and link it from the
nearest parent document.

## Recommended AI Task Prompt Shape

When creating a task for any AI agent, include:

```md
Goal:
What should be built or changed.

Context:
- Read `docs/AI_HANDOFF.md`.
- Read `AI_CONVERSATION_LOG.md`.
- Read `docs/product/ROADMAP.md`.
- Read the relevant page/component spec(s).

Scope:
What is in scope and out of scope.

Acceptance Criteria:
- Concrete checks that prove the task is done.

Verification:
- Commands/tests/builds/manual checks to run.
```

## When Using External AI Plugins Or Agents

This project may be worked on through Claude Code, Grok-enabled plugins,
Codex, ChatGPT, or similar agents. Treat all of them as capable but literal:
give them bounded scope.

Avoid vague prompts such as "carry on" unless the intended meaning is already
clear from `docs/product/ROADMAP.md` and `AI_CONVERSATION_LOG.md`. If a prompt
does say "carry on," agents should interpret it as:

- continue the current `Immediate Recommended Focus`;
- do not start a later roadmap phase unless the user explicitly names that
  phase or feature;
- do not add broad schema scaffolding for future phases just because those
  phases are documented;
- ask one concise clarification question if the next phase boundary is
  ambiguous.

When asking another AI agent to work, include the exact phase, files/specs to
read, in-scope fields/workflows, out-of-scope fields/workflows, and expected
verification commands.

## Documentation Rules For Agents

- If a change affects the whole app, update the global product spec.
- If a change affects a screen, update its page spec.
- If a change affects a feature inside a screen, update its component spec.
- If a change affects progress, update `docs/product/ROADMAP.md`.
- If a change affects visual direction, add/update assets or notes under
  `docs/product/assets/`.
- If a change creates implementation detail, use an implementation plan or
  GitHub Issue rather than bloating the product overview.

## Current Recommended Build Focus

Follow the `Immediate Recommended Focus` section in
`docs/product/ROADMAP.md`.

At the time of this handoff, Phase 1 is complete. Phase 2 has several
user-facing fields implemented and some schema-only groundwork for future
fields/phases. Future agents must not assume that "database column exists"
means "product workflow complete." Mark a roadmap item complete only when the
API, UI/workflow, states, docs, and relevant tests are complete for that item,
or when the roadmap explicitly says the item is intentionally schema/API-only.

## Git Workflow For Agents

Follow the branch strategy in `docs/product/ROADMAP.md`:

- stable release branch: `main` long term, or the current `master` branch until
  the repo is intentionally renamed;
- integration branch: `develop`;
- normal work: short-lived `feature/*` branches from `develop`;
- prototype preservation: `prototype/angular-material` plus a stable tag before
  Phase 8;
- premium UX/UI: a separate branch from `develop`, such as
  `feature/premium-ux-ui` or `design/premium-ux-ui`.

Do not treat the premium branch as the new `develop`. It is a design branch
that should merge back when the premium direction is validated.

## Before Premium UX/UI Work

Before starting the premium UX/UI redesign phase, preserve the functional
Angular Material prototype:

- run relevant tests/builds;
- commit the stable prototype;
- create a git tag such as `prototype-material-v1`;
- create or preserve a prototype branch such as `prototype/angular-material`;
- create a separate premium redesign branch from `develop`, such as
  `feature/premium-ux-ui` or `design/premium-ux-ui`;
- record the exact tag/branch names in `AI_CONVERSATION_LOG.md`.

Do not perform the premium redesign directly on the only working prototype
branch.
