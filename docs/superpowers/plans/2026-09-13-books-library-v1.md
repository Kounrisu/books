# Personal Book Library Manager v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted, multi-tenant personal book cataloging webapp (manual data entry, no AI/API calls in v1) with photo upload for book covers and locations, computed category/overall rankings, running locally via Docker Compose first.

**Architecture:** NestJS + Prisma + Postgres backend (`backend/`) exposing a JSON API with JWT auth, storing uploaded photos on local disk; Angular (standalone components, signals) + Angular Material/CDK frontend (`frontend/`) consuming that API. Both run in Docker Compose locally and, unchanged, on the VPS later.

**Tech Stack:** NestJS 10, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL 16, Angular 20, Angular Material + CDK, Vitest (backend tests), Docker Compose.

**Spec:** `docs/superpowers/specs/2026-09-13-books-library-design.md`

## Global Constraints

- No AI vision or external book-API calls anywhere in this plan (v1 is 100% manual entry) — spec "Goals (v1)" / "Non-Goals".
- Every `Book` and `Location` row belongs to exactly one `User` (multi-tenant from day one) — spec "Multi-user model".
- Photos are stored on local disk under a Docker volume in both dev and prod — never S3 — spec "Photo storage".
- Category/overall rank is always computed at read time from `myNote`, never stored or manually entered — spec "Ranking".
- `title` and `author` are the only required `Book` fields; everything else is optional and editable later — spec "Error Handling".
- Backend tests use Vitest with services instantiated directly and a local Prisma mock helper (no `@nestjs/testing` bootstrapping) — matches `06-lotokarma/backend`'s convention.
- Angular components are standalone by default (no explicit `standalone: true`), use `input()`/`output()`/`signal()`/`computed()`, `inject()` for DI — matches `09-lenormand`'s convention.

---

## Task 1: Backend scaffold + health check

**Files:**
- Create: `backend/` (via Nest CLI scaffold)
- Create: `backend/src/app.controller.ts`
- Create: `backend/src/app.controller.spec.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`

**Interfaces:**
- Produces: `GET /health` → `{ status: 'ok' }`, used by Task 10's Docker healthcheck.

- [ ] **Step 1: Scaffold the NestJS project**

```bash
cd C:/dev/dev-projects/21-books
npx -y @nestjs/cli@10 new backend --package-manager npm --skip-git --language ts
```

- [ ] **Step 2: Replace the default app controller with a health check, and write its test**

Replace `backend/src/app.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
```

Replace `backend/src/app.controller.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  it('returns ok status from health check', () => {
    const controller = new AppController();
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
```

Delete `backend/src/app.service.ts` and remove its references from `backend/src/app.module.ts` and `backend/src/app.controller.ts` (the Nest CLI scaffold wires a default `AppService` — this app's `AppModule` will only need `AppController` at this stage; later tasks add feature modules to `imports`).

`backend/src/app.module.ts` becomes:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 3: Switch the test runner from Jest (Nest CLI default) to Vitest**

```bash
cd backend
npm install -D vitest
```

Remove the `jest` config block from `backend/package.json` and replace the `test` scripts:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Remove `@nestjs/testing`, `jest`, `ts-jest`, `@types/jest` from `devDependencies` (not needed — this project's tests instantiate classes directly, matching `06-lotokarma/backend`'s convention).

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd backend && npm test`
Expected: PASS — `AppController > returns ok status from health check`

- [ ] **Step 5: Verify the app actually boots**

Run: `cd backend && npm run start` (Ctrl+C after confirming), then in another terminal: `curl http://localhost:3000/health`
Expected: `{"status":"ok"}`

- [ ] **Step 6: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add backend
git commit -m "feat: scaffold NestJS backend with health check endpoint"
```

---

## Task 2: Prisma schema + PrismaService/PrismaModule

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma7.config.ts`
- Create: `backend/src/prisma/prisma.service.ts`
- Create: `backend/src/prisma/prisma.module.ts`
- Create: `backend/src/prisma/prisma.service.spec.ts`
- Modify: `backend/src/app.module.ts`
- Create: `backend/.env.example`

**Interfaces:**
- Produces: `PrismaService` (injectable, extends generated `PrismaClient`, exposes `.user`, `.location`, `.book` delegates) — every later feature module depends on this.
- Produces: `PrismaModule` (global — import once in `AppModule`, available everywhere via DI).

- [ ] **Step 1: Install Prisma dependencies**

```bash
cd backend
npm install prisma @prisma/adapter-pg pg dotenv
npm install -D @types/pg
```

- [ ] **Step 2: Write the schema**

Create `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String     @map("password_hash")
  createdAt    DateTime   @default(now()) @map("created_at")
  locations    Location[]
  books        Book[]

  @@map("users")
}

model Location {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  name      String
  photoPath String?  @map("photo_path")
  latitude  Float?
  longitude Float?
  createdAt DateTime @default(now()) @map("created_at")
  books     Book[]

  @@map("locations")
}

model Book {
  id             String    @id @default(cuid())
  userId         String    @map("user_id")
  user           User      @relation(fields: [userId], references: [id])
  title          String
  author         String
  category       String?
  language       String?
  description    String?
  myReview       String?   @map("my_review")
  myNote         Int?      @map("my_note")
  recommend      Boolean?
  coverImagePath String?   @map("cover_image_path")
  locationId     String?   @map("location_id")
  location       Location? @relation(fields: [locationId], references: [id])
  purchaseDate   DateTime? @map("purchase_date")
  purchasePrice  Decimal?  @map("purchase_price") @db.Decimal(10, 2)
  source         String    @default("manual")
  createdAt      DateTime  @default(now()) @map("created_at")

  @@map("books")
}
```

- [ ] **Step 3: Write the Prisma config**

Create `backend/prisma7.config.ts`:

```ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env['DATABASE_URL'] },
});
```

Create `backend/.env.example`:

```
DATABASE_URL=postgresql://books:books@localhost:5432/books
JWT_SECRET=change-me-in-production
PORT=3000
```

Copy it to `backend/.env` (git-ignored) with the same values for local dev.

- [ ] **Step 4: Generate the Prisma client**

Run: `cd backend && npx prisma generate --config prisma7.config.ts`
Expected: `Generated Prisma Client` message, `backend/src/generated/prisma/` created.

Add to `backend/.gitignore`: `src/generated/`

- [ ] **Step 5: Write PrismaService, PrismaModule, and a test for PrismaService**

Create `backend/src/prisma/prisma.service.ts`:

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })) });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `backend/src/prisma/prisma.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

Create `backend/src/prisma/prisma.service.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('constructs without connecting (no DB required for this test)', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
    const service = new PrismaService();
    expect(service).toBeDefined();
    expect(service.user).toBeDefined();
    expect(service.book).toBeDefined();
    expect(service.location).toBeDefined();
  });
});
```

- [ ] **Step 6: Wire PrismaModule into AppModule**

Modify `backend/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 7: Run tests**

Run: `cd backend && npm test`
Expected: PASS — both `AppController` and `PrismaService` tests.

