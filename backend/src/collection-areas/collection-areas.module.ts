import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CollectionAreasController } from './collection-areas.controller.js';
import { CollectionAreasService } from './collection-areas.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CollectionAreasController],
  providers: [CollectionAreasService],
})
export class CollectionAreasModule {}
