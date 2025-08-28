import { ApiProperty } from '@nestjs/swagger';

export class DeleteOrderResponseDto {
  @ApiProperty({ example: 'Commande supprimée avec succès' })
  message: string;

  @ApiProperty({ example: 'uuid-order-123' })
  orderId: string;
}
