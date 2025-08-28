import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterUserQuery {
  @ApiPropertyOptional({ example: 'linda' })
  @IsOptional()
  @IsString()
  name?: string;
  profileCode?: string; 
}
