import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReceiptsModule } from '../receipts/receipts.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [ReceiptsModule, ShiftsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
