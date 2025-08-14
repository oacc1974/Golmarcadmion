import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetaData } from '../../../../libs/shared/interfaces';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, unique: true })
  loyverse_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

// Create index on loyverse_id
SupplierSchema.index({ loyverse_id: 1 }, { unique: true });
