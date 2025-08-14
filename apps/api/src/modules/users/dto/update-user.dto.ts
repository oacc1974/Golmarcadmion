import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../../../../../libs/shared/interfaces';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ example: ['STR_001', 'STR_002'], type: [String] })
  @IsArray()
  @IsOptional()
  store_ids?: string[];
}
