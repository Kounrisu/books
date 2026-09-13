# Collection Areas Page

## Purpose

Give the user a focused workspace for a genre, media type, subject, or learning
project, such as romance, western, polar/crime, manga, bande dessinee,
magazine, real/physical books, programming, language learning, design, finance,
or another topic.

The page should gather the relevant books, show which ones are owned or still
needed, organize them by media type, level, and priority, and provide space for
notes, ideas, objectives when relevant, and current progress/context.

## Current State

There is no dedicated collection-area workspace yet. The closest concepts are
`category`, `mediaType`, and `savedList`, but those are only labels and do not
support area notes, objectives, owned/missing splits, or area-specific ranking.

## Wanted State

The app should support collection areas with:

- Area title/name.
- Area kind: genre, media type, subject, learning project, research project, or
  custom.
- Description.
- Optional objectives/goals.
- Notes and ideas.
- Status: planned, active, paused, completed, reference.
- Related books already owned.
- Related books not owned but wanted/needed.
- Media type: real book, ebook, audiobook, manga, bande dessinee, magazine,
  etc.
- Book level when relevant: beginner, intermediate, advanced, reference,
  unknown.
- Book priority/usefulness for this specific area.
- Area-specific note explaining why a book matters.

The same book can appear in multiple collection areas with different levels,
priorities, and notes.

## Child Component Specs

- `../components/areas/area-overview.md`
- `../components/areas/area-book-list.md`
- `../components/areas/area-notes-objectives.md`
- `../components/shared/loading-empty-error-states.md`

## User Actions

- Create a collection area.
- Open a collection area.
- Write objectives, notes, ideas, and current context.
- Add owned books to the project.
- Add wanted/not-owned books to the project.
- Choose media type/category where relevant.
- Set book level: beginner, intermediate, advanced, reference, unknown.
- Set priority/usefulness.
- Mark project status as planned, active, paused, or completed.

## Data Shown

- Area title/subject.
- Area kind.
- Area objectives when relevant.
- Area notes and ideas.
- Area status.
- Related owned books.
- Related wanted/needed books.
- Per-book media type, level, priority, ownership status, reading status, and
  location if owned.

## States

- No collection areas yet.
- Loading area.
- Empty area with no books.
- Save error.
- Notes/objectives saving.

## UX Notes

This area can be a focused genre/media shelf or a study dashboard. Phase 1 can
stay Material-based and practical. Phase 2 can make it more inspiring, with
progress, grouped reading paths, and richer visual hierarchy.
