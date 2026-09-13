import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminService } from './admin.service.js';
import type { AdminUserRow } from './admin.types.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  listUsers(): Promise<AdminUserRow[]> {
    return this.adminService.listUsers();
  }

  @Patch(':id/role')
  setRole(
    @CurrentUser() actingUserId: string,
    @Param('id') id: string,
    @Body('role') role: string,
  ): Promise<AdminUserRow> {
    return this.adminService.setRole(actingUserId, id, role);
  }

  @Patch(':id/active')
  setActive(
    @CurrentUser() actingUserId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<AdminUserRow> {
    return this.adminService.setActive(actingUserId, id, isActive);
  }

  @Delete(':id')
  deleteUser(
    @CurrentUser() actingUserId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.adminService.deleteUser(actingUserId, id);
  }
}
