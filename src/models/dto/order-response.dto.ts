import { ApiProperty } from '@nestjs/swagger';

export class OrderArticleResponseDto {
  @ApiProperty({ example: 'uuid-article-123' })
  id: string;

  @ApiProperty({ example: 2 })
  quantity: number;


  @ApiProperty({
    description: 'Informations sur le produit',
    example: {
      id: 123,
      name: 'Produit XYZ',
      shortText: 'Description courte du produit',
      unitPrice: 99.99,
      picture: 'https://example.com/image.jpg',
    },
  })
  product: {
    id: number;
    name: string;
    shortText: string;
    unitPrice: number;
    picture?: string;
  };
}

export class OrderResponseDto {
  @ApiProperty({ example: 'uuid-order-123' })
  id: string;

  @ApiProperty({ example: 120.60 })
totalHtAmount: number;


  @ApiProperty({ example: 'uuid-user-456' })
  userId: string;

  @ApiProperty({ example: 'uuid-customer-789' })
  customerId: string;

  @ApiProperty({ example: '2025-07-18T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: 150.75 })
  totalAmount: number;

  @ApiProperty({ example: 30.15 })
  totalVatAmount: number;

  @ApiProperty({ example: 'DELIVERED' })
  status: string;

  @ApiProperty({
    description: 'Informations sur le client',
    example: {
      firstname: 'Jean',
      name: 'Dupont',
    },
  })
  customer: {
    firstname: string;
    name: string;
  };

  @ApiProperty({ type: [OrderArticleResponseDto] })
  articles: OrderArticleResponseDto[];

  
}
