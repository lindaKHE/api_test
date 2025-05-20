
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'khelifa' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'linda' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({ example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  password?: string;
  
  @IsOptional()
  @IsString()
  username?: string;
}
