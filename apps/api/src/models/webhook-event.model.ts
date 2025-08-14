import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetaData } from '../../../../libs/shared/interfaces';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ required: true, unique: true })
  event_id: string;

  @Prop({ required: true })
  event_type: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ default: false })
  processed: boolean;

  @Prop({ type: Date })
  processed_at: Date;

  @Prop()
  error: string;

  @Prop({ type: Object, required: true })
  meta: MetaData;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

// Create indices
WebhookEventSchema.index({ event_id: 1 }, { unique: true });
WebhookEventSchema.index({ processed: 1, event_type: 1 });

// Optional TTL index for automatic expiration after 30 days
WebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
