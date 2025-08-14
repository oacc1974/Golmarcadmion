import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../../../libs/shared/interfaces';

@ApiTags('shifts')
@Controller('shifts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get all shifts with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Return all shifts' })
  findAll(@Query() query: QueryShiftDto) {
    return this.shiftsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiResponse({ status: 200, description: 'Return shift by ID' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Get('loyverse/:loyverseId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get shift by Loyverse ID' })
  @ApiResponse({ status: 200, description: 'Return shift by Loyverse ID' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  findByLoyverseId(@Param('loyverseId') loyverseId: string) {
    return this.shiftsService.findByLoyverseId(loyverseId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update shift by ID' })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete shift by ID' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }

  @Post(':id/recalculate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Recalculate shift totals based on receipts' })
  @ApiResponse({ status: 200, description: 'Shift totals recalculated successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  recalculateShiftTotals(@Param('id') id: string) {
    return this.shiftsService.recalculateShiftTotals(id);
  }

  @Get('reports/summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get shift summary by store and date range' })
  @ApiResponse({ status: 200, description: 'Return shift summary' })
  getShiftSummary(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.shiftsService.getShiftSummary(
      storeId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
