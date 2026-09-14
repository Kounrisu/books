// Shared class-transformer helpers for the books DTOs. The book form is
// submitted as multipart/form-data, so every field arrives as a string (or
// is absent); these mirror the coercions `parseBookForm` used to do by hand.
//
// Three distinct states matter here: the key is absent from the request
// (leave the stored value alone — stays `undefined` so it's never spread
// into the Prisma `data` object), the key is present but blank (explicit
// clear — becomes `null`, which Prisma writes as SQL NULL), or the key
// carries a real value (replace). `@IsOptional()` treats both `undefined`
// and `null` as "skip further validators," so these transforms are safe to
// pair with `@IsString()`/`@IsNumber()`/etc.

export function toOptionalNumber({ value }: { value: unknown }): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return Number(value);
}

export function toOptionalBoolean({ value }: { value: unknown }): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true';
}

export function toOptionalDate({ value }: { value: unknown }): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return new Date(value as string);
}

export function toOptionalString({ value }: { value: unknown }): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return String(value);
}

export function toTagList({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0);
  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
