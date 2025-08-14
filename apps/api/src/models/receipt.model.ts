import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MetaData, Payment, LineItem } from '../../../../libs/shared/interfaces';
import { Employee } from './employee.model';

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ required: true, unique: true })
  loyverse_id: string;

  @Prop({ required: true })
  store_id: string;

  @Prop({ required: true })
  number: string;

  @Prop({ required: true, enum: ['closed', 'refunded', 'void'] })
  status: string;

  @Prop({ required: true, type: Date })
  created_at: Date;

  @Prop({ required: true, type: Date })
  closed_at: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee' })
  employee_id: Employee;

  @Prop()
  employee_name: string;

  @Prop()
  customer_id: string;

  @Prop()
  customer_name: string;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  subtotal: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  discount_total: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  tax_total: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  total: MongooseSchema.Types.Decimal128;

  @Prop({ type: [Object], required: true })
  payments: Payment[];

  @Prop({ type: [Object], required: true })
  line_items: LineItem[];

  @Prop()
  shift_id: string;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

// Create indices
ReceiptSchema.index({ loyverse_id: 1 }, { unique: true });
ReceiptSchema.index({ store_id: 1, closed_at: -1 });
ReceiptSchema.index({ employee_id: 1, closed_at: -1 });
ReceiptSchema.index({ total: -1 });
