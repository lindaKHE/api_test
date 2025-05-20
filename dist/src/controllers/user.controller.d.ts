import { UserService } from 'src/service/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { FilterUserQuery } from 'src/user/dto/filter-user.query';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getAllUsers(filter: FilterUserQuery): Promise<UserResponseDto[]>;
    getById(id: string): Promise<UserResponseDto>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
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
}
