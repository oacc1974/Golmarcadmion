import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class WebhookPayloadDto {
  @ApiProperty({ example: 'evt_12345' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'receipt.created' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: { id: 'rec_12345', store_id: 'str_001' } })
  @IsObject()
  @IsNotEmpty()
  data: any;
}
