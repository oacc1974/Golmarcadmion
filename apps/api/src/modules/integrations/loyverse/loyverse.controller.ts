import { Controller, Get, Post, Body, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoyverseService } from './loyverse.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { SyncRangeDto } from './dto/sync-range.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../../../libs/shared/interfaces';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('integrations/loyverse')
@Controller('integrations/loyverse')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LoyverseController {
  constructor(private readonly loyverseService: LoyverseService) {}

  @Post('webhooks')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new Loyverse webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  createWebhook(@Body() createWebhookDto: CreateWebhookDto) {
    return this.loyverseService.createWebhook(createWebhookDto);
  }

  @Get('webhooks')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all Loyverse webhooks' })
  @ApiResponse({ status: 200, description: 'Return all webhooks' })
  listWebhooks() {
    return this.loyverseService.listWebhooks();
  }

  @Delete('webhooks/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a Loyverse webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  deleteWebhook(@Param('id') id: string) {
    return this.loyverseService.deleteWebhook(id);
  }

  @Post('webhook-events')
  @Public()
  @ApiOperation({ summary: 'Receive webhook events from Loyverse' })
  @ApiResponse({ status: 200, description: 'Webhook event processed successfully' })
  handleWebhookEvent(@Body() payload: WebhookPayloadDto) {
    return this.loyverseService.handleWebhookEvent(payload);
  }

  @Post('sync/stores')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync stores from Loyverse' })
  @ApiResponse({ status: 200, description: 'Stores synced successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  syncStores() {
    return this.loyverseService.syncStores();
  }

  @Post('sync/employees')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync employees from Loyverse' })
  @ApiResponse({ status: 200, description: 'Employees synced successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  syncEmployees() {
    return this.loyverseService.syncEmployees();
  }

  @Post('sync/items')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync items from Loyverse' })
  @ApiResponse({ status: 200, description: 'Items synced successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  syncItems() {
    return this.loyverseService.syncItems();
  }

  @Post('sync/receipts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync receipts from Loyverse by date range' })
  @ApiResponse({ status: 200, description: 'Receipts synced successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  syncReceipts(@Body() syncRangeDto: SyncRangeDto) {
    return this.loyverseService.syncReceipts(syncRangeDto);
  }

  @Post('sync/shifts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync shifts from Loyverse by date range' })
  @ApiResponse({ status: 200, description: 'Shifts synced successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  syncShifts(@Body() syncRangeDto: SyncRangeDto) {
    return this.loyverseService.syncShifts(syncRangeDto);
  }
}
