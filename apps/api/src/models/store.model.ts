import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetaData, Address } from '../../../../libs/shared/interfaces';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true, unique: true })
  loyverse_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  timezone: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Object })
  address: Address;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const StoreSchema = SchemaFactory.createForClass(Store);

// Create index on loyverse_id
StoreSchema.index({ loyverse_id: 1 }, { unique: true });
