import { Module } from '@nestjs/common';
import { DemoResetService } from './demo-reset.service.js';

@Module({
  providers: [DemoResetService],
  exports: [DemoResetService],
})
export class DemoModule {}
