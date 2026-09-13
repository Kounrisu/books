// Shared column/filter configuration for the books page and its per-user
// settings page. Title, author, and the actions column are always shown —
// they're needed to identify and act on a row — everything else here is
// user-toggleable. `filterKey`, when set, ties a column to the filter that
// only makes sense while that column is visible (per the user's rule: hide
// the column, its filter disappears too).

export interface BookColumnConfig {
  key: string;
  label: string;
  filterKey?: string;
}

export const CONFIGURABLE_COLUMNS: BookColumnConfig[] = [
  { key: 'cover', label: 'Cover' },
  { key: 'itemType', label: 'Type', filterKey: 'itemType' },
  { key: 'category', label: 'Category', filterKey: 'category' },
  { key: 'subcategory', label: 'Subgenre', filterKey: 'subcategory' },
  // Only meaningful for magazine/manga/bd/manhwa rows, where `title` alone
  // doesn't identify the item the way it does for a book — see itemType's
  // schema comment for why these reuse seriesName/seriesNumber rather than
  // adding dedicated fields.
  { key: 'seriesName', label: 'Series' },
  { key: 'seriesNumber', label: 'Issue / volume' },
  { key: 'format', label: 'Format' },
  { key: 'location', label: 'Location', filterKey: 'location' },
  { key: 'status', label: 'Collection status', filterKey: 'libraryStatus' },
  { key: 'reading', label: 'Reading status', filterKey: 'readingStatus' },
  { key: 'favorite', label: 'Favorite' },
  { key: 'createdAt', label: 'Date added' },
];

export const ALWAYS_VISIBLE_COLUMNS = ['title', 'author', 'actions'];

export const BOOK_COLUMN_ORDER = [
  'cover',
  'title',
  'author',
  'itemType',
  'seriesName',
  'seriesNumber',
  'category',
  'subcategory',
  'format',
  'location',
  'status',
  'reading',
  'favorite',
  'createdAt',
  'actions',
];

export interface BookFilterConfig {
  key: string;
  label: string;
}

export const CONFIGURABLE_FILTERS: BookFilterConfig[] = [
  { key: 'itemType', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subgenre' },
  { key: 'location', label: 'Location' },
  { key: 'libraryStatus', label: 'Collection status' },
  { key: 'readingStatus', label: 'Reading status' },
];

export const ALWAYS_VISIBLE_FILTERS = ['search'];
