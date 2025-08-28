import { IsOptional, IsBooleanString, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsDto {
  @IsOptional()
  @IsBooleanString()
  isSaleable?: string;

  @IsOptional()
  @IsString()
  allowedProfileCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
