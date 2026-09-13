import type { RankInfo } from './ranking.js';

export interface BookRow {
  id: string;
  userId: string;
  title: string;
  author: string;
  category: string | null;
  language: string | null;
  description: string | null;
  myReview: string | null;
  myNote: number | null;
  recommend: boolean | null;
  coverImagePath: string | null;
  locationId: string | null;
  purchaseDate: Date | null;
  purchasePrice: unknown;
  source: string;
  createdAt: Date;
}

export type BookWithRanking = BookRow & { ranking: RankInfo | null };

export interface CreateBookInput {
  title: string;
  author: string;
  category?: string;
  language?: string;
  description?: string;
  myReview?: string;
  myNote?: number;
  recommend?: boolean;
  coverImagePath?: string;
  locationId?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
}

export type UpdateBookInput = Partial<CreateBookInput>;
