import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryReceiptDto {
  @ApiProperty({ required: false, example: 'STR_001' })
  @IsString()
  @IsOptional()
  store_id?: string;

  @ApiProperty({ required: false, example: '60d5f03c3e4f4a001f3e9999' })
  @IsString()
  @IsOptional()
  employee_id?: string;

  @ApiProperty({ required: false, example: '2025-08-01' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ required: false, example: '2025-08-31' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({ required: false, enum: ['closed', 'refunded', 'void'] })
  @IsEnum(['closed', 'refunded', 'void'])
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, default: 10, example: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, default: 1, example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;
}
