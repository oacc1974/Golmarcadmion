import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsDate, IsOptional, IsArray, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MetaData, Payment, LineItem } from '../../../../../libs/shared/interfaces';

export class CreateReceiptDto {
  @ApiProperty({ example: 'REC_12345' })
  @IsString()
  @IsNotEmpty()
  loyverse_id: string;

  @ApiProperty({ example: 'STR_001' })
  @IsString()
  @IsNotEmpty()
  store_id: string;

  @ApiProperty({ example: '1001' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'closed', enum: ['closed', 'refunded', 'void'] })
  @IsEnum(['closed', 'refunded', 'void'])
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: '2025-08-01T10:00:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  created_at: Date;

  @ApiProperty({ example: '2025-08-01T10:15:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  closed_at: Date;

  @ApiProperty({ example: '60d5f03c3e4f4a001f3e9999' })
  @IsString()
  @IsOptional()
  employee_id?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  employee_name?: string;

  @ApiProperty({ example: 'CUS_001' })
  @IsString()
  @IsOptional()
  customer_id?: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @ApiProperty({ example: 10.00 })
  @IsNumber()
  @IsNotEmpty()
  discount_total: number;

  @ApiProperty({ example: 15.00 })
  @IsNumber()
  @IsNotEmpty()
  tax_total: number;

  @ApiProperty({ example: 105.50 })
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty({
    example: [
      { method: 'cash', amount: 50.00 },
      { method: 'card', amount: 55.50 }
    ]
  })
  @IsArray()
  @IsNotEmpty()
  payments: Payment[];

  @ApiProperty({
    example: [
      {
        item_loyverse_id: 'ITM_001',
        name: 'Product 1',
        category: 'Category A',
        quantity: 2,
        price: 25.00,
        discount: 0,
        tax: 7.50,
        total: 57.50
      }
    ]
  })
  @IsArray()
  @IsNotEmpty()
  line_items: LineItem[];

  @ApiProperty({ example: 'SFT_001' })
  @IsString()
  @IsOptional()
  shift_id?: string;

  @ApiProperty({
    example: {
      source: 'loyverse',
      synced_at: '2025-08-01T10:30:00Z',
      last_modified_at: '2025-08-01T10:15:00Z',
      schema_version: 1
    }
  })
  @IsObject()
  @IsNotEmpty()
  meta: MetaData;
}
