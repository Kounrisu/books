import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { LoginInput, RegisterInput } from './auth.types.js';
import type { AuthResult, CurrentUserProfile } from './auth.types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterInput): Promise<AuthResult> {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: LoginInput): Promise<AuthResult> {
    return this.authService.login(body.email, body.password);
  }

  @Post('demo')
  demo(): Promise<AuthResult> {
    return this.authService.demoLogin();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() userId: string): Promise<CurrentUserProfile> {
    return this.authService.me(userId);
  }
}
