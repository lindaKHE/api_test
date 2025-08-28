
import { ApiProperty } from '@nestjs/swagger';
export class AddressResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'e89b-12d3-a456-426614174000' })
   userId: string;   

  @ApiProperty({ example: ' rue des Fleurs' })
  street: string;
  
  @ApiProperty({ example: 'Paris' })
  city: string;
  
  @ApiProperty({ example: '75001' })
  postalCode: string;

  @ApiProperty({ example: 'Jean Dupont' })
  userName?: string;
 
  @ApiProperty({ example: 'France' })
  country: string;
}
