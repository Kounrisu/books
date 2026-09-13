import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthResult, CurrentUserProfile } from './auth.types.js';

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
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled');
    }
    return { accessToken: this.jwt.sign({ sub: user.id }) };
  }

  async me(userId: string): Promise<CurrentUserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { id: user.id, email: user.email, role: user.role, isActive: user.isActive };
  }
}
