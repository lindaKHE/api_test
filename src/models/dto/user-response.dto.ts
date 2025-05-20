import { EGender } from "src/interfaces/user.interface";

export class UserResponseDto {
    id: string;
    name: string;
    firstname?: string;
    birthdate?: Date;
    gender?: EGender; // yekelbou , string 
    createdAt: string; 
    addresses?: AddressResponseDto[]
  }
  export class AddressResponseDto {
    street: string;
    city: string;
    postalCode: string; 
    country: string;
  }
  