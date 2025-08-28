import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Identifiant unique du produit' })
  id: number;

  @ApiProperty({ example: 'Ticket de métro Paris', description: 'Nom du produit' })
  name: string;

  @ApiProperty({
    example: 'Accès illimité au métro et bus zones 1-2 pendant 1 jour',
    description: 'Description courte du produit',
  })
  shortText: string;

  @ApiProperty({ example: 7.5, description: 'Prix unitaire en euros' })
  unitPrice: number;

  @ApiProperty({ example: true, description: 'Le produit est-il vendable ?' })
  isSaleable: boolean;

  @ApiProperty({
    example: 'https://tickets.sncf.fr/images/paris-ticket.jpg',
    required: false,
    description: 'URL de l’image du produit',
  })
  picture?: string;

  @ApiProperty({
    example: 5,
    required: false,
    description: 'Quantité maximale commandable',
  })
  orderMaxQuantity?: number;

  @ApiProperty({
    example: 5,
    description: 'Taux de TVA appliqué',
  })
  vatRate: number;

  @ApiProperty({
    type: 'array',
    required: false,
    description: 'Liste des profils autorisés',
    example: [
      { id: '1', code: 'ETUDIANT', label: 'Étudiant' },
      { id: '2', code: 'PMR', label: 'Personne à mobilité réduite' },
    ],
  })
  allowedProfiles?: {
    id: string;
    code: string;
    label: string;
  }[];
}
