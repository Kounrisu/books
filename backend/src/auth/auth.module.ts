import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AdminGuard } from './admin.guard.js';
import { DemoModule } from '../demo/demo.module.js';

@Module({
  imports: [DemoModule],
  controllers: [AuthController],
  providers: [
    { provide: 'JWT_SECRET', useValue: process.env.JWT_SECRET ?? 'dev-secret-change-me' },
    AuthService,
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [JwtAuthGuard, AdminGuard, 'JWT_SECRET'],
})
export class AuthModule {}
