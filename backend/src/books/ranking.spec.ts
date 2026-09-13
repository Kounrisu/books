import { describe, it, expect } from 'vitest';
import { computeRankings } from './ranking.js';

describe('computeRankings', () => {
  it('ranks books within their category and overall, descending by myNote', () => {
    const books = [
      { id: 'a', category: 'Sci-Fi', myNote: 9 },
      { id: 'b', category: 'Sci-Fi', myNote: 7 },
      { id: 'c', category: 'Essay', myNote: 8 },
    ];

    const rankings = computeRankings(books);

    expect(rankings.get('a')).toEqual({
      categoryRank: 1,
      categoryTotal: 2,
      overallRank: 1,
      overallTotal: 3,
    });
    expect(rankings.get('b')).toEqual({
      categoryRank: 2,
      categoryTotal: 2,
      overallRank: 3,
      overallTotal: 3,
    });
    expect(rankings.get('c')).toEqual({
      categoryRank: 1,
      categoryTotal: 1,
      overallRank: 2,
      overallTotal: 3,
    });
  });

  it('excludes books with no myNote from ranking entirely', () => {
    const books = [
      { id: 'a', category: 'Sci-Fi', myNote: 9 },
      { id: 'b', category: 'Sci-Fi', myNote: null },
    ];

    const rankings = computeRankings(books);

    expect(rankings.has('a')).toBe(true);
    expect(rankings.has('b')).toBe(false);
  });

  it('groups books with no category together under the same "no category" bucket', () => {
    const books = [
      { id: 'a', category: null, myNote: 5 },
      { id: 'b', category: null, myNote: 8 },
    ];

    const rankings = computeRankings(books);

    expect(rankings.get('b')).toEqual({
      categoryRank: 1,
      categoryTotal: 2,
      overallRank: 1,
      overallTotal: 2,
    });
    expect(rankings.get('a')).toEqual({
      categoryRank: 2,
      categoryTotal: 2,
      overallRank: 2,
      overallTotal: 2,
    });
  });
});
