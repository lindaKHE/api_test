import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @ApiProperty({ example: 'rue pasteur ', required: false })
  street?: string;

  @ApiProperty({ example: 'Paris', required: false })
  city?: string;

  @ApiProperty({ example: '75000', required: false })
  postalCode?: string;

  @ApiProperty({ example: 'France', required: false })
  country?: string;
}
