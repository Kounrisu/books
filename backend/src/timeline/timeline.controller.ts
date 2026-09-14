import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TimelineService } from './timeline.service.js';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto.js';
import { CreateLoanDto } from './dto/create-loan.dto.js';
import type { CreateLoanInput, CreateTimelineEventInput, LoanRow, TimelineEventRow } from './timeline.types.js';

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
    @Body() body: CreateTimelineEventDto,
  ): Promise<TimelineEventRow> {
    const input: CreateTimelineEventInput = {
      bookId: body.bookId,
      eventType: body.eventType,
      occurredAt: body.occurredAt,
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
  createLoan(@CurrentUser() userId: string, @Body() body: CreateLoanDto): Promise<LoanRow> {
    const input: CreateLoanInput = {
      bookId: body.bookId,
      borrowerName: body.borrowerName,
      borrowedAt: body.borrowedAt,
      notes: body.notes,
    };
    return this.timelineService.createLoan(userId, input);
  }

  @Patch('loans/:id/return')
  returnLoan(@CurrentUser() userId: string, @Param('id') id: string): Promise<LoanRow> {
    return this.timelineService.returnLoan(userId, id);
  }
}
