import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { LoyverseService } from './loyverse.service';
import { LoyverseController } from './loyverse.controller';
import { WebhookEvent, WebhookEventSchema } from '../../../models/webhook-event.model';
import { Store, StoreSchema } from '../../../models/store.model';
import { Employee, EmployeeSchema } from '../../../models/employee.model';
import { Item, ItemSchema } from '../../../models/item.model';
import { Receipt, ReceiptSchema } from '../../../models/receipt.model';
import { Shift, ShiftSchema } from '../../../models/shift.model';
import { InventoryMovement, InventoryMovementSchema } from '../../../models/inventory-movement.model';
import { PurchaseOrder, PurchaseOrderSchema } from '../../../models/purchase-order.model';
import { Supplier, SupplierSchema } from '../../../models/supplier.model';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [LoyverseController],
  providers: [LoyverseService],
  exports: [LoyverseService],
})
export class LoyverseModule {}
