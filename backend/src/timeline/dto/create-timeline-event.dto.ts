import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { TimelineEventType } from '../timeline.types.js';

export const TIMELINE_EVENT_TYPES: TimelineEventType[] = [
  'read_started',
  'read_finished',
  'acquired',
  'lent_out',
  'returned',
  'lost',
  'found',
  'external_borrowed',
  'external_returned',
];

export class CreateTimelineEventDto {
  @IsOptional() @IsString() bookId?: string;

  @IsIn(TIMELINE_EVENT_TYPES)
  eventType!: TimelineEventType;

  @Type(() => Date)
  @IsDate()
  occurredAt!: Date;

  @IsString()
  @MaxLength(300)
  title!: string;

  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
