import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MetaData } from '../../../../libs/shared/interfaces';
import { Item } from './item.model';

export type InventoryMovementDocument = InventoryMovement & Document;

@Schema({ timestamps: true })
export class InventoryMovement {
  @Prop({ unique: true, sparse: true })
  loyverse_id: string;

  @Prop({ required: true })
  store_id: string;

  @Prop({ required: true })
  item_loyverse_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Item' })
  item_id: Item;

  @Prop({ 
    required: true, 
    enum: ['adjustment', 'waste', 'transfer_in', 'transfer_out', 'sale', 'purchase'] 
  })
  type: string;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  quantity: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  cost: MongooseSchema.Types.Decimal128;

  @Prop()
  reason: string;

  @Prop()
  doc_ref: string;

  @Prop({ required: true, type: Date })
  occurred_at: Date;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);

// Create indices
InventoryMovementSchema.index({ store_id: 1, occurred_at: -1 });
InventoryMovementSchema.index({ item_loyverse_id: 1, occurred_at: -1 });
InventoryMovementSchema.index({ type: 1, occurred_at: -1 });
