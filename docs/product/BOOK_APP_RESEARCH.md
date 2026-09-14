# Book catalog research and adopted ideas

Reviewed 2026-09-14 through public product pages and official documentation.
This is a targeted workflow comparison, not a hands-on review of paid accounts.

## Sources and lessons

| Product | Observed pattern | Application to Books |
| --- | --- | --- |
| [CLZ Books Web: multiple folder levels](https://clz.com/books/web/whatsnew/2019/11/25/create-your-own-multi-level-folder-favorites-2) | Browsing can use multiple folder levels and saved grouping combinations. This source documents a feature introduced in 2019. | Adopt progressive navigation for physical places: Home → Bookshelf → Shelf. CLZ groups catalog fields; our physical containment is an adaptation, not a claim that its data model is identical. |
| [Libib: Library](https://support.libib.com/libib/website/library.html) | Collection-scoped search, visible counts, cover/list/summary views, sorting and filters keep a catalog navigable. | Apply scoped search and visible book totals to a location. Offer direct versus nested contents and clear paths to each book's shelf. |
| [LibraryThing: overview](https://www.librarything.com/quickstart.php) | Collections organize catalogs; quick edits support tags, ratings, and reviews after adding books. | Keep the existing quick edits and collection areas. Make future bulk intake lead into an efficient metadata review queue. |
| [TinyCat: product overview](https://www.librarycat.org/about/) | A focused small-library catalog combines mobile access, faceted search, and circulation. | Expand useful filters and loan workflows in measured steps instead of adding a public social network. |

## Implemented now

The user's explicit example was opening Home and seeing several bookshelves.
The application already stored parent relationships, so the change completes
the browsing workflow without a schema migration:

- `/locations` shows top-level places.
- `/locations/:id` shows immediate child locations, preserving arbitrary depth.
- Breadcrumbs provide an ordinary link to each ancestor and mark the current place.
- Cards show immediate child count and recursive book count.
- Each location shows its books, including descendants by default; a checkbox switches to direct assignments only.
- Search stays inside that scope and matches title, author, ISBN, series, or tags.
- Book results link to their details and display a linked full location path.
- Add location inside preselects the parent and returns there after saving.
- Add book here preselects the location in the existing book form.
- Empty, loading, missing-location, request-error, and delete-error states are explicit.
- Existing private-image handling, parent-cycle prevention, edit/delete actions, and Material styling are reused.

Counts represent assigned book records, including lent/lost records if still
assigned there. They are not a physical stocktake or a count of currently
present copies. No sample Home or Bookshelf records are inserted into the
user's library; existing data is used.

## Good follow-up ideas

These remain proposals; they were not bundled into this implementation.

1. **Saved catalog views and tag filters.** Offer named shortcuts such as
   Needs metadata, Currently reading, and Lent out; keep active filters in the
   URL. Adapt LibraryThing/TinyCat filtering to existing fields.
2. **Cover/list view choice.** Let users select browsing or inventory density,
   following Libib's view controls. Keep this in the dedicated experience phase.
3. **ISBN-assisted capture.** Look up a scanned/typed ISBN, show the proposed
   edition, then let the user confirm. Libib documents ISBN lookup in its
   [website quickstart](https://support.libib.com/getting-started/quickstart-website.html).
   Provider selection, privacy, and API integration still need implementation.
4. **Bulk move to shelf.** Select books, choose a destination with its full
   path, and apply it with a clear result. This is our own extension of the
   user's storage workflow, rather than a verified feature of the sources.
5. **Metadata review queue.** Show a cover next to editable metadata and advance
   to the next incomplete book. This builds on existing photo intake and the
   quick-edit pattern; it does not require automatic AI recognition.

## Validation and limits

Frontend production build and 21 ChromeHeadless tests passed, including 10
new checks for hierarchy, navigation, search scope, creation defaults,
return-to-parent behavior, failures, and cycle-safe traversal.

The existing initial-bundle warning remains (about 518 kB against 500 kB).
No backend endpoint or database schema changed. The full application was not
tested against PostgreSQL: no local API/database was listening, and the Docker
daemon was unavailable in this session. Component tests use explicit test
fixtures; production screens use the real services, not mock data.

The 21st UI build skill was read; its CLI and design-context files were not
installed, so its automated search/review was unavailable. The implementation
uses the project's existing Angular Material components and theme tokens.
