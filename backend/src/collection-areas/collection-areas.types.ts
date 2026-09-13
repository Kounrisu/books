export interface CollectionAreaRow {
  id: string;
  userId: string;
  title: string;
  kind: string;
  description: string | null;
  objectives: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionAreaInput {
  title: string;
  kind: string;
  description?: string;
  objectives?: string;
  notes?: string;
  status?: string;
}

export type UpdateCollectionAreaInput = Partial<CreateCollectionAreaInput>;

export interface LinkedBookSummary {
  id: string;
  title: string;
  author: string;
  category: string | null;
  subcategory: string | null;
  coverImagePath: string | null;
  libraryStatus: string;
  readingStatus: string;
  isFavorite: boolean;
  format: string | null;
  createdAt: Date;
}

export interface CollectionAreaBookRow {
  id: string;
  userId: string;
  areaId: string;
  bookId: string;
  areaLevel: string | null;
  priority: string | null;
  relationStatus: string | null;
  notes: string | null;
  createdAt: Date;
  book: LinkedBookSummary;
}

export interface AddBookToAreaInput {
  bookId: string;
  areaLevel?: string;
  priority?: string;
  relationStatus?: string;
  notes?: string;
}
