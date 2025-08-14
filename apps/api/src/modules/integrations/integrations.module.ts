import { Module } from '@nestjs/common';
import { LoyverseModule } from './loyverse/loyverse.module';

@Module({
  imports: [LoyverseModule],
  exports: [LoyverseModule],
})
export class IntegrationsModule {}
