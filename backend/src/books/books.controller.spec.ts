import { describe, it, expect } from 'vitest';
import { toOptionalDate, toOptionalNumber } from './dto/book-transforms.js';

describe('toOptionalNumber', () => {
  it('preserves a purchasePrice of 0 (a free/gifted book) instead of dropping it', () => {
    expect(toOptionalNumber({ value: '0' })).toBe(0);
  });

  it('leaves the value unset when not provided', () => {
    expect(toOptionalNumber({ value: undefined })).toBeUndefined();
  });

  it('leaves the value unset when given an empty string', () => {
    expect(toOptionalNumber({ value: '' })).toBeUndefined();
  });

  it('parses a non-zero numeric string', () => {
    expect(toOptionalNumber({ value: '19.99' })).toBe(19.99);
  });
});

describe('toOptionalDate', () => {
  it('leaves the value unset when given an empty string', () => {
    expect(toOptionalDate({ value: '' })).toBeUndefined();
  });

  it('parses a provided date string', () => {
    expect(toOptionalDate({ value: '2026-01-01' })).toEqual(new Date('2026-01-01'));
  });
});
