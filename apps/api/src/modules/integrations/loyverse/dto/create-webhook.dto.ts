import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsEnum, IsArray } from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://example.com/webhook' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'My Webhook' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: ['receipt.created', 'shift.created'], 
    description: 'Event types to subscribe to' 
  })
  @IsArray()
  @IsNotEmpty()
  event_types: string[];
}
