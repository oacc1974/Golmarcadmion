import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MetaData, PurchaseOrderLine } from '../../../../libs/shared/interfaces';

export type PurchaseOrderDocument = PurchaseOrder & Document;

@Schema({ timestamps: true })
export class PurchaseOrder {
  @Prop({ required: true, unique: true })
  loyverse_id: string;

  @Prop({ required: true })
  supplier_loyverse_id: string;

  @Prop({ required: true })
  store_id: string;

  @Prop({ 
    required: true, 
    enum: ['open', 'received', 'partial', 'cancelled'] 
  })
  status: string;

  @Prop({ required: true, type: Date })
  ordered_at: Date;

  @Prop({ type: Date })
  received_at: Date;

  @Prop({ type: [Object], required: true })
  lines: PurchaseOrderLine[];

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  subtotal: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  tax_total: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  total: MongooseSchema.Types.Decimal128;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);

// Create indices
PurchaseOrderSchema.index({ loyverse_id: 1 }, { unique: true });
PurchaseOrderSchema.index({ store_id: 1, ordered_at: -1 });
PurchaseOrderSchema.index({ supplier_loyverse_id: 1, ordered_at: -1 });
