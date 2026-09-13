# Books Webapp Product Overview

## What It Is

Books is a private, self-hosted personal library manager for cataloging,
organizing, and understanding a large book collection.

The app is designed for someone who owns many books across different physical
places, may also own ebooks, and wants a searchable database that answers:

- What books do I own?
- Where is each physical book?
- Which books are missing, lost, borrowed, unread, wanted, or important?
- Which books do I want to read, buy, or use for a project?
- Which books belong to a genre, media type, subject, or learning area?
- What notes, reviews, ratings, and metadata do I have for each book?

## Core Idea

The app is not just a reading tracker. It is a personal knowledge and inventory
system for books.

It combines:

- a book catalog;
- physical location tracking;
- personal reviews and notes;
- wishlist and reading-intention tracking;
- borrowing history;
- reading, acquisition, rental, and lending timeline history;
- collection areas for genres, media types, subjects, or learning projects;
- import/export workflows so AI tools can enrich missing metadata.

## Main Workflows

The user can add books manually, upload one or many cover photos, create
placeholder records, and complete missing metadata later.

The user can organize books by:

- location, such as Home, Garage, Second home, shelf, room, or box;
- ownership state, such as physical, ebook, both, wishlist, or not owned;
- physical state, such as in collection, unknown location, lost, or lent out;
- reading state, such as unread, reading, read, abandoned, or reference only;
- access history, such as bought, gifted, inherited, borrowed from a public
  library, borrowed from a company library, rented, returned, or lent out;
- collection areas, such as romance, western, polar/crime, manga, bande
  dessinee, magazine, programming, or language learning.

## Product Phase

Phase 1 is a functional prototype built with Angular Material and a real
backend. The priority is complete workflows, reliable data, import/export,
search/filter/sort, and clear states.

Phase 2 is a premium UX/UI redesign with stronger visual identity, richer
presentation, animation, and a more beautiful browsing experience.

The project deliberately separates **what the app needs to contain and do**
from **how the app should deliver that content**. Phase 1 focuses on the
content model, workflows, data quality, and operational reliability. Phase 2
focuses on experience design: layout, storytelling, visual hierarchy, brand,
motion, mobile capture, and the feeling of browsing a serious personal
library. The second part is as important as the first, but it should be based
on a proven product instead of guessing too early.

## Technical Shape

The app uses:

- Angular frontend;
- Angular Material/CDK components;
- NestJS backend;
- Prisma;
- PostgreSQL;
- local uploaded image storage through Docker volumes;
- Docker Compose for local and production deployment.

The app is multi-user capable. Each user's library remains private. Admin roles
can later manage users without turning the product into a shared public library.

## Long-Term Vision

The long-term goal is a private book database that can grow with the user's
collection and learning life.

It should become a place to manage owned books, wanted books, project books,
learning paths, notes, favorites, missing books, borrowed books, and enriched
metadata, while keeping the user's data exportable and under their control.
