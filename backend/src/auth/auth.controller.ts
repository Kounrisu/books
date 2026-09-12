import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { AuthResult, LoginInput, RegisterInput } from './auth.types.js';

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
}
