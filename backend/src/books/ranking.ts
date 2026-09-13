export interface RankableBook {
  id: string;
  category: string | null;
  myNote: number | null;
}

export interface RankInfo {
  categoryRank: number;
  categoryTotal: number;
  overallRank: number;
  overallTotal: number;
}

export function computeRankings(books: RankableBook[]): Map<string, RankInfo> {
  const ranked = books.filter(
    (b): b is RankableBook & { myNote: number } => b.myNote != null,
  );

  const overallSorted = [...ranked].sort((a, b) => b.myNote - a.myNote);
  const overallTotal = overallSorted.length;
  const overallRankById = new Map(overallSorted.map((b, i) => [b.id, i + 1]));

  const byCategory = new Map<string, typeof ranked>();
  for (const book of ranked) {
    const key = book.category ?? '';
    const group = byCategory.get(key) ?? [];
    group.push(book);
    byCategory.set(key, group);
  }

  const result = new Map<string, RankInfo>();
  for (const group of byCategory.values()) {
    const sorted = [...group].sort((a, b) => b.myNote - a.myNote);
    sorted.forEach((book, index) => {
      result.set(book.id, {
        categoryRank: index + 1,
        categoryTotal: sorted.length,
        overallRank: overallRankById.get(book.id)!,
        overallTotal,
      });
    });
  }
  return result;
}
