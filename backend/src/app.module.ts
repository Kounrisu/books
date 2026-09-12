import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LocationsModule } from './locations/locations.module.js';

@Module({
  imports: [PrismaModule, AuthModule, LocationsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
