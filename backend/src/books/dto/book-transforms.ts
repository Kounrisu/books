// Shared class-transformer helpers for the books DTOs. The book form is
// submitted as multipart/form-data, so every field arrives as a string (or
// is absent); these mirror the coercions `parseBookForm` used to do by hand.

export function toOptionalNumber({ value }: { value: unknown }): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
}

export function toOptionalBoolean({ value }: { value: unknown }): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true';
}

export function toOptionalDate({ value }: { value: unknown }): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return new Date(value as string);
}

export function toTagList({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0);
  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
