import { IsArray, IsInt, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {  ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderArticleDto {
  @ApiProperty({ example: 123 })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  quantity: number;

 
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'UUID du client pour qui la commande est faite (optionnel si le parent commande pour lui-même)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'le format de cet id est incorrect Le customerId doit être un UUID valide.' })
  customerId?: string;

  @ApiProperty({
    description: 'Liste des articles de la commande',
    type: [OrderArticleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderArticleDto)
  articles: OrderArticleDto[];
}
