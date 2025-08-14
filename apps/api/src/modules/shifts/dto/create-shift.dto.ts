import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MetaData } from '../../../../../libs/shared/interfaces';

export class CreateShiftDto {
  @ApiProperty({ required: false, example: 'SFT_12345' })
  @IsString()
  @IsOptional()
  loyverse_id?: string;

  @ApiProperty({ example: 'STR_001' })
  @IsString()
  @IsNotEmpty()
  store_id: string;

  @ApiProperty({ example: '2025-08-01T08:00:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  opened_at: Date;

  @ApiProperty({ example: '2025-08-01T16:00:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  closed_at: Date;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @IsNotEmpty()
  opening_cash: number;

  @ApiProperty({ required: false, example: 500.00 })
  @IsNumber()
  @IsOptional()
  cash_sales?: number;

  @ApiProperty({ required: false, example: 750.00 })
  @IsNumber()
  @IsOptional()
  card_sales?: number;

  @ApiProperty({ required: false, example: 50.00 })
  @IsNumber()
  @IsOptional()
  other_sales?: number;

  @ApiProperty({ required: false, example: 600.00 })
  @IsNumber()
  @IsOptional()
  expected_cash?: number;

  @ApiProperty({ example: 598.50 })
  @IsNumber()
  @IsNotEmpty()
  counted_cash: number;

  @ApiProperty({ required: false, example: -1.50 })
  @IsNumber()
  @IsOptional()
  cash_difference?: number;

  @ApiProperty({ required: false, example: 0.00 })
  @IsNumber()
  @IsOptional()
  pay_in_total?: number;

  @ApiProperty({ required: false, example: 0.00 })
  @IsNumber()
  @IsOptional()
  pay_out_total?: number;

  @ApiProperty({ required: false, example: 'Shift notes here' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: {
      source: 'loyverse',
      synced_at: '2025-08-01T16:30:00Z',
      last_modified_at: '2025-08-01T16:00:00Z',
      schema_version: 1
    }
  })
  @IsObject()
  @IsNotEmpty()
  meta: MetaData;
}
