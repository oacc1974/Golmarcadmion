import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../../../../../libs/shared/interfaces';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ example: ['STR_001', 'STR_002'], type: [String] })
  @IsArray()
  @IsOptional()
  store_ids?: string[];
}
