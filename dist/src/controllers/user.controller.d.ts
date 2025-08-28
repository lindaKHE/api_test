import { UserService } from 'src/service/user.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
import { EUserSortColumn, EOrderSort } from 'src/interfaces/user.interface';
import { Response } from 'express';
import { AddressService } from 'src/service/address.service';
import { User } from '@prisma/client';
import { CreateChildDto } from 'src/models/dto/create-child.dto';
export declare class UserController {
    private readonly userService;
    private addressService;
    constructor(userService: UserService, addressService: AddressService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getMe(currentUser: User): Promise<UserResponseDto>;
    getUsers(res: Response, page?: string, limit?: string, sortBy?: EUserSortColumn, sortOrder?: EOrderSort): Promise<void>;
    getChildren(res: Response, user: User, page?: string, limit?: string, sortBy?: EUserSortColumn, sortOrder?: EOrderSort): Promise<void>;
    getAllByUser(userId: string, currentUser: User): Promise<{
        id: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
        createdAt: Date;
    }[]>;
    getById(id: string, currentUser: any): Promise<UserResponseDto>;
    createChild(user: User, dto: CreateChildDto): Promise<UserResponseDto>;
    updateUser(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<UserResponseDto>;
    deleteChild(user: User, childId: string): Promise<UserResponseDto>;
    deleteUser(id: string): Promise<UserResponseDto>;
    removeProfilesFromUser(id: string, body: {
        profileCodes: string[];
    }): Promise<UserResponseDto>;
}
