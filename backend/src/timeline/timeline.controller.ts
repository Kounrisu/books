import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TimelineService } from './timeline.service.js';
import type {
  CreateLoanInput,
  CreateTimelineEventInput,
  LoanRow,
  TimelineEventRow,
} from './timeline.types.js';

interface TimelineEventBody {
  bookId?: string;
  eventType: string;
  occurredAt: string;
  title: string;
  notes?: string;
}

interface LoanBody {
  bookId: string;
  borrowerName: string;
  borrowedAt: string;
  notes?: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('timeline')
  findAllEvents(@CurrentUser() userId: string): Promise<TimelineEventRow[]> {
    return this.timelineService.findAllEvents(userId);
  }

  @Post('timeline')
  createEvent(
    @CurrentUser() userId: string,
    @Body() body: TimelineEventBody,
  ): Promise<TimelineEventRow> {
    const input: CreateTimelineEventInput = {
      bookId: body.bookId,
      eventType: body.eventType as CreateTimelineEventInput['eventType'],
      occurredAt: new Date(body.occurredAt),
      title: body.title,
      notes: body.notes,
    };
    return this.timelineService.createEvent(userId, input);
  }

  @Get('loans')
  findAllLoans(@CurrentUser() userId: string): Promise<LoanRow[]> {
    return this.timelineService.findAllLoans(userId);
  }

  @Post('loans')
  createLoan(@CurrentUser() userId: string, @Body() body: LoanBody): Promise<LoanRow> {
    const input: CreateLoanInput = {
      bookId: body.bookId,
      borrowerName: body.borrowerName,
      borrowedAt: new Date(body.borrowedAt),
      notes: body.notes,
    };
    return this.timelineService.createLoan(userId, input);
  }

  @Patch('loans/:id/return')
  returnLoan(@CurrentUser() userId: string, @Param('id') id: string): Promise<LoanRow> {
    return this.timelineService.returnLoan(userId, id);
  }
}
