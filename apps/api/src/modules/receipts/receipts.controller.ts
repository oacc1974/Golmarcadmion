import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { QueryReceiptDto } from './dto/query-receipt.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../../../libs/shared/interfaces';

@ApiTags('receipts')
@Controller('receipts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new receipt' })
  @ApiResponse({ status: 201, description: 'Receipt created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(@Body() createReceiptDto: CreateReceiptDto) {
    return this.receiptsService.create(createReceiptDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get all receipts with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Return all receipts' })
  findAll(@Query() query: QueryReceiptDto) {
    return this.receiptsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get receipt by ID' })
  @ApiResponse({ status: 200, description: 'Return receipt by ID' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Get('loyverse/:loyverseId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get receipt by Loyverse ID' })
  @ApiResponse({ status: 200, description: 'Return receipt by Loyverse ID' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  findByLoyverseId(@Param('loyverseId') loyverseId: string) {
    return this.receiptsService.findByLoyverseId(loyverseId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update receipt by ID' })
  @ApiResponse({ status: 200, description: 'Receipt updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  update(@Param('id') id: string, @Body() updateReceiptDto: UpdateReceiptDto) {
    return this.receiptsService.update(id, updateReceiptDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete receipt by ID' })
  @ApiResponse({ status: 200, description: 'Receipt deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  remove(@Param('id') id: string) {
    return this.receiptsService.remove(id);
  }

  @Get('reports/totals-by-date')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get daily sales totals by date range' })
  @ApiResponse({ status: 200, description: 'Return daily sales totals' })
  getTotalsByDateRange(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.receiptsService.getTotalsByDateRange(
      storeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('reports/totals-by-payment')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get sales totals by payment method and date range' })
  @ApiResponse({ status: 200, description: 'Return sales totals by payment method' })
  getTotalsByPaymentMethod(
    @Query('storeId') storeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.receiptsService.getTotalsByPaymentMethod(
      storeId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
