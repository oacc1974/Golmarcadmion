import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { WebhookEvent, WebhookEventDocument } from '../../../models/webhook-event.model';
import { Store, StoreDocument } from '../../../models/store.model';
import { Employee, EmployeeDocument } from '../../../models/employee.model';
import { Item, ItemDocument } from '../../../models/item.model';
import { Receipt, ReceiptDocument } from '../../../models/receipt.model';
import { Shift, ShiftDocument } from '../../../models/shift.model';
import { InventoryMovement, InventoryMovementDocument } from '../../../models/inventory-movement.model';
import { PurchaseOrder, PurchaseOrderDocument } from '../../../models/purchase-order.model';
import { Supplier, SupplierDocument } from '../../../models/supplier.model';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { SyncRangeDto } from './dto/sync-range.dto';

@Injectable()
export class LoyverseService {
  private readonly logger = new Logger(LoyverseService.name);
  private readonly apiUrl = 'https://api.loyverse.com/v1.0';
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(WebhookEvent.name) private webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    @InjectModel(InventoryMovement.name) private inventoryMovementModel: Model<InventoryMovementDocument>,
    @InjectModel(PurchaseOrder.name) private purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {
    this.apiKey = this.configService.get<string>('LOYVERSE_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('LOYVERSE_API_KEY not set in environment variables');
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createWebhook(createWebhookDto: CreateWebhookDto) {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(
          `${this.apiUrl}/webhooks`,
          createWebhookDto,
          { headers: this.getHeaders() }
        )
      );
      return data;
    } catch (error) {
      this.logger.error(`Error creating webhook: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create webhook: ${error.message}`);
    }
  }

