import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class SyncRangeDto {
  @ApiProperty({ required: false, example: 'STR_001' })
  @IsString()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ example: '2025-08-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-08-31' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
