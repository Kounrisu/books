# Documentation Architecture

The product documentation is intentionally componentized.

## Layers

1. `docs/superpowers/specs/2026-09-13-books-library-design.md`
   - Global product truth.
   - App goals, data model, architecture, and cross-page product decisions.

2. `docs/product/pages/`
   - One file per page or major workflow.
   - Describes the page purpose, current state, wanted state, composition, and
     page-level UX.
   - Links to child component specs.

3. `docs/product/components/`
   - One file per feature/component inside a page.
   - Describes inputs, user actions, outputs, states, acceptance criteria, and
     open questions.
   - Used to create implementation-ready GitHub Issues or agent tasks.

4. `docs/product/assets/`
   - Moodboards, visual references, UX references, screenshots, diagrams, and
     annotated examples.

5. `docs/superpowers/plans/`
   - Engineering execution plans.
   - These are task-by-task implementation documents, not the main place for
     product/design decisions.

6. `PROJECT_OVERVIEW.md`
   - Root-level AI/project orientation.
   - Mirrors the convention used by sibling projects so a new AI session can
     understand the project before diving into detailed specs.

7. `docs/product/REFERENCE_PROJECTS.md`
   - Notes from sibling projects that should influence Books' process,
     documentation, testing, design, or AI workflow.

## Rule Of Thumb

- If it affects the whole app, put it in the global spec.
- If it describes a screen, put it in a page spec.
- If it describes a feature inside a screen, put it in a component spec.
- If it is visual inspiration, put it in assets.
- If it is a task someone should execute, turn it into a GitHub Issue or an
  implementation plan.
- If it is a lesson borrowed from another project, put it in
  `docs/product/REFERENCE_PROJECTS.md` unless it has already become an actual
  Books rule.
- If it changes access control, roles, or user/account behavior, update both
  the global spec and the relevant admin/component specs.
- If it creates many records at once or depends on an external enrichment loop,
  document the capture workflow and the import/export mapping together.
- If it creates a focused workspace around a subject or goal, document both
  the workspace page and the relationship component linking books to it.
- If it represents something that happens over time, document the event model
  and how it appears in the Timeline page.

## AI Agent Workflow

When asking an AI agent to implement a feature, provide:

- the global spec;
- the relevant page spec;
- the relevant component spec;
- any linked assets/references;
- explicit acceptance criteria.

This keeps agents from guessing and keeps design intent close to implementation.
