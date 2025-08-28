import { AddressResponseDto } from './dto/address-response.dto';
export declare class PaginatedAddressResponseDto {
    data: AddressResponseDto[];
    page: number;
    totalPages: number;
    totalItems: number;
}
