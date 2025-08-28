import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {

  @ApiProperty({ example: 'Ticket de métro Paris', description: 'Nom du ticket' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Accès illimité au métro, tram et bus pendant 1 jour', description: 'Description du ticket' })
  @IsString()
  shortText: string;

  @ApiProperty({ example: 7.5, description: 'Prix du ticket en euros' })
  @IsNumber({}, { message: 'Le prix unitaire doit être un nombre (ex: 12.99).' })
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isSaleable: boolean;

  @ApiProperty({ example: 'http://urlimage.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({ example: 5, required: false, description: 'Quantité max par commande' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  orderMaxQuantity?: number;

  @ApiProperty({ example: ['ETUDIANT', 'PMR'], required: false, description: 'Profils autorisés' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedProfileCodes?: string[];


  @ApiProperty()
  @IsOptional()
  @IsInt()
  vatRate :number;

}
