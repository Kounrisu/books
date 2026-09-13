import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './update-settings.dto.js';
import type { UserSettingsRow } from './settings.types.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get(@CurrentUser() userId: string): Promise<UserSettingsRow> {
    return this.settingsService.get(userId);
  }

  @Put()
  update(
    @CurrentUser() userId: string,
    @Body() body: UpdateSettingsDto,
  ): Promise<UserSettingsRow> {
    return this.settingsService.update(userId, body);
  }
}
