import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Nom du produit' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description courte' })
  @IsOptional()
  @IsString()
  shortText?: string;

  @ApiPropertyOptional({ description: 'Prix unitaire' })
  @IsOptional()
  @IsInt()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Indique si le produit est vendable' })
  @IsOptional()
  @IsBoolean()
  isSaleable?: boolean;

  @ApiPropertyOptional({ description: 'URL de l\'image' })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({ description: 'Quantité maximale par commande' })
  @IsOptional()
  @IsInt()
  orderMaxQuantity?: number;
}
