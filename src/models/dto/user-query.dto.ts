import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'linda' })
  name?: string;
}
