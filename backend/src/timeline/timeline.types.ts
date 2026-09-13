export type TimelineEventType =
  | 'read_started'
  | 'read_finished'
  | 'acquired'
  | 'lent_out'
  | 'returned'
  | 'lost'
  | 'found'
  | 'external_borrowed'
  | 'external_returned';

export interface TimelineEventRow {
  id: string;
  userId: string;
  bookId: string | null;
  eventType: string;
  occurredAt: Date;
  title: string;
  notes: string | null;
  createdAt: Date;
}

export interface CreateTimelineEventInput {
  bookId?: string;
  eventType: TimelineEventType;
  occurredAt: Date;
  title: string;
  notes?: string;
}

export interface LoanRow {
  id: string;
  userId: string;
  bookId: string;
  borrowerName: string;
  borrowedAt: Date;
  returnedAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreateLoanInput {
  bookId: string;
  borrowerName: string;
  borrowedAt: Date;
  notes?: string;
}
