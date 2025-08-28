import { AddressResponseDto } from "./address-response.dto";

export class UserDto {
  id: string;
  name: string;
  firstname?: string;
  birthdate?: string;
  username: string;

  gender?: string;
  createdAt: string;
  addresses?: AddressResponseDto[];
  profiles?: {
    explicites: { code: string; label: string }[];
    implicite: { code: string; label: string } | null;
  };
  password? : string;

}