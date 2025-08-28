import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: '10 rue des Lilas' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '75000' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @ApiProperty({ example: 'cl13n7ID' }) 
  @IsString()
  userId?: string;
}
