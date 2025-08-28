import { CreateAddressDto } from './create-address.dto';
declare const UpdateAddressDto_base: import("@nestjs/common").Type<Partial<CreateAddressDto>>;
export declare class UpdateAddressDto extends UpdateAddressDto_base {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
}
export {};
