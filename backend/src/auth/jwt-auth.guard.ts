import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwt: JwtService;

  constructor(
    @Inject('JWT_SECRET') secret: string,
    private readonly prisma: PrismaService,
  ) {
    this.jwt = new JwtService({ secret });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { userId?: string }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice('Bearer '.length);
    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is disabled or no longer exists');
    }
    request.userId = payload.sub;
    return true;
  }
}
