import { EGender, ERole } from 'src/interfaces/user.interface';
export declare class CreateUserDto {
    gender?: EGender;
    username: string;
    password?: string;
    profileCodes?: string[];
    name: string;
    firstname?: string;
    birthdate?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    role?: ERole;
    parentId?: string;
}
