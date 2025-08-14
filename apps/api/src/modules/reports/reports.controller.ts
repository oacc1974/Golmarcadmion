import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../../../libs/shared/interfaces';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get sales summary report by store and date range' })
  @ApiResponse({ status: 200, description: 'Return sales summary report' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  getSalesSummary(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesSummary(storeId, startDate, endDate);
  }

  @Get('shifts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get shift summary report by store and date range' })
  @ApiResponse({ status: 200, description: 'Return shift summary report' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  getShiftSummary(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getShiftSummary(storeId, startDate, endDate);
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get dashboard summary for a store' })
  @ApiResponse({ status: 200, description: 'Return dashboard summary' })
  @ApiQuery({ name: 'storeId', required: true, type: String })
  getDashboardSummary(@Query('storeId') storeId: string) {
    return this.reportsService.getDashboardSummary(storeId);
  }
}