- [ ] **Step 8: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add backend
git commit -m "feat: add Prisma schema (User/Location/Book) and PrismaService/PrismaModule"
```

---

## Task 3: Auth (register/login, JWT guard)

**Files:**
- Create: `backend/src/auth/auth.types.ts`
- Create: `backend/src/auth/auth.service.ts`
- Create: `backend/src/auth/auth.service.spec.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Create: `backend/src/auth/jwt-auth.guard.ts`
- Create: `backend/src/auth/current-user.decorator.ts`
- Create: `backend/src/auth/auth.module.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `PrismaService` (Task 2) — `.user.findUnique`, `.user.create`.
- Produces: `AuthService.register(email: string, password: string): Promise<{ accessToken: string }>`, `AuthService.login(email: string, password: string): Promise<{ accessToken: string }>` — used by `AuthController`.
- Produces: `JwtAuthGuard` (implements `CanActivate`) and `@CurrentUser()` param decorator returning `userId: string` — every later protected controller (Books, Locations) uses both.

- [ ] **Step 1: Install auth dependencies**

```bash
cd backend
npm install @nestjs/jwt bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Write auth types**

Create `backend/src/auth/auth.types.ts`:

```ts
export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
}
```

- [ ] **Step 3: Write the failing test for AuthService**

Create `backend/src/auth/auth.service.spec.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: { findUnique?: unknown; create?: unknown } = {}) {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(overrides.findUnique ?? null),
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
    },
  } as unknown as PrismaService;
}

describe('AuthService', () => {
  it('registers a new user and returns an access token', async () => {
    const prisma = makePrismaMock({
      findUnique: null,
      create: { id: 'user-1', email: 'a@b.com', passwordHash: 'hashed', createdAt: new Date() },
    });
    const service = new AuthService(prisma, 'test-secret');

    const result = await service.register('a@b.com', 'password123');

    expect(result.accessToken).toBeTruthy();
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'a@b.com' }) }),
    );
  });

  it('rejects registration when the email is already taken', async () => {
    const prisma = makePrismaMock({ findUnique: { id: 'user-1', email: 'a@b.com' } });
    const service = new AuthService(prisma, 'test-secret');

    await expect(service.register('a@b.com', 'password123')).rejects.toThrow('Email already registered');
  });

  it('logs in with correct credentials', async () => {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    const prisma = makePrismaMock({ findUnique: { id: 'user-1', email: 'a@b.com', passwordHash } });
    const service = new AuthService(prisma, 'test-secret');

    const result = await service.login('a@b.com', 'password123');

    expect(result.accessToken).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    const prisma = makePrismaMock({ findUnique: { id: 'user-1', email: 'a@b.com', passwordHash } });
    const service = new AuthService(prisma, 'test-secret');

    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backend && npm test -- auth.service`
Expected: FAIL — `Cannot find module './auth.service.js'`

- [ ] **Step 5: Implement AuthService**

Create `backend/src/auth/auth.service.ts`:

```ts
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && npm test -- auth.service`
Expected: PASS — all 4 `AuthService` tests.

- [ ] **Step 7: Write the JWT guard and current-user decorator**

Create `backend/src/auth/jwt-auth.guard.ts`:

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwt: JwtService;

  constructor(@Inject('JWT_SECRET') secret: string) {
    this.jwt = new JwtService({ secret });
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { userId?: string }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice('Bearer '.length);
    try {
      const payload = this.jwt.verify<{ sub: string }>(token);
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

Create `backend/src/auth/current-user.decorator.ts`:

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request & { userId: string }>();
  return request.userId;
});
```

- [ ] **Step 8: Write the controller and module**

Create `backend/src/auth/auth.controller.ts`:

```ts
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
```

Create `backend/src/auth/auth.module.ts`:

```ts
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
```

- [ ] **Step 9: Wire AuthModule into AppModule**

Modify `backend/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 10: Run full test suite**

Run: `cd backend && npm test`
Expected: PASS — all tests across `AppController`, `PrismaService`, `AuthService`.

