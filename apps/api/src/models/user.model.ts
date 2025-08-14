import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../../libs/shared/interfaces';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ 
    required: true, 
    enum: Object.values(UserRole),
    default: UserRole.CASHIER
  })
  role: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: [String], default: [] })
  store_ids: string[];

  @Prop({ type: Date })
  last_login: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indices
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ store_ids: 1 });