  async listWebhooks() {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get(
          `${this.apiUrl}/webhooks`,
          { headers: this.getHeaders() }
        )
      );
      return data;
    } catch (error) {
      this.logger.error(`Error listing webhooks: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to list webhooks: ${error.message}`);
    }
  }

  async deleteWebhook(webhookId: string) {
    try {
      const { data } = await lastValueFrom(
        this.httpService.delete(
          `${this.apiUrl}/webhooks/${webhookId}`,
          { headers: this.getHeaders() }
        )
      );
      return { success: true, message: 'Webhook deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting webhook: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete webhook: ${error.message}`);
    }
  }

  async handleWebhookEvent(payload: WebhookPayloadDto, headers?: any) {
    try {
      // Verify webhook signature if webhook secret is set
      const webhookSecret = this.configService.get<string>('LOYVERSE_WEBHOOK_SECRET');
      if (webhookSecret && headers && headers['x-loyverse-signature']) {
        const isValid = this.verifyWebhookSignature(headers['x-loyverse-signature'], webhookSecret, JSON.stringify(payload));
        if (!isValid) {
          this.logger.warn('Invalid webhook signature received');
          throw new BadRequestException('Invalid webhook signature');
        }
      }
      
      // Check if this event was already processed (idempotency)
      const existingEvent = await this.webhookEventModel.findOne({ event_id: payload.id });
      if (existingEvent && existingEvent.status === 'processed') {
        return { success: true, message: 'Webhook already processed', idempotent: true };
      }
      
      // Create or update webhook event record
      const webhookEvent = await this.webhookEventModel.findOneAndUpdate(
        { event_id: payload.id },
        {
          event_id: payload.id,
          event_type: payload.type,
          payload,
          status: 'pending',
          meta: {
            source: 'loyverse',
            synced_at: new Date(),
            last_modified_at: new Date(),
            schema_version: 1,
          },
        },
        { upsert: true, new: true }
      );
      
      // Process the webhook based on event type
      let processingResult;
      switch (payload.type) {
        case 'receipt.created':
        case 'receipt.updated':
          processingResult = await this.processReceiptEvent(payload);
          break;
        case 'shift.created':
        case 'shift.updated':
          processingResult = await this.processShiftEvent(payload);
          break;
        case 'inventory.updated':
          processingResult = await this.processInventoryEvent(payload);
          break;
        case 'item.created':
        case 'item.updated':
          processingResult = await this.processItemEvent(payload);
          break;
        case 'employee.created':
        case 'employee.updated':
          processingResult = await this.processEmployeeEvent(payload);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${payload.type}`);
          processingResult = { processed: false, reason: 'Unhandled event type' };
      }
      
      // Update webhook event status
      await this.webhookEventModel.findOneAndUpdate(
        { event_id: payload.id },
        { 
          status: processingResult?.processed !== false ? 'processed' : 'skipped',
          processing_details: processingResult,
          processed_at: new Date()
        }
      );
      
      return { 
        success: true, 
        message: 'Webhook processed successfully',
        details: processingResult
      };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      
      // Update webhook event status to failed
      await this.webhookEventModel.findOneAndUpdate(
        { event_id: payload.id },
        { 
          status: 'failed', 
          error: error.message,
          error_stack: error.stack,
          failed_at: new Date()
        }
      );
      
      throw new BadRequestException(`Failed to process webhook: ${error.message}`);
    }
  }
  
  private verifyWebhookSignature(signature: string, secret: string, payload: string): boolean {
    try {
      const hmac = crypto.createHmac('sha256', secret);
      const calculatedSignature = hmac.update(payload).digest('hex');
      return signature === calculatedSignature;
    } catch (error) {
      this.logger.error(`Error verifying webhook signature: ${error.message}`, error.stack);
      return false;
    }
  }

  private async processReceiptEvent(payload: any) {
    const receiptData = payload.data;
    
    // Transform receipt data to match our schema
    const receipt = {
      loyverse_id: receiptData.id,
      store_id: receiptData.store_id,
      number: receiptData.receipt_number,
      status: receiptData.receipt_status,
      created_at: new Date(receiptData.created_at),
      closed_at: new Date(receiptData.closed_at),
      employee_id: receiptData.employee_id,
      employee_name: receiptData.employee_name,
      customer_id: receiptData.customer_id,
      customer_name: receiptData.customer_name,
      subtotal: receiptData.subtotal,
      discount_total: receiptData.total_discounts,
      tax_total: receiptData.total_taxes,
      total: receiptData.total,
      payments: receiptData.payments.map(p => ({
        method: p.type,
        amount: p.amount,
      })),
      line_items: receiptData.line_items.map(item => ({
        item_loyverse_id: item.item_id,
        name: item.item_name,
        category: item.category_name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        total: item.total,
      })),
      shift_id: receiptData.shift_id,
      meta: {
        source: 'loyverse',
        synced_at: new Date(),
        last_modified_at: new Date(receiptData.updated_at || receiptData.closed_at),
        schema_version: 1,
      },
    };
    
    // Upsert receipt
    await this.receiptModel.findOneAndUpdate(
      { loyverse_id: receipt.loyverse_id },
      receipt,
      { upsert: true, new: true }
    );
  }

  private async processShiftEvent(payload: any) {
    const shiftData = payload.data;
    
    try {
      // Transform shift data
      const shift = {
        loyverse_id: shiftData.id,
        store_id: shiftData.store_id,
        opened_at: new Date(shiftData.opened_at),
        closed_at: shiftData.closed_at ? new Date(shiftData.closed_at) : null,
        opening_note: shiftData.opening_note,
        closing_note: shiftData.closing_note,
        opening_employee_id: shiftData.opening_employee_id,
        closing_employee_id: shiftData.closing_employee_id,
        opening_cash: shiftData.opening_amount,
        closing_cash: shiftData.closing_amount,
        expected_cash: shiftData.expected_amount,
        difference: shiftData.difference,
        status: shiftData.closed_at ? 'closed' : 'open',
        meta: {
          source: 'loyverse',
          synced_at: new Date(),
          last_modified_at: new Date(shiftData.updated_at || shiftData.opened_at),
          schema_version: 1,
        },
      };
      
      // Upsert shift
      await this.shiftModel.findOneAndUpdate(
        { loyverse_id: shift.loyverse_id },
        shift,
        { upsert: true, new: true }
      );
      
      return { processed: true, entity: 'shift' };
    } catch (error) {
      this.logger.error(`Error processing shift event: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process shift event: ${error.message}`);
    }
  }



  async syncStores() {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get(
          `${this.apiUrl}/stores`,
          { headers: this.getHeaders() }
        )
      );
      
      const stores = data.stores;
      let upsertCount = 0;
      
      for (const storeData of stores) {
        const store = {
          loyverse_id: storeData.id,
          name: storeData.name,
          address: {
            address_line_1: storeData.address?.address_line_1 || '',
            address_line_2: storeData.address?.address_line_2 || '',
            city: storeData.address?.city || '',
            state: storeData.address?.state || '',
            postal_code: storeData.address?.postal_code || '',
            country: storeData.address?.country || '',
          },
          meta: {
            source: 'loyverse',
            synced_at: new Date(),
            last_modified_at: new Date(),
            schema_version: 1,
          },
        };
        
        await this.storeModel.findOneAndUpdate(
          { loyverse_id: store.loyverse_id },
          store,
          { upsert: true, new: true }
        );
        
        upsertCount++;
      }
      
      return { success: true, message: `Synced ${upsertCount} stores` };
    } catch (error) {
      this.logger.error(`Error syncing stores: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to sync stores: ${error.message}`);
    }
  }

  async syncEmployees() {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get(
          `${this.apiUrl}/employees`,
          { headers: this.getHeaders() }
        )
      );
      
      const employees = data.employees;
      let upsertCount = 0;
      
      for (const employeeData of employees) {
        const employee = {
          loyverse_id: employeeData.id,
          name: employeeData.name,
          email: employeeData.email,
          pin_code: employeeData.pin_code,
          role: employeeData.role,
          store_ids: employeeData.stores.map(s => s.store_id),
          meta: {
            source: 'loyverse',
            synced_at: new Date(),
            last_modified_at: new Date(),
            schema_version: 1,
          },
        };
        
        await this.employeeModel.findOneAndUpdate(
          { loyverse_id: employee.loyverse_id },
          employee,
          { upsert: true, new: true }
        );
        
        upsertCount++;
      }
      
      return { success: true, message: `Synced ${upsertCount} employees` };
    } catch (error) {
      this.logger.error(`Error syncing employees: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to sync employees: ${error.message}`);
    }
  }

  async syncItems() {
    try {
      let cursor = null;
      let allItems = [];
      let hasMore = true;
      
      // Paginate through all items
      while (hasMore) {
        const url = cursor 
          ? `${this.apiUrl}/items?cursor=${cursor}`
          : `${this.apiUrl}/items`;
          
        const { data } = await lastValueFrom(
          this.httpService.get(url, { headers: this.getHeaders() })
        );
        
        allItems = [...allItems, ...data.items];
        cursor = data.cursor;
        hasMore = !!cursor;
      }
      
      let upsertCount = 0;
      
      for (const itemData of allItems) {
        const item = {
          loyverse_id: itemData.id,
          name: itemData.item_name,
          sku: itemData.sku,
          reference_id: itemData.reference_id,
          category: itemData.category_name,
          price: itemData.default_price,
          cost: itemData.cost,
          barcode: itemData.barcode,
          track_stock: itemData.track_stock,
          sold_by_weight: itemData.sold_by_weight,
          meta: {
            source: 'loyverse',
            synced_at: new Date(),
            last_modified_at: new Date(),
            schema_version: 1,
          },
        };
        
        await this.itemModel.findOneAndUpdate(
          { loyverse_id: item.loyverse_id },
          item,
          { upsert: true, new: true }
        );
        
        upsertCount++;
      }
      
      return { success: true, message: `Synced ${upsertCount} items` };
    } catch (error) {
      this.logger.error(`Error syncing items: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to sync items: ${error.message}`);
    }
  }

  async syncReceipts(syncRangeDto: SyncRangeDto) {
    try {
      const { startDate, endDate, storeId } = syncRangeDto;
      
      // Format dates for Loyverse API (ISO format)
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      
      // Create base URL with date filters
      let baseUrl = `${this.apiUrl}/receipts?created_at_min=${formattedStartDate}&created_at_max=${formattedEndDate}`;
      
      // Add store filter if provided
      if (storeId) {
        baseUrl += `&store_id=${storeId}`;
      }
      
      let cursor = null;
      let allReceipts = [];
      let hasMore = true;
      let totalCount = 0;
      
      // Paginate through all receipts in the date range
      while (hasMore) {
        const url = cursor 
          ? `${baseUrl}&cursor=${cursor}`
          : baseUrl;
          
        try {
          const { data } = await lastValueFrom(
            this.httpService.get(url, { headers: this.getHeaders() })
          );
          
          allReceipts = [...allReceipts, ...data.receipts];
          cursor = data.cursor;
          hasMore = !!cursor;
          totalCount += data.receipts.length;
          
          // Process in batches to avoid memory issues
          if (allReceipts.length >= 100 || !hasMore) {
            await this.processReceiptBatch(allReceipts);
            allReceipts = [];
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          this.logger.error(`Error fetching receipts batch: ${error.message}`, error.stack);
          throw new InternalServerErrorException(`Failed to fetch receipts batch: ${error.message}`);
        }
      }
      
      return { 
        success: true, 
        message: `Synced ${totalCount} receipts from ${startDate} to ${endDate}${storeId ? ` for store ${storeId}` : ''}` 
      };
    } catch (error) {
      this.logger.error(`Error syncing receipts: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to sync receipts: ${error.message}`);
    }
  }
  
  private async processReceiptBatch(receipts: any[]) {
    let processedCount = 0;
    
    for (const receiptData of receipts) {
      try {
        // Transform receipt data to match our schema
        const receipt = {
          loyverse_id: receiptData.id,
          store_id: receiptData.store_id,
          number: receiptData.receipt_number,
          status: receiptData.receipt_status,
          created_at: new Date(receiptData.created_at),
          closed_at: receiptData.closed_at ? new Date(receiptData.closed_at) : null,
          employee_id: receiptData.employee_id,
          employee_name: receiptData.employee_name,
          customer_id: receiptData.customer_id,
          customer_name: receiptData.customer_name,
          subtotal: receiptData.subtotal,
          discount_total: receiptData.total_discounts,
          tax_total: receiptData.total_taxes,
          total: receiptData.total,
          payments: receiptData.payments?.map(p => ({
            method: p.type,
            amount: p.amount,
          })) || [],
          line_items: receiptData.line_items?.map(item => ({
            item_loyverse_id: item.item_id,
            name: item.item_name,
            category: item.category_name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            tax: item.tax,
            total: item.total,
          })) || [],
          shift_id: receiptData.shift_id,
          meta: {
            source: 'loyverse',
            synced_at: new Date(),
            last_modified_at: new Date(receiptData.updated_at || receiptData.created_at),
            schema_version: 1,
          },
        };
        
        // Upsert receipt
        await this.receiptModel.findOneAndUpdate(
          { loyverse_id: receipt.loyverse_id },
          receipt,
          { upsert: true, new: true }
        );
        
        processedCount++;
      } catch (error) {
        this.logger.error(`Error processing receipt ${receiptData.id}: ${error.message}`, error.stack);
        // Continue processing other receipts even if one fails
      }
    }
    
    return processedCount;
  }

  private async processInventoryEvent(payload: any) {
    const inventoryData = payload.data;
    
    try {
      // Transform inventory data
      const inventoryMovement = {
        loyverse_id: inventoryData.id,
        store_id: inventoryData.store_id,
        item_id: inventoryData.item_id,
        type: inventoryData.type || 'adjustment',
        quantity: inventoryData.quantity,
        cost: inventoryData.cost,
        created_at: new Date(inventoryData.created_at),
        notes: inventoryData.notes || '',
        meta: {
          source: 'loyverse',
          synced_at: new Date(),
          last_modified_at: new Date(inventoryData.updated_at || inventoryData.created_at),
          schema_version: 1,
        },
      };
      
      // Upsert inventory movement
      await this.inventoryMovementModel.findOneAndUpdate(
        { loyverse_id: inventoryMovement.loyverse_id },
        inventoryMovement,
        { upsert: true, new: true }
      );
      
      return { processed: true, entity: 'inventory_movement' };
    } catch (error) {
      this.logger.error(`Error processing inventory event: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process inventory event: ${error.message}`);
    }
  }

  private async processItemEvent(payload: any) {
    const itemData = payload.data;
    
    try {
      // Transform item data
      const item = {
        loyverse_id: itemData.id,
        name: itemData.name,
        reference_id: itemData.reference_id,
        category_id: itemData.category_id,
        price: itemData.price,
        cost: itemData.cost,
        stock_quantity: itemData.stock_quantity,
        option_groups: itemData.option_groups || [],
        variants: itemData.variants || [],
        taxes: itemData.taxes || [],
        modifiers: itemData.modifiers || [],
        created_at: new Date(itemData.created_at),
        meta: {
          source: 'loyverse',
          synced_at: new Date(),
          last_modified_at: new Date(itemData.updated_at || itemData.created_at),
          schema_version: 1,
        },
      };
      
      // Upsert item
      await this.itemModel.findOneAndUpdate(
        { loyverse_id: item.loyverse_id },
        item,
        { upsert: true, new: true }
      );
      
      return { processed: true, entity: 'item' };
    } catch (error) {
      this.logger.error(`Error processing item event: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process item event: ${error.message}`);
    }
  }

  private async processEmployeeEvent(payload: any) {
    const employeeData = payload.data;
    
    try {
      // Transform employee data
      const employee = {
        loyverse_id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email,
        pin_code: employeeData.pin_code,
        role: employeeData.role,
        stores: employeeData.stores || [],
        created_at: new Date(employeeData.created_at),
        meta: {
          source: 'loyverse',
          synced_at: new Date(),
          last_modified_at: new Date(employeeData.updated_at || employeeData.created_at),
          schema_version: 1,
        },
      };
      
      // Upsert employee
      await this.employeeModel.findOneAndUpdate(
        { loyverse_id: employee.loyverse_id },
        employee,
        { upsert: true, new: true }
      );
      
      return { processed: true, entity: 'employee' };
    } catch (error) {
      this.logger.error(`Error processing employee event: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process employee event: ${error.message}`);
    }
  }

  async syncShifts(syncRangeDto: SyncRangeDto) {
    try {
      const { startDate, endDate, storeId } = syncRangeDto;
      
      // Format dates for Loyverse API (ISO format)
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      
      // Create base URL with date filters
      let baseUrl = `${this.apiUrl}/shifts?opened_at_min=${formattedStartDate}&opened_at_max=${formattedEndDate}`;
      
      // Add store filter if provided
      if (storeId) {
        baseUrl += `&store_id=${storeId}`;
      }
      
      let cursor = null;
      let allShifts = [];
      let hasMore = true;
      let totalCount = 0;
      
      // Paginate through all shifts in the date range
      while (hasMore) {
        const url = cursor 
          ? `${baseUrl}&cursor=${cursor}`
          : baseUrl;
          
        try {
          const { data } = await lastValueFrom(
            this.httpService.get(url, { headers: this.getHeaders() })
          );
          
          allShifts = [...allShifts, ...data.shifts];
          cursor = data.cursor;
          hasMore = !!cursor;
          totalCount += data.shifts.length;
          
          // Process in batches to avoid memory issues
          if (allShifts.length >= 50 || !hasMore) {
            await this.processShiftBatch(allShifts);
            allShifts = [];
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          this.logger.error(`Error fetching shifts batch: ${error.message}`, error.stack);
          throw new InternalServerErrorException(`Failed to fetch shifts batch: ${error.message}`);
        }
      }
      
      return { 
        success: true, 
        message: `Synced ${totalCount} shifts from ${startDate} to ${endDate}${storeId ? ` for store ${storeId}` : ''}` 
      };
    } catch (error) {
      this.logger.error(`Error syncing shifts: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to sync shifts: ${error.message}`);
    }
  }
  
  private async processShiftBatch(shifts: any[]) {
    let processedCount = 0;
    
    for (const shiftData of shifts) {
      try {
        // Transform shift data to match our schema
        const shift = {
          loyverse_id: shiftData.id,
          store_id: shiftData.store_id,
          opened_at: new Date(shiftData.opened_at),
          closed_at: shiftData.closed_at ? new Date(shiftData.closed_at) : null,
          opening_note: shiftData.opening_note,
          closing_note: shiftData.closing_note,
          opening_employee_id: shiftData.opening_employee_id,
          closing_employee_id: shiftData.closing_employee_id,
          opening_cash: shiftData.opening_amount,
          closing_cash: shiftData.closing_amount,
          expected_cash: shiftData.expected_amount,
          difference: shiftData.difference,
          status: shiftData.closed_at ? 'closed' : 'open',
          meta: {
            source: 'loyverse',
            synced_at: new Date(),
            last_modified_at: new Date(shiftData.updated_at || shiftData.opened_at),
            schema_version: 1,
          },
        };
        
        // Upsert shift
        await this.shiftModel.findOneAndUpdate(
          { loyverse_id: shift.loyverse_id },
          shift,
          { upsert: true, new: true }
        );
        
        processedCount++;
      } catch (error) {
        this.logger.error(`Error processing shift ${shiftData.id}: ${error.message}`, error.stack);
        // Continue processing other shifts even if one fails
      }
    }
    
    return processedCount;
  }


}
