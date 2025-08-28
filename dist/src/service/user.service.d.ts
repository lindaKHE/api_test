import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { FilterUserQuery } from 'src/models/dto/filter-user.query';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
import { Address, User } from '@prisma/client';
import { AddressResponseDto } from 'src/models/dto/address-response.dto';
import { EOrderSort, EUserSortColumn, IPaginatedUsers } from 'src/interfaces/user.interface';
import { CreateChildDto } from 'src/models/dto/create-child.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    transformToUserResponseDto(user: User & {
        addresses?: Address[];
        profiles?: {
            code: string;
            label: string;
        }[];
    }): UserResponseDto;
    transformToAddressResponseDto(address: Address & {
        user?: {
            name: string;
        };
    }): AddressResponseDto;
    isChildOfParent(parentId: string, childId: string): Promise<boolean>;
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto | string>;
    createChild(parentId: string, createUserDto: CreateChildDto): Promise<UserResponseDto | string>;
    getMyChildren(parentId: string, page: number, limit: number, sortBy?: EUserSortColumn, sortOrder?: EOrderSort): Promise<{
        data: UserResponseDto[];
        pageCount: number;
        resultCount: number;
    }>;
    deleteChild(parentId: string, childId: string): Promise<UserResponseDto>;
    deleteUser(id: string): Promise<UserResponseDto>;
    removeProfilesFromUser(userId: string, profileCodes: string[]): Promise<User | 'NOT_FOUND' | 'NOT_LINKED'>;
    findByUserPassword(username: string): Promise<string | null>;
    findByusername(username: string): Promise<User | null>;
    getUserById(id: string): Promise<UserResponseDto | null>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    getAllUsers(filter: FilterUserQuery): Promise<UserResponseDto[]>;
    getPaginatedUsers(page: number, limit: number, sortBy?: EUserSortColumn, sortOrder?: EOrderSort): Promise<IPaginatedUsers>;
}
