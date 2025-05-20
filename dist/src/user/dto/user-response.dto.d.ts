export declare class UserResponseDto {
    id: string;
    name: string;
    firstname?: string;
    birthdate?: Date;
    createdAt: string;
    addresses?: AddressResponseDto[];
}
export declare class AddressResponseDto {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}
