import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { AddressResponseDto } from './dto/address-response.dto';

export class PaginatedAddressResponseDto {

  @ApiProperty({ type: [AddressResponseDto] })
  data: AddressResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: 50 })
  totalItems: number;
}
