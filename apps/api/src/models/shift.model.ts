import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MetaData } from '../../../../libs/shared/interfaces';

export type ShiftDocument = Shift & Document;

@Schema({ timestamps: true })
export class Shift {
  @Prop({ unique: true, sparse: true })
  loyverse_id: string;

  @Prop({ required: true })
  store_id: string;

  @Prop({ required: true, type: Date })
  opened_at: Date;

  @Prop({ required: true, type: Date })
  closed_at: Date;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  opening_cash: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  cash_sales: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  card_sales: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  other_sales: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  expected_cash: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  counted_cash: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  cash_difference: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  pay_in_total: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  pay_out_total: MongooseSchema.Types.Decimal128;

  @Prop()
  notes: string;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);

// Create indices
ShiftSchema.index({ store_id: 1, closed_at: -1 });
ShiftSchema.index({ loyverse_id: 1 }, { unique: true, sparse: true });
