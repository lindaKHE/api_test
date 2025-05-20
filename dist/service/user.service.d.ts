import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { FilterUserQuery } from 'src/models/dto/filter-user.query';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
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
        gender: string | null;
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
