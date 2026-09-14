import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AdminGuard } from './admin.guard.js';
import { DemoModule } from '../demo/demo.module.js';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'dev-secret-change-me';
}

@Module({
  imports: [DemoModule],
  controllers: [AuthController],
  providers: [
    { provide: 'JWT_SECRET', useValue: resolveJwtSecret() },
    AuthService,
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [JwtAuthGuard, AdminGuard, 'JWT_SECRET'],
})
export class AuthModule {}
