import { LibraryStatus, MetadataStatus, OwnershipFormat, PhysicalStatus, ReadingStatus } from './books.service';

export const OWNERSHIP_FORMAT_OPTIONS: { value: OwnershipFormat; label: string }[] = [
  { value: 'physical', label: 'Physical' },
  { value: 'ebook', label: 'Ebook' },
  { value: 'both', label: 'Physical + ebook' },
  { value: 'none', label: 'Not owned' },
];

export const PHYSICAL_STATUS_OPTIONS: { value: PhysicalStatus; label: string }[] = [
  { value: 'in_collection', label: 'In collection' },
  { value: 'unknown_location', label: 'Unknown location' },
  { value: 'lost', label: 'Lost' },
  { value: 'lent_out', label: 'Lent out' },
];

export const LIBRARY_STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'want_to_read', label: 'Want to read' },
  { value: 'want_to_buy', label: 'Want to buy' },
  { value: 'borrowed', label: 'Borrowed' },
];

// Labels follow the Goodreads/StoryGraph "shelf" vocabulary readers already
// know (Want to Read / Currently Reading / Read / Did Not Finish), except
// "unread" is labeled "To read" rather than "Want to read" — that phrase is
// reserved for `LibraryStatus.want_to_read` below, which is a different
// concept (you don't have a copy yet vs. you have one and haven't started).
export const READING_STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: 'unread', label: 'To read' },
  { value: 'reading', label: 'Currently reading' },
  { value: 'read', label: 'Read' },
  { value: 'abandoned', label: 'Did not finish' },
  { value: 'reference_only', label: 'Reference only' },
];

export const METADATA_STATUS_OPTIONS: { value: MetadataStatus; label: string }[] = [
  { value: 'complete', label: 'Complete' },
  { value: 'needs_metadata', label: 'Needs metadata' },
  { value: 'needs_review', label: 'Needs review' },
];

// Distinct from `ownershipFormat` (which describes how you own the book —
// physical/ebook/both/none): this describes the physical/media format of
// the copy itself.
export const BOOK_FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'paperback', label: 'Paperback' },
  { value: 'mass_market_paperback', label: 'Mass market paperback' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'ebook', label: 'Ebook' },
  { value: 'other', label: 'Other' },
];

function labelFor<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function ownershipFormatLabel(value: string): string {
  return labelFor(OWNERSHIP_FORMAT_OPTIONS, value as OwnershipFormat);
}

export function physicalStatusLabel(value: string): string {
  return labelFor(PHYSICAL_STATUS_OPTIONS, value as PhysicalStatus);
}

export function libraryStatusLabel(value: string): string {
  return labelFor(LIBRARY_STATUS_OPTIONS, value as LibraryStatus);
}

export function readingStatusLabel(value: string): string {
  return labelFor(READING_STATUS_OPTIONS, value as ReadingStatus);
}

export function metadataStatusLabel(value: string): string {
  return labelFor(METADATA_STATUS_OPTIONS, value as MetadataStatus);
}

export function bookFormatLabel(value: string | null): string {
  if (!value) return '';
  return BOOK_FORMAT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
