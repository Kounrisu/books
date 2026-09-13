import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { BooksModule } from './books/books.module.js';
import { AdminModule } from './admin/admin.module.js';
import { TimelineModule } from './timeline/timeline.module.js';
import { CollectionAreasModule } from './collection-areas/collection-areas.module.js';
import { SettingsModule } from './settings/settings.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LocationsModule,
    BooksModule,
    AdminModule,
    TimelineModule,
    CollectionAreasModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
