import { describe, it, expect } from 'vitest';
import { parseBookForm } from './books.controller.js';

describe('parseBookForm', () => {
  it('preserves a purchasePrice of 0 (a free/gifted book) instead of dropping it', () => {
    const result = parseBookForm({
      title: 'Free Book',
      author: 'Someone',
      purchasePrice: '0',
    });

    expect(result.purchasePrice).toBe(0);
  });

  it('leaves purchasePrice unset when not provided', () => {
    const result = parseBookForm({ title: 'Book', author: 'Author' });

    expect(result.purchasePrice).toBeUndefined();
  });

  it('leaves purchasePrice unset when given an empty string', () => {
    const result = parseBookForm({
      title: 'Book',
      author: 'Author',
      purchasePrice: '',
    });

    expect(result.purchasePrice).toBeUndefined();
  });

  it('parses a non-zero purchasePrice', () => {
    const result = parseBookForm({
      title: 'Book',
      author: 'Author',
      purchasePrice: '19.99',
    });

    expect(result.purchasePrice).toBe(19.99);
  });

  it('leaves purchaseDate unset when given an empty string', () => {
    const result = parseBookForm({
      title: 'Book',
      author: 'Author',
      purchaseDate: '',
    });

    expect(result.purchaseDate).toBeUndefined();
  });

  it('parses a provided purchaseDate', () => {
    const result = parseBookForm({
      title: 'Book',
      author: 'Author',
      purchaseDate: '2026-01-01',
    });

    expect(result.purchaseDate).toEqual(new Date('2026-01-01'));
  });
});
