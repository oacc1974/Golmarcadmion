import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MetaData } from '../../../../libs/shared/interfaces';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, unique: true })
  loyverse_id: string;

  @Prop()
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  barcode: string;

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  price: MongooseSchema.Types.Decimal128;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  cost: MongooseSchema.Types.Decimal128;

  @Prop({ default: false })
  track_stock: boolean;

  @Prop()
  unit: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Create indices
ItemSchema.index({ loyverse_id: 1 }, { unique: true });
ItemSchema.index({ category: 1 });
ItemSchema.index({ sku: 1 }, { sparse: true });
// Optional text index for search
ItemSchema.index({ '$**': 'text' });
