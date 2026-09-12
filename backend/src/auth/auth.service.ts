import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthResult } from './auth.types.js';

@Injectable()
export class AuthService {
  private readonly jwt: JwtService;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('JWT_SECRET') secret: string,
  ) {
    this.jwt = new JwtService({ secret, signOptions: { expiresIn: '30d' } });
  }

  async register(email: string, password: string): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, passwordHash } });
    return { accessToken: this.jwt.sign({ sub: user.id }) };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { accessToken: this.jwt.sign({ sub: user.id }) };
  }
}
