import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { FilterUserQuery } from 'src/user/dto/filter-user.query';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { Address, User } from '@prisma/client';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private transformToUserResponseDto;
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    deleteUser(id: string): Promise<{
        name: string | null;
        id: string;
        username: string | null;
        password: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        firstname: string | null;
        birthdate: Date | null;
        createdAt: Date;
    }>;
    findByUsername(username: string): Promise<User | null>;
    getUserById(id: string): Promise<User & {
        addresses?: Address[];
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    getAllUsers(filter: FilterUserQuery): Promise<UserResponseDto[]>;
}