- [ ] **Step 11: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add backend
git commit -m "feat: add auth module (register/login, JWT guard, current-user decorator)"
```

---

## Task 4: Photo upload shared utility

**Files:**
- Create: `backend/src/uploads/multer.config.ts`
- Create: `backend/src/uploads/multer.config.spec.ts`
- Modify: `backend/src/main.ts`

**Interfaces:**
- Produces: `imageUploadOptions: MulterOptions` (disk storage under `./uploads`, image-only filter, random filename) — consumed by Task 5's `LocationsController` and Task 6's `BooksController` via `@UseInterceptors(FileInterceptor('photo', imageUploadOptions))`.
- Produces: static file serving at `/uploads/*` from `main.ts` — the frontend renders `<img src="{apiBaseUrl}/uploads/{filename}">`.

- [ ] **Step 1: Install multer and uuid**

```bash
cd backend
npm install multer uuid
npm install -D @types/multer @types/uuid
```

- [ ] **Step 2: Write the failing test for the filename generator**

Create `backend/src/uploads/multer.config.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { imageFileFilter, generateUploadFilename } from './multer.config.js';

describe('generateUploadFilename', () => {
  it('preserves the original file extension', () => {
    const filename = generateUploadFilename('cover.JPG');
    expect(filename).toMatch(/\.jpg$/);
  });

  it('generates a different name each call', () => {
    expect(generateUploadFilename('a.png')).not.toBe(generateUploadFilename('a.png'));
  });
});

describe('imageFileFilter', () => {
  it('accepts image mimetypes', () => {
    let accepted: boolean | undefined;
    imageFileFilter({} as never, { mimetype: 'image/jpeg' } as never, (_err, ok) => {
      accepted = ok;
    });
    expect(accepted).toBe(true);
  });

  it('rejects non-image mimetypes', () => {
    let accepted: boolean | undefined;
    imageFileFilter({} as never, { mimetype: 'application/pdf' } as never, (_err, ok) => {
      accepted = ok;
    });
    expect(accepted).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && npm test -- multer.config`
Expected: FAIL — `Cannot find module './multer.config.js'`

- [ ] **Step 4: Implement the multer config**

Create `backend/src/uploads/multer.config.ts`:

```ts
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

export function generateUploadFilename(originalName: string): string {
  const ext = extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}

export function imageFileFilter(
  _req: unknown,
  file: { mimetype: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  callback(null, file.mimetype.startsWith('image/'));
}

export const imageUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => callback(null, generateUploadFilename(file.originalname)),
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npm test -- multer.config`
Expected: PASS — all 4 tests.

- [ ] **Step 6: Serve uploaded files as static assets**

Modify `backend/src/main.ts` — switch to `NestExpressApplication` and add `useStaticAssets`:

```ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Create the `backend/uploads/` directory with a `.gitkeep` file so it exists in a fresh checkout, and add `uploads/*` (except `.gitkeep`) to `backend/.gitignore`.

- [ ] **Step 7: Run full test suite**

Run: `cd backend && npm test`
Expected: PASS — all tests.

- [ ] **Step 8: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add backend
git commit -m "feat: add photo upload multer config and static file serving"
```

---

## Task 5: Locations module (CRUD + photo + geolocation)

**Files:**
- Create: `backend/src/locations/locations.types.ts`
- Create: `backend/src/locations/locations.service.ts`
- Create: `backend/src/locations/locations.service.spec.ts`
- Create: `backend/src/locations/locations.controller.ts`
- Create: `backend/src/locations/locations.module.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `PrismaService` (Task 2), `JwtAuthGuard`/`CurrentUser` (Task 3), `imageUploadOptions` (Task 4).
- Produces: `LocationsService.create(userId, input): Promise<LocationRow>`, `.findAllForUser(userId): Promise<LocationRow[]>`, `.update(userId, id, input): Promise<LocationRow>`, `.delete(userId, id): Promise<void>` — `LocationRow` shape consumed by Task 6 (`Book.locationId` FK) and the frontend's location picker.

- [ ] **Step 1: Write location types**

Create `backend/src/locations/locations.types.ts`:

```ts
export interface LocationRow {
  id: string;
  userId: string;
  name: string;
  photoPath: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
}

export interface CreateLocationInput {
  name: string;
  photoPath?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationInput {
  name?: string;
  photoPath?: string;
  latitude?: number;
  longitude?: number;
}
```

- [ ] **Step 2: Write the failing test for LocationsService**

Create `backend/src/locations/locations.service.spec.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { LocationsService } from './locations.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: Partial<Record<'create' | 'findMany' | 'updateMany' | 'update' | 'deleteMany', unknown>> = {}) {
  return {
    location: {
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
      findMany: vi.fn().mockResolvedValue(overrides.findMany ?? []),
      updateMany: vi.fn().mockResolvedValue(overrides.updateMany ?? { count: 1 }),
      update: vi.fn().mockResolvedValue(overrides.update ?? null),
      deleteMany: vi.fn().mockResolvedValue(overrides.deleteMany ?? { count: 1 }),
    },
  } as unknown as PrismaService;
}

describe('LocationsService', () => {
  it('creates a location scoped to the given user', async () => {
    const prisma = makePrismaMock({ create: { id: 'loc-1', userId: 'user-1', name: 'Garage' } });
    const service = new LocationsService(prisma);

    await service.create('user-1', { name: 'Garage' });

    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', name: 'Garage', photoPath: undefined, latitude: undefined, longitude: undefined },
    });
  });

  it('lists only the given user\'s locations', async () => {
    const prisma = makePrismaMock({ findMany: [{ id: 'loc-1', userId: 'user-1' }] });
    const service = new LocationsService(prisma);

    const result = await service.findAllForUser('user-1');

    expect(prisma.location.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([{ id: 'loc-1', userId: 'user-1' }]);
  });

  it('rejects updating a location that does not belong to the user', async () => {
    const prisma = makePrismaMock({ updateMany: { count: 0 } });
    const service = new LocationsService(prisma);

    await expect(service.update('user-1', 'loc-of-someone-else', { name: 'x' })).rejects.toThrow('Location not found');
  });

  it('rejects deleting a location that does not belong to the user', async () => {
    const prisma = makePrismaMock({ deleteMany: { count: 0 } });
    const service = new LocationsService(prisma);

    await expect(service.delete('user-1', 'loc-of-someone-else')).rejects.toThrow('Location not found');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && npm test -- locations.service`
Expected: FAIL — `Cannot find module './locations.service.js'`

- [ ] **Step 4: Implement LocationsService**

Create `backend/src/locations/locations.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLocationInput, LocationRow, UpdateLocationInput } from './locations.types.js';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, input: CreateLocationInput): Promise<LocationRow> {
    return this.prisma.location.create({
      data: {
        userId,
        name: input.name,
        photoPath: input.photoPath,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });
  }

  findAllForUser(userId: string): Promise<LocationRow[]> {
    return this.prisma.location.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async update(userId: string, id: string, input: UpdateLocationInput): Promise<LocationRow> {
    const result = await this.prisma.location.updateMany({ where: { id, userId }, data: input });
    if (result.count === 0) {
      throw new NotFoundException('Location not found');
    }
    return this.prisma.location.findFirstOrThrow({ where: { id, userId } });
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.location.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new NotFoundException('Location not found');
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npm test -- locations.service`
Expected: PASS — all 4 tests.

- [ ] **Step 6: Write the controller and module**

Create `backend/src/locations/locations.controller.ts`:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { imageUploadOptions } from '../uploads/multer.config.js';
import { LocationsService } from './locations.service.js';
import type { LocationRow } from './locations.types.js';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  create(
    @CurrentUser() userId: string,
    @Body() body: { name: string; latitude?: string; longitude?: string },
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<LocationRow> {
    return this.locationsService.create(userId, {
      name: body.name,
      photoPath: photo?.filename,
      latitude: body.latitude ? Number(body.latitude) : undefined,
      longitude: body.longitude ? Number(body.longitude) : undefined,
    });
  }

  @Get()
  findAll(@CurrentUser() userId: string): Promise<LocationRow[]> {
    return this.locationsService.findAllForUser(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; latitude?: string; longitude?: string },
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<LocationRow> {
    return this.locationsService.update(userId, id, {
      name: body.name,
      photoPath: photo?.filename,
      latitude: body.latitude ? Number(body.latitude) : undefined,
      longitude: body.longitude ? Number(body.longitude) : undefined,
    });
  }

  @Delete(':id')
  delete(@CurrentUser() userId: string, @Param('id') id: string): Promise<void> {
    return this.locationsService.delete(userId, id);
  }
}
```

Create `backend/src/locations/locations.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LocationsController } from './locations.controller.js';
import { LocationsService } from './locations.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
```

- [ ] **Step 7: Wire LocationsModule into AppModule**

Modify `backend/src/app.module.ts` — add `LocationsModule` to `imports`.

- [ ] **Step 8: Run full test suite**

Run: `cd backend && npm test`
Expected: PASS — all tests.

- [ ] **Step 9: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add backend
git commit -m "feat: add locations module (CRUD, photo upload, geolocation fields)"
```

---

## Task 6: Books module (CRUD + photo + ranking)

**Files:**
- Create: `backend/src/books/books.types.ts`
- Create: `backend/src/books/ranking.ts`
- Create: `backend/src/books/ranking.spec.ts`
- Create: `backend/src/books/books.service.ts`
- Create: `backend/src/books/books.service.spec.ts`
- Create: `backend/src/books/books.controller.ts`
- Create: `backend/src/books/books.module.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `PrismaService` (Task 2), `JwtAuthGuard`/`CurrentUser` (Task 3), `imageUploadOptions` (Task 4).
- Produces: `computeRankings(books: RankableBook[]): Map<string, RankInfo>` — pure function, no DB dependency.
- Produces: `BooksService.findAllForUser(userId): Promise<BookWithRanking[]>`, `.create/.update/.delete` — `BookWithRanking` is what the frontend book list renders.

- [ ] **Step 1: Write the failing test for the ranking algorithm**

Create `backend/src/books/ranking.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeRankings } from './ranking.js';

describe('computeRankings', () => {
  it('ranks books within their category and overall, descending by myNote', () => {
    const books = [
      { id: 'a', category: 'Sci-Fi', myNote: 9 },
      { id: 'b', category: 'Sci-Fi', myNote: 7 },
      { id: 'c', category: 'Essay', myNote: 8 },
    ];

    const rankings = computeRankings(books);

    expect(rankings.get('a')).toEqual({ categoryRank: 1, categoryTotal: 2, overallRank: 1, overallTotal: 3 });
    expect(rankings.get('b')).toEqual({ categoryRank: 2, categoryTotal: 2, overallRank: 3, overallTotal: 3 });
    expect(rankings.get('c')).toEqual({ categoryRank: 1, categoryTotal: 1, overallRank: 2, overallTotal: 3 });
  });

  it('excludes books with no myNote from ranking entirely', () => {
    const books = [
      { id: 'a', category: 'Sci-Fi', myNote: 9 },
      { id: 'b', category: 'Sci-Fi', myNote: null },
    ];

    const rankings = computeRankings(books);

    expect(rankings.has('a')).toBe(true);
    expect(rankings.has('b')).toBe(false);
  });

  it('groups books with no category together under the same "no category" bucket', () => {
    const books = [
      { id: 'a', category: null, myNote: 5 },
      { id: 'b', category: null, myNote: 8 },
    ];

    const rankings = computeRankings(books);

    expect(rankings.get('b')).toEqual({ categoryRank: 1, categoryTotal: 2, overallRank: 1, overallTotal: 2 });
    expect(rankings.get('a')).toEqual({ categoryRank: 2, categoryTotal: 2, overallRank: 2, overallTotal: 2 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- ranking`
Expected: FAIL — `Cannot find module './ranking.js'`

- [ ] **Step 3: Implement the ranking algorithm**

Create `backend/src/books/ranking.ts`:

```ts
export interface RankableBook {
  id: string;
  category: string | null;
  myNote: number | null;
}

export interface RankInfo {
  categoryRank: number;
  categoryTotal: number;
  overallRank: number;
  overallTotal: number;
}

export function computeRankings(books: RankableBook[]): Map<string, RankInfo> {
  const ranked = books.filter((b): b is RankableBook & { myNote: number } => b.myNote != null);

  const overallSorted = [...ranked].sort((a, b) => b.myNote - a.myNote);
  const overallTotal = overallSorted.length;
  const overallRankById = new Map(overallSorted.map((b, i) => [b.id, i + 1]));

  const byCategory = new Map<string, typeof ranked>();
  for (const book of ranked) {
    const key = book.category ?? '';
    const group = byCategory.get(key) ?? [];
    group.push(book);
    byCategory.set(key, group);
  }

  const result = new Map<string, RankInfo>();
  for (const group of byCategory.values()) {
    const sorted = [...group].sort((a, b) => b.myNote - a.myNote);
    sorted.forEach((book, index) => {
      result.set(book.id, {
        categoryRank: index + 1,
        categoryTotal: sorted.length,
        overallRank: overallRankById.get(book.id)!,
        overallTotal,
      });
    });
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- ranking`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Write book types**

Create `backend/src/books/books.types.ts`:

```ts
import type { RankInfo } from './ranking.js';

export interface BookRow {
  id: string;
  userId: string;
  title: string;
  author: string;
  category: string | null;
  language: string | null;
  description: string | null;
  myReview: string | null;
  myNote: number | null;
  recommend: boolean | null;
  coverImagePath: string | null;
  locationId: string | null;
  purchaseDate: Date | null;
  purchasePrice: unknown;
  source: string;
  createdAt: Date;
}

export type BookWithRanking = BookRow & { ranking: RankInfo | null };

export interface CreateBookInput {
  title: string;
  author: string;
  category?: string;
  language?: string;
  description?: string;
  myReview?: string;
  myNote?: number;
  recommend?: boolean;
  coverImagePath?: string;
  locationId?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
}

export type UpdateBookInput = Partial<CreateBookInput>;
```

- [ ] **Step 6: Write the failing test for BooksService**

Create `backend/src/books/books.service.spec.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { BooksService } from './books.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrismaMock(overrides: Partial<Record<'create' | 'findMany' | 'updateMany' | 'findFirstOrThrow' | 'deleteMany', unknown>> = {}) {
  return {
    book: {
      create: vi.fn().mockResolvedValue(overrides.create ?? null),
      findMany: vi.fn().mockResolvedValue(overrides.findMany ?? []),
      updateMany: vi.fn().mockResolvedValue(overrides.updateMany ?? { count: 1 }),
      findFirstOrThrow: vi.fn().mockResolvedValue(overrides.findFirstOrThrow ?? null),
      deleteMany: vi.fn().mockResolvedValue(overrides.deleteMany ?? { count: 1 }),
    },
  } as unknown as PrismaService;
}

describe('BooksService', () => {
  it('creates a book scoped to the given user, requiring only title and author', async () => {
    const prisma = makePrismaMock({ create: { id: 'book-1', userId: 'user-1', title: 'Dune', author: 'Herbert' } });
    const service = new BooksService(prisma);

    await service.create('user-1', { title: 'Dune', author: 'Herbert' });

    expect(prisma.book.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'user-1', title: 'Dune', author: 'Herbert' }),
    });
  });

  it('lists the user\'s books enriched with computed ranking', async () => {
    const prisma = makePrismaMock({
      findMany: [
        { id: 'a', userId: 'user-1', category: 'Sci-Fi', myNote: 9 },
        { id: 'b', userId: 'user-1', category: 'Sci-Fi', myNote: 5 },
      ],
    });
    const service = new BooksService(prisma);

    const result = await service.findAllForUser('user-1');

    expect(prisma.book.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' }, orderBy: { createdAt: 'desc' } });
    expect(result[0].ranking).toEqual({ categoryRank: 1, categoryTotal: 2, overallRank: 1, overallTotal: 2 });
    expect(result[1].ranking).toEqual({ categoryRank: 2, categoryTotal: 2, overallRank: 2, overallTotal: 2 });
  });

  it('gives a null ranking to a book with no myNote yet', async () => {
    const prisma = makePrismaMock({ findMany: [{ id: 'a', userId: 'user-1', category: 'Sci-Fi', myNote: null }] });
    const service = new BooksService(prisma);

    const result = await service.findAllForUser('user-1');

    expect(result[0].ranking).toBeNull();
  });

  it('rejects updating a book that does not belong to the user', async () => {
    const prisma = makePrismaMock({ updateMany: { count: 0 } });
    const service = new BooksService(prisma);

    await expect(service.update('user-1', 'book-of-someone-else', { title: 'x' })).rejects.toThrow('Book not found');
  });

  it('rejects deleting a book that does not belong to the user', async () => {
    const prisma = makePrismaMock({ deleteMany: { count: 0 } });
    const service = new BooksService(prisma);

    await expect(service.delete('user-1', 'book-of-someone-else')).rejects.toThrow('Book not found');
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd backend && npm test -- books.service`
Expected: FAIL — `Cannot find module './books.service.js'`

- [ ] **Step 8: Implement BooksService**

Create `backend/src/books/books.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeRankings } from './ranking.js';
import type { BookRow, BookWithRanking, CreateBookInput, UpdateBookInput } from './books.types.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, input: CreateBookInput): Promise<BookRow> {
    return this.prisma.book.create({ data: { userId, ...input } });
  }

  async findAllForUser(userId: string): Promise<BookWithRanking[]> {
    const books = await this.prisma.book.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    const rankings = computeRankings(books);
    return books.map((book) => ({ ...book, ranking: rankings.get(book.id) ?? null }));
  }

  async update(userId: string, id: string, input: UpdateBookInput): Promise<BookRow> {
    const result = await this.prisma.book.updateMany({ where: { id, userId }, data: input });
    if (result.count === 0) {
      throw new NotFoundException('Book not found');
    }
    return this.prisma.book.findFirstOrThrow({ where: { id, userId } });
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.prisma.book.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new NotFoundException('Book not found');
    }
  }
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `cd backend && npm test -- books.service`
Expected: PASS — all 5 tests.

- [ ] **Step 10: Write the controller and module**

Create `backend/src/books/books.controller.ts`:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { imageUploadOptions } from '../uploads/multer.config.js';
import { BooksService } from './books.service.js';
import type { BookRow, BookWithRanking } from './books.types.js';

interface BookFormBody {
  title: string;
  author: string;
  category?: string;
  language?: string;
  description?: string;
  myReview?: string;
  myNote?: string;
  recommend?: string;
  locationId?: string;
  purchaseDate?: string;
  purchasePrice?: string;
}

function parseBookForm(body: BookFormBody, photo?: Express.Multer.File) {
  return {
    title: body.title,
    author: body.author,
    category: body.category,
    language: body.language,
    description: body.description,
    myReview: body.myReview,
    myNote: body.myNote ? Number(body.myNote) : undefined,
    recommend: body.recommend === undefined ? undefined : body.recommend === 'true',
    coverImagePath: photo?.filename,
    locationId: body.locationId,
    purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
    purchasePrice: body.purchasePrice ? Number(body.purchasePrice) : undefined,
  };
}

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  create(
    @CurrentUser() userId: string,
    @Body() body: BookFormBody,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<BookRow> {
    return this.booksService.create(userId, parseBookForm(body, photo));
  }

  @Get()
  findAll(@CurrentUser() userId: string): Promise<BookWithRanking[]> {
    return this.booksService.findAllForUser(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: Partial<BookFormBody>,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<BookRow> {
    return this.booksService.update(userId, id, parseBookForm(body as BookFormBody, photo));
  }

  @Delete(':id')
  delete(@CurrentUser() userId: string, @Param('id') id: string): Promise<void> {
    return this.booksService.delete(userId, id);
  }
}
```

Create `backend/src/books/books.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';

@Module({
  imports: [AuthModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
```

- [ ] **Step 11: Wire BooksModule into AppModule**

Modify `backend/src/app.module.ts` — add `BooksModule` to `imports`.

- [ ] **Step 12: Run full test suite**

Run: `cd backend && npm test`
Expected: PASS — all tests across every module.

- [ ] **Step 13: Run migration against a real database (manual verification)**

Run: `cd backend && npx prisma migrate dev --name init --config prisma7.config.ts` (requires a running Postgres — see Task 9 for `docker-compose.yml`; if Postgres isn't up yet, come back to this step after Task 9 and re-run it before moving to Task 7).

Expected: migration created under `backend/prisma/migrations/`, applied successfully.

- [ ] **Step 14: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add backend
git commit -m "feat: add books module (CRUD, photo upload, computed ranking)"
```

---

## Task 7: Frontend scaffold + auth

**Files:**
- Create: `frontend/` (via Angular CLI scaffold)
- Create: `frontend/src/environments/environment.ts`
- Create: `frontend/src/environments/environment.prod.ts`
- Create: `frontend/src/app/core/auth.service.ts`
- Create: `frontend/src/app/core/auth.service.spec.ts`
- Create: `frontend/src/app/core/auth.interceptor.ts`
- Create: `frontend/src/app/features/login/login.ts`
- Create: `frontend/src/app/features/login/login.html`
- Modify: `frontend/src/app/app.config.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/angular.json`

**Interfaces:**
- Produces: `AuthService.login(email, password): Promise<void>`, `.register(...)`, `.token(): string | null`, `.isAuthenticated: Signal<boolean>` — consumed by Task 8/9's HTTP services and route guards.
- Produces: `authInterceptor` (functional `HttpInterceptorFn`) attaching `Authorization: Bearer <token>` to every request — registered once in `app.config.ts`, used by every later feature service automatically.

- [ ] **Step 1: Scaffold the Angular project**

```bash
cd C:/dev/dev-projects/21-books
npx -y @angular/cli@20 new frontend --routing --style=scss --ssr=false --skip-git
```

- [ ] **Step 2: Add Angular Material and CDK**

```bash
cd frontend
npx -y @angular/cli@20 add @angular/material --skip-confirmation
```

This registers a prebuilt theme in `angular.json`'s `styles` array and adds `provideAnimationsAsync()` to `app.config.ts` automatically.

- [ ] **Step 3: Write environment files**

Create `frontend/src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
};
```

Create `frontend/src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiBaseUrl: '/api',
};
```

- [ ] **Step 4: Write the failing test for AuthService**

Create `frontend/src/app/core/auth.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('accessToken');
  });

  afterEach(() => httpMock.verify());

  it('stores the access token and flips isAuthenticated on login', async () => {
    expect(service.isAuthenticated()).toBe(false);

    const loginPromise = service.login('a@b.com', 'password123');
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'token-abc' });
    await loginPromise;

    expect(service.token()).toBe('token-abc');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears the token on logout', async () => {
    localStorage.setItem('accessToken', 'token-abc');
    service = TestBed.inject(AuthService);

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `cd frontend && ng test --watch=false`
Expected: FAIL — `Cannot find module './auth.service'`

(If the scaffolded project uses Karma instead of a Vitest-compatible runner, this is fine — Angular CLI's default `ng test` works with the syntax above via its Jasmine/Karma harness, which supports the same `describe`/`it`/`expect` shape used here. No extra runner install needed.)

- [ ] **Step 6: Implement AuthService**

Create `frontend/src/app/core/auth.service.ts`:

```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResult {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('accessToken'));

  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  token(): string | null {
    return this.tokenSignal();
  }

  async login(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/login`, { email, password }));
    this.setToken(result.accessToken);
  }

  async register(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(this.http.post<AuthResult>(`${this.baseUrl}/register`, { email, password }));
    this.setToken(result.accessToken);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.tokenSignal.set(null);
  }

  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.tokenSignal.set(token);
  }
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd frontend && ng test --watch=false`
Expected: PASS — both `AuthService` tests.

- [ ] **Step 8: Write the auth HTTP interceptor**

Create `frontend/src/app/core/auth.interceptor.ts`:

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

Modify `frontend/src/app/app.config.ts` to register it (keep the Material `provideAnimationsAsync()` the `add @angular/material` step already inserted):

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
};
```

- [ ] **Step 9: Write a minimal login page**

Create `frontend/src/app/features/login/login.ts`:

```ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    try {
      await this.auth.login(this.email(), this.password());
      this.router.navigateByUrl('/books');
    } catch {
      this.error.set('Invalid email or password.');
    }
  }
}
```

Create `frontend/src/app/features/login/login.html`:

```html
<form (ngSubmit)="submit()">
  <mat-form-field>
    <mat-label>Email</mat-label>
    <input matInput type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" required />
  </mat-form-field>
  <mat-form-field>
    <mat-label>Password</mat-label>
    <input matInput type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" name="password" required />
  </mat-form-field>
  @if (error()) {
    <p class="error">{{ error() }}</p>
  }
  <button mat-raised-button color="primary" type="submit">Log in</button>
</form>
```

- [ ] **Step 10: Wire the login route**

Modify `frontend/src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
```

- [ ] **Step 11: Verify the app builds and serves**

Run: `cd frontend && ng build`
Expected: build succeeds with no errors.

Run: `cd frontend && ng serve` (Ctrl+C after confirming), open `http://localhost:4200/login`
Expected: login form renders with Material styling.

- [ ] **Step 12: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add frontend
git commit -m "feat: scaffold Angular frontend with Material/CDK and auth (login, interceptor)"
```

---

## Task 8: Frontend — Locations feature

**Files:**
- Create: `frontend/src/app/core/locations.service.ts`
- Create: `frontend/src/app/core/locations.service.spec.ts`
- Create: `frontend/src/app/features/locations/location-list.ts`
- Create: `frontend/src/app/features/locations/location-list.html`
- Create: `frontend/src/app/features/locations/location-form.ts`
- Create: `frontend/src/app/features/locations/location-form.html`
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService` (Task 7, via the registered interceptor — no direct import needed in this service).
- Produces: `LocationsService.locations: Signal<Location[]>`, `.load(): Promise<void>`, `.create(formData: FormData): Promise<void>` — consumed by Task 9's book form (location picker).

- [ ] **Step 1: Write the failing test for LocationsService**

Create `frontend/src/app/core/locations.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocationsService } from './locations.service';
import { environment } from '../../environments/environment';

describe('LocationsService', () => {
  let service: LocationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(LocationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads locations into the locations signal', async () => {
    const loadPromise = service.load();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/locations`);
    req.flush([{ id: 'loc-1', name: 'Garage' }]);
    await loadPromise;

    expect(service.locations()).toEqual([{ id: 'loc-1', name: 'Garage' }]);
  });

  it('posts form data to create a location and reloads the list', async () => {
    const formData = new FormData();
    formData.append('name', 'Garage');

    const createPromise = service.create(formData);
    const createReq = httpMock.expectOne(`${environment.apiBaseUrl}/locations`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: 'loc-1', name: 'Garage' });
    const reloadReq = httpMock.expectOne(`${environment.apiBaseUrl}/locations`);
    reloadReq.flush([{ id: 'loc-1', name: 'Garage' }]);
    await createPromise;

    expect(service.locations()).toEqual([{ id: 'loc-1', name: 'Garage' }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && ng test --watch=false`
Expected: FAIL — `Cannot find module './locations.service'`

- [ ] **Step 3: Implement LocationsService**

Create `frontend/src/app/core/locations.service.ts`:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LocationRow {
  id: string;
  name: string;
  photoPath: string | null;
  latitude: number | null;
  longitude: number | null;
}

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/locations`;

  readonly locations = signal<LocationRow[]>([]);

  async load(): Promise<void> {
    const result = await firstValueFrom(this.http.get<LocationRow[]>(this.baseUrl));
    this.locations.set(result);
  }

  async create(formData: FormData): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, formData));
    await this.load();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && ng test --watch=false`
Expected: PASS — both `LocationsService` tests.

- [ ] **Step 5: Write the location list component**

Create `frontend/src/app/features/locations/location-list.ts`:

```ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { LocationsService } from '../../core/locations.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-location-list',
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './location-list.html',
})
export class LocationListComponent implements OnInit {
  protected readonly locationsService = inject(LocationsService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    void this.locationsService.load();
  }
}
```

Create `frontend/src/app/features/locations/location-list.html`:

```html
<h1>Locations</h1>
<a mat-raised-button color="primary" routerLink="/locations/new">Add location</a>

<div class="location-grid">
  @for (location of locationsService.locations(); track location.id) {
    <mat-card>
      @if (location.photoPath) {
        <img mat-card-image [src]="apiBaseUrl + '/uploads/' + location.photoPath" [alt]="location.name" />
      }
      <mat-card-content>
        <h3>{{ location.name }}</h3>
        @if (location.latitude && location.longitude) {
          <p>{{ location.latitude }}, {{ location.longitude }}</p>
        }
      </mat-card-content>
    </mat-card>
  }
</div>
```

- [ ] **Step 6: Write the location form component with geolocation capture**

Create `frontend/src/app/features/locations/location-form.ts`:

```ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationsService } from '../../core/locations.service';

@Component({
  selector: 'app-location-form',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './location-form.html',
})
export class LocationFormComponent {
  private readonly locationsService = inject(LocationsService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly photoFile = signal<File | null>(null);
  readonly coordinates = signal<{ lat: number; lng: number } | null>(null);
  readonly geolocationError = signal<string | null>(null);

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile.set(input.files?.[0] ?? null);
  }

  captureLocation(): void {
    this.geolocationError.set(null);
    if (!navigator.geolocation) {
      this.geolocationError.set('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => this.coordinates.set({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => this.geolocationError.set('Location permission denied.'),
    );
  }

  async submit(): Promise<void> {
    const formData = new FormData();
    formData.append('name', this.name());
    const photo = this.photoFile();
    if (photo) {
      formData.append('photo', photo);
    }
    const coords = this.coordinates();
    if (coords) {
      formData.append('latitude', String(coords.lat));
      formData.append('longitude', String(coords.lng));
    }
    await this.locationsService.create(formData);
    this.router.navigateByUrl('/locations');
  }
}
```

Create `frontend/src/app/features/locations/location-form.html`:

```html
<form (ngSubmit)="submit()">
  <mat-form-field>
    <mat-label>Name</mat-label>
    <input matInput [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required />
  </mat-form-field>

  <input type="file" accept="image/*" (change)="onPhotoSelected($event)" />

  <button mat-stroked-button type="button" (click)="captureLocation()">Capture current location</button>
  @if (coordinates(); as coords) {
    <p>Captured: {{ coords.lat }}, {{ coords.lng }}</p>
  }
  @if (geolocationError()) {
    <p class="error">{{ geolocationError() }}</p>
  }

  <button mat-raised-button color="primary" type="submit">Save location</button>
</form>
```

- [ ] **Step 7: Wire the routes**

Modify `frontend/src/app/app.routes.ts` — add:

```ts
{ path: 'locations', component: LocationListComponent },
{ path: 'locations/new', component: LocationFormComponent },
```

(with the matching imports for `LocationListComponent` and `LocationFormComponent`.)

- [ ] **Step 8: Run full test suite and verify build**

Run: `cd frontend && ng test --watch=false && ng build`
Expected: PASS, build succeeds.

- [ ] **Step 9: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add frontend
git commit -m "feat: add locations feature (list, create form with photo + geolocation)"
```

---

## Task 9: Frontend — Books feature

**Files:**
- Create: `frontend/src/app/core/books.service.ts`
- Create: `frontend/src/app/core/books.service.spec.ts`
- Create: `frontend/src/app/features/books/book-list.ts`
- Create: `frontend/src/app/features/books/book-list.html`
- Create: `frontend/src/app/features/books/book-form.ts`
- Create: `frontend/src/app/features/books/book-form.html`
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `LocationsService.locations` (Task 8) for the location `<select>`.
- Produces: `BooksService.books: Signal<BookWithRanking[]>`, `.load()`, `.create(formData: FormData)` — this is the plan's final feature; nothing later depends on it.

- [ ] **Step 1: Write the failing test for BooksService**

Create `frontend/src/app/core/books.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BooksService } from './books.service';
import { environment } from '../../environments/environment';

describe('BooksService', () => {
  let service: BooksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BooksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads books with their ranking into the books signal', async () => {
    const loadPromise = service.load();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/books`);
    req.flush([{ id: 'book-1', title: 'Dune', ranking: { categoryRank: 1, categoryTotal: 1, overallRank: 1, overallTotal: 1 } }]);
    await loadPromise;

    expect(service.books()[0].title).toBe('Dune');
    expect(service.books()[0].ranking?.categoryRank).toBe(1);
  });

  it('posts form data to create a book and reloads the list', async () => {
    const formData = new FormData();
    formData.append('title', 'Dune');
    formData.append('author', 'Herbert');

    const createPromise = service.create(formData);
    const createReq = httpMock.expectOne(`${environment.apiBaseUrl}/books`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: 'book-1', title: 'Dune' });
    const reloadReq = httpMock.expectOne(`${environment.apiBaseUrl}/books`);
    reloadReq.flush([{ id: 'book-1', title: 'Dune', ranking: null }]);
    await createPromise;

    expect(service.books()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && ng test --watch=false`
Expected: FAIL — `Cannot find module './books.service'`

- [ ] **Step 3: Implement BooksService**

Create `frontend/src/app/core/books.service.ts`:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RankInfo {
  categoryRank: number;
  categoryTotal: number;
  overallRank: number;
  overallTotal: number;
}

export interface BookRow {
  id: string;
  title: string;
  author: string;
  category: string | null;
  language: string | null;
  description: string | null;
  myReview: string | null;
  myNote: number | null;
  recommend: boolean | null;
  coverImagePath: string | null;
  locationId: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  ranking: RankInfo | null;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/books`;

  readonly books = signal<BookRow[]>([]);

  async load(): Promise<void> {
    const result = await firstValueFrom(this.http.get<BookRow[]>(this.baseUrl));
    this.books.set(result);
  }

  async create(formData: FormData): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, formData));
    await this.load();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && ng test --watch=false`
Expected: PASS — both `BooksService` tests.

- [ ] **Step 5: Write the book list component**

Create `frontend/src/app/features/books/book-list.ts`:

```ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { BooksService } from '../../core/books.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatChipsModule],
  templateUrl: './book-list.html',
})
export class BookListComponent implements OnInit {
  protected readonly booksService = inject(BooksService);
  protected readonly apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    void this.booksService.load();
  }
}
```

Create `frontend/src/app/features/books/book-list.html`:

```html
<h1>My Books</h1>
<a mat-raised-button color="primary" routerLink="/books/new">Add book</a>

<div class="book-grid">
  @for (book of booksService.books(); track book.id) {
    <mat-card>
      @if (book.coverImagePath) {
        <img mat-card-image [src]="apiBaseUrl + '/uploads/' + book.coverImagePath" [alt]="book.title" />
      }
      <mat-card-content>
        <h3>{{ book.title }}</h3>
        <p>{{ book.author }}</p>
        @if (book.category) {
          <mat-chip>{{ book.category }}</mat-chip>
        }
        @if (book.myNote !== null) {
          <p>My note: {{ book.myNote }}/10</p>
        }
        @if (book.ranking; as ranking) {
          <p>
            🏆 Ranked #{{ ranking.categoryRank }} of {{ ranking.categoryTotal }} in {{ book.category }},
            #{{ ranking.overallRank }} of {{ ranking.overallTotal }} overall
          </p>
        }
        @if (book.recommend) {
          <p>👍 Recommended</p>
        }
      </mat-card-content>
    </mat-card>
  }
</div>
```

- [ ] **Step 6: Write the book form component**

Create `frontend/src/app/features/books/book-form.ts`:

```ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { BooksService } from '../../core/books.service';
import { LocationsService } from '../../core/locations.service';

@Component({
  selector: 'app-book-form',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './book-form.html',
})
export class BookFormComponent implements OnInit {
  private readonly booksService = inject(BooksService);
  protected readonly locationsService = inject(LocationsService);
  private readonly router = inject(Router);

  readonly title = signal('');
  readonly author = signal('');
  readonly category = signal('');
  readonly language = signal('');
  readonly description = signal('');
  readonly myReview = signal('');
  readonly myNote = signal<number | null>(null);
  readonly recommend = signal(false);
  readonly locationId = signal('');
  readonly purchaseDate = signal('');
  readonly purchasePrice = signal<number | null>(null);
  readonly photoFile = signal<File | null>(null);

  ngOnInit(): void {
    void this.locationsService.load();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoFile.set(input.files?.[0] ?? null);
  }

  async submit(): Promise<void> {
    const formData = new FormData();
    formData.append('title', this.title());
    formData.append('author', this.author());
    if (this.category()) formData.append('category', this.category());
    if (this.language()) formData.append('language', this.language());
    if (this.description()) formData.append('description', this.description());
    if (this.myReview()) formData.append('myReview', this.myReview());
    if (this.myNote() !== null) formData.append('myNote', String(this.myNote()));
    formData.append('recommend', String(this.recommend()));
    if (this.locationId()) formData.append('locationId', this.locationId());
    if (this.purchaseDate()) formData.append('purchaseDate', this.purchaseDate());
    if (this.purchasePrice() !== null) formData.append('purchasePrice', String(this.purchasePrice()));
    const photo = this.photoFile();
    if (photo) formData.append('photo', photo);

    await this.booksService.create(formData);
    this.router.navigateByUrl('/books');
  }
}
```

Create `frontend/src/app/features/books/book-form.html`:

```html
<form (ngSubmit)="submit()">
  <mat-form-field>
    <mat-label>Title</mat-label>
    <input matInput [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required />
  </mat-form-field>

  <mat-form-field>
    <mat-label>Author</mat-label>
    <input matInput [ngModel]="author()" (ngModelChange)="author.set($event)" name="author" required />
  </mat-form-field>

  <mat-form-field>
    <mat-label>Category</mat-label>
    <input matInput [ngModel]="category()" (ngModelChange)="category.set($event)" name="category" />
  </mat-form-field>

  <mat-form-field>
    <mat-label>Language</mat-label>
    <input matInput [ngModel]="language()" (ngModelChange)="language.set($event)" name="language" />
  </mat-form-field>

  <mat-form-field>
    <mat-label>Description</mat-label>
    <textarea matInput [ngModel]="description()" (ngModelChange)="description.set($event)" name="description"></textarea>
  </mat-form-field>

  <mat-form-field>
    <mat-label>My review</mat-label>
    <textarea matInput [ngModel]="myReview()" (ngModelChange)="myReview.set($event)" name="myReview"></textarea>
  </mat-form-field>

  <mat-form-field>
    <mat-label>My note (1-10)</mat-label>
    <input matInput type="number" min="1" max="10" [ngModel]="myNote()" (ngModelChange)="myNote.set($event)" name="myNote" />
  </mat-form-field>

  <mat-checkbox [ngModel]="recommend()" (ngModelChange)="recommend.set($event)" name="recommend">I recommend this book</mat-checkbox>

  <mat-form-field>
    <mat-label>Location</mat-label>
    <mat-select [ngModel]="locationId()" (ngModelChange)="locationId.set($event)" name="locationId">
      @for (location of locationsService.locations(); track location.id) {
        <mat-option [value]="location.id">{{ location.name }}</mat-option>
      }
    </mat-select>
  </mat-form-field>

  <mat-form-field>
    <mat-label>Purchase date</mat-label>
    <input matInput type="date" [ngModel]="purchaseDate()" (ngModelChange)="purchaseDate.set($event)" name="purchaseDate" />
  </mat-form-field>

  <mat-form-field>
    <mat-label>Purchase price</mat-label>
    <input matInput type="number" step="0.01" [ngModel]="purchasePrice()" (ngModelChange)="purchasePrice.set($event)" name="purchasePrice" />
  </mat-form-field>

  <input type="file" accept="image/*" (change)="onPhotoSelected($event)" />

  <button mat-raised-button color="primary" type="submit">Save book</button>
</form>
```

- [ ] **Step 7: Wire the routes**

Modify `frontend/src/app/app.routes.ts` — add:

```ts
{ path: 'books', component: BookListComponent },
{ path: 'books/new', component: BookFormComponent },
```

(with matching imports, and change the default redirect from `'login'` to `'books'` now that there's a real home page — keep `login` reachable at `/login`.)

- [ ] **Step 8: Run full test suite and verify build**

Run: `cd frontend && ng test --watch=false && ng build`
Expected: PASS, build succeeds.

- [ ] **Step 9: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add frontend
git commit -m "feat: add books feature (list with ranking display, add form)"
```

---

## Task 10: Docker Compose (local dev) + sample cover fixtures

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docs/sample-covers/README.md`

**Interfaces:**
- Produces: a fully running local stack (`docker compose up`) — Postgres on `5432`, backend on `3000`, frontend on `4200` (dev) — this is the plan's integration checkpoint; every prior task's automated tests already passed, this task verifies they all work together for real.

- [ ] **Step 1: Write the backend Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --config prisma7.config.ts
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=build /app/src/generated ./dist/generated
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && node dist/main.js"]
```

- [ ] **Step 2: Write the frontend Dockerfile**

Create `frontend/Dockerfile`:

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build

FROM node:24-alpine AS runtime
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist/frontend/browser ./browser
EXPOSE 4200
CMD ["http-server", "browser", "-p", "4200"]
```

- [ ] **Step 3: Write docker-compose.yml**

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: books
      POSTGRES_USER: books
      POSTGRES_PASSWORD: books
    ports:
      - '5432:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U books']
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://books:books@postgres:5432/books
      JWT_SECRET: dev-secret-change-me
      PORT: 3000
    ports:
      - '3000:3000'
    volumes:
      - uploads-data:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - '4200:4200'
    depends_on:
      - backend

volumes:
  postgres-data:
  uploads-data:
```

- [ ] **Step 4: Add the sample cover fixtures folder**

Create `docs/sample-covers/README.md`:

```markdown
# Sample cover images

Drop a handful of real book cover photos here (JPEG/PNG) to use for local
manual testing of the "Add book" flow, since live camera access isn't
available in this development environment. Pick them via the file input on
`/books/new` exactly as you would a live photo — the upload flow does not
distinguish between the two.
```

- [ ] **Step 5: Bring the whole stack up and verify end-to-end**

Run: `docker compose up --build`
Expected: all three services start; `postgres` becomes healthy; `backend` logs show the Prisma migration applying then `Nest application successfully started`; `frontend` serves on port 4200.

Manual verification:
1. `curl http://localhost:3000/health` → `{"status":"ok"}`
2. Open `http://localhost:4200/login`, register a new account, confirm redirect to `/books`.
3. Go to `/locations/new`, create a location named "Garage" with a photo from `docs/sample-covers/` and (if the browser grants permission) a captured geolocation. Confirm it appears in `/locations`.
4. Go to `/books/new`, add a book with a cover photo, category "Sci-Fi", myNote 9, assign it to "Garage". Confirm it appears in `/books` with no ranking shown yet (ranking needs ≥1 rated book in that category — it should show "#1 of 1").
5. Add a second book in the same category with a lower myNote, confirm both books' rankings update correctly.

- [ ] **Step 6: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add -A
git commit -m "feat: add Docker Compose for local dev, Dockerfiles, sample cover fixtures"
```

---

## Task 11: Production Docker Compose + Caddy config

**Files:**
- Create: `docker-compose.prod.yml`
- Create: `Caddyfile.snippet`
- Create: `README.md`

**Interfaces:**
- Produces: the deployment artifacts referenced by the spec's "Repository and Deployment" section — not applied to the VPS as part of this plan (the spec explicitly defers actual deployment to a later, explicit step).

- [ ] **Step 1: Write docker-compose.prod.yml**

Create `docker-compose.prod.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: books-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - web

  backend:
    build: ./backend
    container_name: books-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    volumes:
      - uploads-data:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - web

  frontend:
    build: ./frontend
    container_name: books-frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - web

volumes:
  postgres-data:
  uploads-data:

networks:
  web:
    external: true
```

- [ ] **Step 2: Write the Caddy reverse-proxy snippet**

Create `Caddyfile.snippet` (to be merged into the shared VPS proxy's `Caddyfile` per `07-my_server_infact_anacottest/VPS-OPERATIONS.md` — not applied automatically by this plan):

```
books.sn8w.com {
    reverse_proxy books-frontend:4200
}
books-api.sn8w.com {
    reverse_proxy books-backend:3000
}
```

- [ ] **Step 3: Write the project README**

Create `README.md`:

```markdown
# Books — Personal Library Manager

Self-hosted personal book cataloging app. See
`docs/superpowers/specs/2026-09-13-books-library-design.md` for the full
design and `docs/superpowers/plans/2026-09-13-books-library-v1.md` for the
implementation plan.

## Local development

\`\`\`bash
docker compose up --build
\`\`\`

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Sample cover images for manual testing: `docs/sample-covers/`

## Deployment

Not yet deployed. When ready, follow
`07-my_server_infact_anacottest/VPS-OPERATIONS.md`'s shared-VPS-Caddy
runbook: build with `docker-compose.prod.yml`, join the external `web`
network, merge `Caddyfile.snippet` into the shared proxy's Caddyfile, then
`docker compose exec caddy caddy reload`.

## v2 (not built yet)

AI-vision cover recognition and book-API metadata enrichment — see the
spec's "Goals (v2)" section. Deferred until v1 is in daily use and the API
cost is worth it.
```

- [ ] **Step 4: Commit**

```bash
cd C:/dev/dev-projects/21-books
git add -A
git commit -m "docs: add production Docker Compose, Caddy snippet, and project README"
```
