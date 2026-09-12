import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Module({
  controllers: [AuthController],
  providers: [
    { provide: 'JWT_SECRET', useValue: process.env.JWT_SECRET ?? 'dev-secret-change-me' },
    AuthService,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, 'JWT_SECRET'],
})
export class AuthModule {}
