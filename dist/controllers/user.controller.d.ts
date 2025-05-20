import { UserService } from 'src/service/user.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { FilterUserQuery } from 'src/models/dto/filter-user.query';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getAllUsers(filter: FilterUserQuery): Promise<UserResponseDto[]>;
    getById(id: string): Promise<{
        name: string | null;
        id: string;
        username: string | null;
        password: string | null;
        gender: string | null;
        firstname: string | null;
        birthdate: Date | null;
        createdAt: Date;
    } & {
        addresses?: import(".prisma/client").Address[];
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
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
}
