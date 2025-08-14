import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetaData } from '../../../../libs/shared/interfaces';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  loyverse_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  role: string;

  @Prop({ type: [String], default: [] })
  store_ids: string[];

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Create indices
EmployeeSchema.index({ loyverse_id: 1 }, { unique: true });
EmployeeSchema.index({ store_ids: 1 });
